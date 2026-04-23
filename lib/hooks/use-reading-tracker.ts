"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  MAX_READING_SESSIONS_PER_LESSON,
  POINT_VALUES,
  READING_HEARTBEAT_INTERVAL_MS,
} from "@/lib/constants";
import { callAwardReadingPoints } from "@/lib/firebase/functions";

interface UseReadingTrackerOptions {
  courseId: string;
  lessonId: string;
  enabled: boolean;
}

/**
 * Tracks how long the user has spent on a lesson page and awards a small
 * reading-session bonus every 30 seconds, up to the per-lesson cap.
 *
 * Rules enforced server-side (this hook just signals):
 *  - Minimum 30s of elapsed time before a claim is accepted
 *  - Max 3 sessions per lesson (award indexed 0..2)
 *  - Awards are idempotent per (userId, lessonId, sessionIndex) — a reload
 *    or re-mount can't double-dip
 *
 * The hook pauses its timer when the tab is hidden so someone can't leave the
 * page open overnight and rack up points. When the tab becomes visible again
 * the timer resumes from where it left off.
 */
export function useReadingTracker({
  courseId,
  lessonId,
  enabled,
}: UseReadingTrackerOptions) {
  const sessionRef = useRef(0);
  const secondsRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!enabled || !lessonId || !courseId) return;

    // Reset counters whenever the lesson changes.
    sessionRef.current = 0;
    secondsRef.current = 0;
    busyRef.current = false;

    let last = Date.now();

    const tick = async () => {
      if (sessionRef.current >= MAX_READING_SESSIONS_PER_LESSON) return;
      if (typeof document !== "undefined" && document.hidden) {
        // Paused — don't accumulate while the tab is hidden.
        last = Date.now();
        return;
      }
      const now = Date.now();
      secondsRef.current += (now - last) / 1000;
      last = now;

      const threshold =
        READING_HEARTBEAT_INTERVAL_MS / 1000; // e.g. 30
      if (secondsRef.current >= threshold && !busyRef.current) {
        busyRef.current = true;
        const thisSession = sessionRef.current;
        const secondsForThisClaim = Math.floor(secondsRef.current);
        try {
          const res = await callAwardReadingPoints({
            courseId,
            lessonId,
            sessionIndex: thisSession,
            secondsRead: secondsForThisClaim,
          });
          if (res.data.awarded) {
            toast.success(
              `+${POINT_VALUES.READING_SESSION} pts for reading`,
              { duration: 2500 }
            );
          }
        } catch {
          // Silently swallow — reading points are a nice-to-have; don't spam.
        } finally {
          sessionRef.current += 1;
          secondsRef.current = 0;
          busyRef.current = false;
        }
      }
    };

    const interval = setInterval(tick, 5_000);
    const onVisibility = () => {
      // Reset `last` so the time during hidden state doesn't count.
      last = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, courseId, lessonId]);
}
