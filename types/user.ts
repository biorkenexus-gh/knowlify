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
  // Earning system v2 — daily streak + bonus tracking. All CF-write only.
  // YYYY-MM-DD UTC string, or null if the user has never claimed a daily bonus.
  lastBonusClaimedDate: string | null;
  /** Consecutive days the user has claimed a daily bonus. Resets if a day is missed. */
  currentStreak: number;
  /** Historical maximum of currentStreak. Never decreases. */
  longestStreak: number;
  /** Lifetime count of daily bonuses claimed. */
  totalBonusesClaimed: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
