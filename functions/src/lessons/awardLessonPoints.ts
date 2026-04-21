import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { awardOnce } from "../shared/points";

// Firestore trigger: when a progress/{uid_courseId} doc gains a newly-completed
// lesson, award that lesson's pointsReward once (idempotent) and bump the
// denormalized counters on users/{uid}.
export const awardLessonPoints = onDocumentWritten(
  "progress/{progressId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after) return;

    const beforeIds = new Set<string>(
      (before?.completedLessonIds as string[]) ?? []
    );
    const afterIds = new Set<string>(
      (after.completedLessonIds as string[]) ?? []
    );
    const newlyCompleted = [...afterIds].filter((id) => !beforeIds.has(id));
    if (newlyCompleted.length === 0) return;

    const db = getFirestore();
    const userId = after.userId as string;
    const courseId = after.courseId as string;

    for (const lessonId of newlyCompleted) {
      const lessonSnap = await db
        .collection("courses")
        .doc(courseId)
        .collection("lessons")
        .doc(lessonId)
        .get();
      if (!lessonSnap.exists) continue;
      const reward = (lessonSnap.data()?.pointsReward as number) ?? 0;
      if (reward > 0) {
        await awardOnce({
          userId,
          points: reward,
          type: "lesson_complete",
          refCollection: "lessons",
          refId: lessonId,
        });
      }
    }

    // Denormalized counter on the user doc.
    await db.collection("users").doc(userId).update({
      completedLessons: FieldValue.increment(newlyCompleted.length),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Course completion bump.
    if ((after.percent as number) >= 100 && (before?.percent as number ?? 0) < 100) {
      await db.collection("users").doc(userId).update({
        completedCourses: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await db.collection("progress").doc(event.params.progressId).update({
        completedAt: FieldValue.serverTimestamp(),
      });
    }

    logger.info("lesson points awarded", { userId, courseId, count: newlyCompleted.length });
  }
);
