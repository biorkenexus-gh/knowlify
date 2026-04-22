import {
  collection,
  collectionGroup,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { db } from "./client";
import type {
  AttemptDoc,
  BookmarkDoc,
  CategoryDoc,
  CourseDoc,
  LeaderboardDoc,
  LessonDoc,
  ProgressDoc,
  QuestionDoc,
  QuizDoc,
  TransactionDoc,
  UserDoc,
} from "@/types";

// Generic converter — strips the synthetic `id` field on write, attaches it
// on read from the snapshot's id (which is the canonical Firestore doc id).
// `id` is intentionally optional on the domain types so that creates can omit
// it; reads always populate it via `fromFirestore` below.
function converter<T extends { id?: string }>() {
  return {
    toFirestore(value: Partial<T>) {
      const { id: _id, ...rest } = value as T;
      return rest as Record<string, unknown>;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      return { id: snapshot.id, ...snapshot.data(options) } as T;
    },
  };
}

// ---------- top-level collections ----------
export const usersCol = collection(db, "users").withConverter(
  converter<UserDoc>()
) as CollectionReference<UserDoc>;

export const categoriesCol = collection(db, "categories").withConverter(
  converter<CategoryDoc>()
) as CollectionReference<CategoryDoc>;

export const coursesCol = collection(db, "courses").withConverter(
  converter<CourseDoc>()
) as CollectionReference<CourseDoc>;

export const quizzesCol = collection(db, "quizzes").withConverter(
  converter<QuizDoc>()
) as CollectionReference<QuizDoc>;

export const attemptsCol = collection(db, "attempts").withConverter(
  converter<AttemptDoc>()
) as CollectionReference<AttemptDoc>;

export const progressCol = collection(db, "progress").withConverter(
  converter<ProgressDoc>()
) as CollectionReference<ProgressDoc>;

export const bookmarksCol = collection(db, "bookmarks").withConverter(
  converter<BookmarkDoc>()
) as CollectionReference<BookmarkDoc>;

export const transactionsCol = collection(db, "transactions").withConverter(
  converter<TransactionDoc>()
) as CollectionReference<TransactionDoc>;

export const leaderboardCol = collection(db, "leaderboard").withConverter(
  converter<LeaderboardDoc>()
) as CollectionReference<LeaderboardDoc>;

// ---------- subcollection refs ----------
export function lessonsCol(
  courseId: string
): CollectionReference<LessonDoc> {
  return collection(db, "courses", courseId, "lessons").withConverter(
    converter<LessonDoc>()
  ) as CollectionReference<LessonDoc>;
}

export function questionsCol(
  quizId: string
): CollectionReference<QuestionDoc> {
  return collection(db, "quizzes", quizId, "questions").withConverter(
    converter<QuestionDoc>()
  ) as CollectionReference<QuestionDoc>;
}

export function lessonsGroup(): Query<LessonDoc> {
  return collectionGroup(db, "lessons").withConverter(
    converter<LessonDoc>()
  ) as unknown as Query<LessonDoc>;
}

// ---------- doc refs ----------
export function userDoc(uid: string): DocumentReference<UserDoc> {
  return doc(usersCol, uid);
}
export function courseDoc(courseId: string): DocumentReference<CourseDoc> {
  return doc(coursesCol, courseId);
}
export function lessonDoc(
  courseId: string,
  lessonId: string
): DocumentReference<LessonDoc> {
  return doc(lessonsCol(courseId), lessonId);
}
export function quizDoc(quizId: string): DocumentReference<QuizDoc> {
  return doc(quizzesCol, quizId);
}
export function progressDoc(
  userId: string,
  courseId: string
): DocumentReference<ProgressDoc> {
  return doc(progressCol, `${userId}_${courseId}`);
}
export function bookmarkDoc(
  userId: string,
  courseId: string,
  lessonId: string
): DocumentReference<BookmarkDoc> {
  return doc(bookmarksCol, `${userId}_${courseId}_${lessonId}`);
}
export function leaderboardDoc(period: "all_time" = "all_time") {
  return doc(leaderboardCol, period);
}
