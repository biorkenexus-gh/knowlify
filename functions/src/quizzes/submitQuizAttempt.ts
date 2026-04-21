import {
  HttpsError,
  onCall,
  type CallableRequest,
} from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { assertAuthed } from "../shared/guards";

interface Input {
  quizId: string;
  answers: number[];
  timeTakenSeconds: number;
  clientNonce: string;
}

interface Output {
  attemptId: string;
  score: number;
  passed: boolean;
  pointsAwarded: number;
  correctAnswers: number[];
  explanations: string[];
}

const MIN_TIME_PER_QUESTION_SECONDS = 2;
const MAX_ATTEMPTS_PER_DAY = 3;

// Transactionally grades a quiz, writes the attempt doc, and awards points
// on pass. Idempotent by (userId, quizId, clientNonce) — a retry within the
// same session gets the same result instead of a double award.
export const submitQuizAttempt = onCall<Input, Promise<Output>>(async (req: CallableRequest<Input>) => {
  const userId = assertAuthed(req);
  const { quizId, answers, timeTakenSeconds, clientNonce } = req.data;

  if (!quizId || !Array.isArray(answers) || typeof clientNonce !== "string") {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = getFirestore();
  const quizRef = db.collection("quizzes").doc(quizId);
  const questionsCol = quizRef.collection("questions");
  const dedupeId = `${userId}_${quizId}_${clientNonce}`;
  const attemptRef = db.collection("attempts").doc(dedupeId);

  // Rate limit: too many attempts in 24h.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await db
    .collection("attempts")
    .where("userId", "==", userId)
    .where("quizId", "==", quizId)
    .where("submittedAt", ">=", dayAgo)
    .get();
  if (recent.size >= MAX_ATTEMPTS_PER_DAY) {
    throw new HttpsError(
      "resource-exhausted",
      `Max ${MAX_ATTEMPTS_PER_DAY} attempts per 24 hours.`
    );
  }

  const [quizSnap, questionsSnap] = await Promise.all([
    quizRef.get(),
    questionsCol.orderBy("order", "asc").get(),
  ]);
  if (!quizSnap.exists) {
    throw new HttpsError("not-found", "Quiz not found.");
  }
  const quiz = quizSnap.data()!;
  const questions = questionsSnap.docs.map((d) => d.data());

  if (answers.length !== questions.length) {
    throw new HttpsError(
      "invalid-argument",
      `Expected ${questions.length} answers, got ${answers.length}.`
    );
  }

  // Anti-cheat: implausibly fast submissions.
  if (timeTakenSeconds < questions.length * MIN_TIME_PER_QUESTION_SECONDS) {
    throw new HttpsError(
      "failed-precondition",
      "Submission too fast — are you sure you read the questions?"
    );
  }

  // Score server-side.
  let correct = 0;
  const correctAnswers: number[] = [];
  const explanations: string[] = [];
  questions.forEach((q, i) => {
    correctAnswers.push(q.correctIndex);
    explanations.push(q.explanation ?? "");
    if (answers[i] === q.correctIndex) correct++;
  });
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (quiz.passingScore ?? 70);
  const pointsAwarded = passed ? (quiz.pointsReward ?? 50) : 0;

  // Write attempt + award points atomically.
  await db.runTransaction(async (t) => {
    const existing = await t.get(attemptRef);
    if (existing.exists) return; // idempotent retry

    t.set(attemptRef, {
      userId,
      quizId,
      courseId: quiz.courseId ?? null,
      lessonId: quiz.lessonId ?? null,
      answers,
      score,
      passed,
      pointsAwarded,
      timeTakenSeconds,
      submittedAt: FieldValue.serverTimestamp(),
    });

    if (passed && pointsAwarded > 0) {
      const userRef = db.collection("users").doc(userId);
      const ledgerRef = db.collection("transactions").doc();
      t.update(userRef, {
        points: FieldValue.increment(pointsAwarded),
        coins: FieldValue.increment(pointsAwarded),
        updatedAt: FieldValue.serverTimestamp(),
      });
      t.set(ledgerRef, {
        userId,
        type: "quiz_pass",
        points: pointsAwarded,
        coins: pointsAwarded,
        refCollection: "quizzes",
        refId: quizId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });

  logger.info("quiz attempt graded", {
    userId,
    quizId,
    score,
    passed,
    pointsAwarded,
  });

  return {
    attemptId: dedupeId,
    score,
    passed,
    pointsAwarded,
    correctAnswers,
    explanations,
  };
});
