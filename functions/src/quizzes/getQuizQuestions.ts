import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertAuthed } from "../shared/guards";

interface Input {
  quizId: string;
}

interface PublicQuestion {
  id: string;
  prompt: string;
  choices: string[];
  order: number;
}

// Returns the quiz's questions WITHOUT the `correctIndex` field.
// Clients are blocked from reading the questions subcollection directly by
// security rules; they must call this instead.
export const getQuizQuestions = onCall<Input, Promise<{ questions: PublicQuestion[] }>>(
  async (req) => {
    assertAuthed(req);
    const { quizId } = req.data;
    if (!quizId) throw new HttpsError("invalid-argument", "Missing quizId.");

    const db = getFirestore();
    const snap = await db
      .collection("quizzes")
      .doc(quizId)
      .collection("questions")
      .orderBy("order", "asc")
      .get();

    const questions: PublicQuestion[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        prompt: data.prompt,
        choices: data.choices,
        order: data.order,
      };
    });

    return { questions };
  }
);
