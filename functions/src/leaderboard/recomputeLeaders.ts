import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

// Runs every 5 minutes. Computes the top-100 users by points and writes them
// to leaderboard/all_time as a single doc. Cheaper than each client running
// an orderBy query.
export const recomputeLeaderboard = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "UTC",
  },
  async () => {
    const db = getFirestore();
    const snap = await db
      .collection("users")
      .orderBy("points", "desc")
      .limit(100)
      .get();

    const entries = snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        userId: d.id,
        displayName: (data.displayName as string) ?? "Learner",
        photoURL: (data.photoURL as string | null) ?? null,
        points: (data.points as number) ?? 0,
        rank: idx + 1,
      };
    });

    await db.collection("leaderboard").doc("all_time").set({
      entries,
      updatedAt: FieldValue.serverTimestamp(),
    });
    logger.info("leaderboard recomputed", { count: entries.length });
  }
);
