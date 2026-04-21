"use client";

import { useEffect, useState } from "react";
import {
  arrayUnion,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { progressDoc } from "@/lib/firebase/firestore";
import { useAuth } from "./use-auth";
import type { ProgressDoc } from "@/types";

export function useProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !courseId) {
      setProgress(null);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      progressDoc(user.uid, courseId),
      (snap) => {
        setProgress(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid, courseId]);

  return { progress, loading };
}

// Marks a lesson complete; awards points happen server-side via the
// `awardLessonPoints` Firestore trigger.
export async function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string,
  totalLessons: number
): Promise<void> {
  await setDoc(
    progressDoc(userId, courseId),
    {
      userId,
      courseId,
      completedLessonIds: arrayUnion(lessonId) as unknown as string[],
      lastLessonId: lessonId,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      // percent is updated optimistically; the CF will recompute canonically
      percent: Math.min(100, Math.round(((1) / Math.max(totalLessons, 1)) * 100)),
    },
    { merge: true }
  );
}
