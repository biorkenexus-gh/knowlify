import type { Timestamp } from "firebase/firestore";

export interface AttemptDoc {
  id: string;
  userId: string;
  quizId: string;
  courseId: string | null;
  lessonId: string | null;
  answers: number[];
  score: number;
  passed: boolean;
  pointsAwarded: number;
  timeTakenSeconds: number;
  submittedAt: Timestamp;
}

// Payload the client sends to `submitQuizAttempt`
export interface SubmitQuizAttemptInput {
  quizId: string;
  answers: number[];
  timeTakenSeconds: number;
  clientNonce: string;
}

// What `submitQuizAttempt` returns
export interface SubmitQuizAttemptResult {
  attemptId: string;
  score: number;
  passed: boolean;
  pointsAwarded: number;
  correctAnswers: number[];
  explanations: string[];
}
