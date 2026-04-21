import { FieldValue, getFirestore } from "firebase-admin/firestore";

// Canonical, server-side point values. Keep in sync with `lib/constants.ts`
// on the client — if there's a mismatch, the server always wins.
export const POINT_VALUES = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS_BASE: 50,
  READING_SESSION: 2,
} as const;

export const POINTS_PER_COIN = 1;

export type LedgerType =
  | "lesson_complete"
  | "quiz_pass"
  | "reading_session"
  | "admin_grant"
  | "admin_revoke";

export interface AwardOptions {
  userId: string;
  points: number;
  type: LedgerType;
  refCollection: "lessons" | "quizzes" | null;
  refId: string | null;
}

// Single source of truth for awarding points. Always call this — never update
// users.points/coins directly. Runs inside a transaction so the ledger entry
// and the balance increment are atomic.
export async function award(opts: AwardOptions): Promise<{ newBalance: number }> {
  const { userId, points, type, refCollection, refId } = opts;
  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const txRef = db.collection("transactions").doc();
  const coins = Math.floor(points / POINTS_PER_COIN);

  return db.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists) {
      throw new Error(`User ${userId} not found`);
    }
    const current = (userSnap.data()?.points as number) ?? 0;
    const newBalance = current + points;

    t.update(userRef, {
      points: FieldValue.increment(points),
      coins: FieldValue.increment(coins),
      updatedAt: FieldValue.serverTimestamp(),
    });
    t.set(txRef, {
      userId,
      type,
      points,
      coins,
      refCollection,
      refId,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { newBalance };
  });
}

// Idempotent variant: refuses to award twice for the same (userId, type, refId).
// Implemented by deriving a deterministic transaction doc id and using `create`.
export async function awardOnce(
  opts: AwardOptions
): Promise<{ awarded: boolean; newBalance: number }> {
  const db = getFirestore();
  const dedupeId = `${opts.userId}_${opts.type}_${opts.refId ?? "none"}`;
  const userRef = db.collection("users").doc(opts.userId);
  const txRef = db.collection("transactions").doc(dedupeId);
  const coins = Math.floor(opts.points / POINTS_PER_COIN);

  return db.runTransaction(async (t) => {
    const [userSnap, txSnap] = await Promise.all([t.get(userRef), t.get(txRef)]);
    if (txSnap.exists) {
      const data = userSnap.data();
      return { awarded: false, newBalance: (data?.points as number) ?? 0 };
    }
    if (!userSnap.exists) {
      throw new Error(`User ${opts.userId} not found`);
    }
    t.update(userRef, {
      points: FieldValue.increment(opts.points),
      coins: FieldValue.increment(coins),
      updatedAt: FieldValue.serverTimestamp(),
    });
    t.set(txRef, {
      userId: opts.userId,
      type: opts.type,
      points: opts.points,
      coins,
      refCollection: opts.refCollection,
      refId: opts.refId,
      createdAt: FieldValue.serverTimestamp(),
    });
    const current = (userSnap.data()?.points as number) ?? 0;
    return { awarded: true, newBalance: current + opts.points };
  });
}
