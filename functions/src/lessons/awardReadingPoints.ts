import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { assertAuthed } from "../shared/guards";
import {
  awardOnce,
  MAX_READING_SESSIONS_PER_LESSON,
  MIN_READING_SECONDS,
  POINT_VALUES,
} from "../shared/points";

interface Input {
  lessonId: string;
  courseId: string;
  /** Zero-based session index. Cap is MAX_READING_SESSIONS_PER_LESSON. */
  sessionIndex: number;
  /** Client-reported elapsed seconds for this session. Server caps with min. */
  secondsRead: number;
}

interface Output {
  awarded: boolean;
  pointsAwarded: number;
  sessionIndex: number;
}

/**
 * Awards a small batch of points for spending real time on a lesson.
 * Idempotent per (userId, lessonId, sessionIndex) via awardOnce — even if the
 * client retries the same heartbeat, points are awarded only once per slot.
 *
 * Anti-cheat:
 *  - sessionIndex must be 0..MAX_READING_SESSIONS_PER_LESSON-1
 *  - secondsRead must be >= MIN_READING_SECONDS
 *  - awardOnce guarantees each session pays out exactly once
 */
export const awardReadingPoints = onCall<Input, Promise<Output>>(async (req) => {
  const userId = assertAuthed(req);
  const { lessonId, courseId, sessionIndex, secondsRead } = req.data ?? {};

  if (!lessonId || !courseId) {
    throw new HttpsError(
      "invalid-argument",
      "Missing lessonId or courseId."
    );
  }
  if (
    typeof sessionIndex !== "number" ||
    sessionIndex < 0 ||
    sessionIndex >= MAX_READING_SESSIONS_PER_LESSON
  ) {
    throw new HttpsError(
      "out-of-range",
      `sessionIndex must be 0..${MAX_READING_SESSIONS_PER_LESSON - 1}.`
    );
  }
  if (typeof secondsRead !== "number" || secondsRead < MIN_READING_SECONDS) {
    throw new HttpsError(
      "failed-precondition",
      `Minimum ${MIN_READING_SECONDS}s of reading required per session.`
    );
  }

  const result = await awardOnce({
    userId,
    points: POINT_VALUES.READING_SESSION,
    type: "reading_session",
    refCollection: "lessons",
    refId: `${lessonId}_${sessionIndex}`,
  });

  logger.info("reading session", {
    userId,
    lessonId,
    sessionIndex,
    awarded: result.awarded,
  });

  return {
    awarded: result.awarded,
    pointsAwarded: result.awarded ? POINT_VALUES.READING_SESSION : 0,
    sessionIndex,
  };
});
