import type { Timestamp } from "firebase/firestore";

export type TransactionType =
  | "lesson_complete"
  | "quiz_pass"
  | "reading_session"
  | "admin_grant"
  | "admin_revoke";

export interface TransactionDoc {
  id: string;
  userId: string;
  type: TransactionType;
  points: number;
  coins: number;
  refCollection: "lessons" | "quizzes" | null;
  refId: string | null;
  createdAt: Timestamp;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  points: number;
  rank: number;
}

export interface LeaderboardDoc {
  id: string;
  entries: LeaderboardEntry[];
  updatedAt: Timestamp;
}
