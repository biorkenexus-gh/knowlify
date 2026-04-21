import type { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "teacher" | "admin";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  points: number;
  coins: number;
  completedCourses: number;
  completedLessons: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
