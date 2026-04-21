import type { Timestamp } from "firebase/firestore";

export interface QuizDoc {
  id: string;
  title: string;
  courseId: string | null;
  lessonId: string | null;
  timeLimitSeconds: number;
  passingScore: number;
  pointsReward: number;
  questionCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Stored shape (server-side only — has correctIndex)
export interface QuestionDoc {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  order: number;
}

// Client-safe shape returned from `getQuizQuestions` callable
export interface PublicQuestion {
  id: string;
  prompt: string;
  choices: string[];
  order: number;
}
