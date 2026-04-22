import type { Timestamp } from "firebase/firestore";

export type LessonContentType = "pdf" | "video" | "text";

export interface LessonDoc {
  id?: string;
  title: string;
  order: number;
  contentType: LessonContentType;
  contentUrl: string | null;
  body: string | null;
  durationMinutes: number;
  quizId: string | null;
  pointsReward: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProgressDoc {
  id?: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  percent: number;
  lastLessonId: string;
  lastAccessedAt: Timestamp;
  completedAt: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BookmarkDoc {
  id?: string;
  userId: string;
  courseId: string;
  lessonId: string;
  createdAt: Timestamp;
}
