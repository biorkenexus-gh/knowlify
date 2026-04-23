import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { assertAuthed } from "../shared/guards";
import { POINT_VALUES, POINTS_PER_COIN } from "../shared/points";

interface Output {
  /** True if this call awarded a bonus (false on duplicate same-day claim). */
  awarded: boolean;
  /** Total points awarded (base + streak bonus). 0 if already claimed today. */
  amount: number;
  /** New streak value AFTER this claim. Unchanged if alreadyClaimed. */
  newStreak: number;
  /** New points balance AFTER this claim. */
  newBalance: number;
  /** True if the user already claimed today. */
  alreadyClaimed: boolean;
}

// All streak math is in UTC so users in different timezones get a consistent
// "day" boundary. The trade-off: someone in UTC-12 might get the next day's
// bonus a few hours before midnight in their local time. Acceptable for v1.
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getStreakBonus(streak: number): number {
  if (streak >= 30) return POINT_VALUES.STREAK_30_BONUS;
  if (streak >= 14) return POINT_VALUES.STREAK_14_BONUS;
  if (streak >= 7) return POINT_VALUES.STREAK_7_BONUS;
  return 0;
}

/**
 * Claims today's daily login bonus. Idempotent per user per UTC day — repeat
 * calls in the same day return `alreadyClaimed: true` with no balance change.
 *
 * Streak rules:
 *  - First-ever claim: streak = 1
 *  - Last claim was yesterday (UTC): streak += 1
 *  - Last claim was older than yesterday: streak resets to 1
 *  - Bonus = DAILY_BONUS_BASE + streak-tier bonus (0/10/15/25)
 *
 * The whole thing runs in a single Firestore transaction so concurrent calls
 * can't double-award.
 */
export const claimDailyBonus = onCall<unknown, Promise<Output>>(async (req) => {
  const userId = assertAuthed(req);
  const today = todayUTC();
  const yesterday = yesterdayUTC();

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  // Deterministic ledger doc id = idempotency key.
  const ledgerRef = db
    .collection("transactions")
    .doc(`${userId}_daily_${today}`);

  return db.runTransaction(async (t) => {
    const [userSnap, ledgerSnap] = await Promise.all([
      t.get(userRef),
      t.get(ledgerRef),
    ]);
    if (!userSnap.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }
    const userData = userSnap.data()!;

    if (ledgerSnap.exists || userData.lastBonusClaimedDate === today) {
      return {
        awarded: false,
        amount: 0,
        newStreak: (userData.currentStreak as number) ?? 0,
        newBalance: (userData.points as number) ?? 0,
        alreadyClaimed: true,
      };
    }

    const newStreak =
      userData.lastBonusClaimedDate === yesterday
        ? ((userData.currentStreak as number) ?? 0) + 1
        : 1;

    const baseAmount = POINT_VALUES.DAILY_BONUS_BASE;
    const streakBonus = getStreakBonus(newStreak);
    const totalAmount = baseAmount + streakBonus;
    const coins = Math.floor(totalAmount / POINTS_PER_COIN);
    const newLongest = Math.max(
      (userData.longestStreak as number) ?? 0,
      newStreak
    );

    t.update(userRef, {
      points: FieldValue.increment(totalAmount),
      coins: FieldValue.increment(coins),
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastBonusClaimedDate: today,
      totalBonusesClaimed: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    t.set(ledgerRef, {
      userId,
      type: "daily_bonus",
      points: totalAmount,
      coins,
      refCollection: null,
      refId: today,
      createdAt: FieldValue.serverTimestamp(),
    });

    logger.info("daily bonus claimed", {
      userId,
      newStreak,
      amount: totalAmount,
    });

    return {
      awarded: true,
      amount: totalAmount,
      newStreak,
      newBalance: ((userData.points as number) ?? 0) + totalAmount,
      alreadyClaimed: false,
    };
  });
});
