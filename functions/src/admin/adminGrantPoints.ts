import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assertAdmin } from "../shared/guards";
import { award } from "../shared/points";

interface Input {
  userId: string;
  points: number;
  reason: string;
}

// Grants (positive) or revokes (negative) points with a ledger entry.
export const adminGrantPoints = onCall<
  Input,
  Promise<{ success: boolean; newBalance: number }>
>(async (req) => {
  assertAdmin(req);
  const { userId, points, reason } = req.data;
  if (!userId || typeof points !== "number" || !Number.isFinite(points)) {
    throw new HttpsError("invalid-argument", "Bad input.");
  }
  if (!reason || reason.length < 2) {
    throw new HttpsError("invalid-argument", "Reason required.");
  }

  const { newBalance } = await award({
    userId,
    points,
    type: points >= 0 ? "admin_grant" : "admin_revoke",
    refCollection: null,
    refId: reason.slice(0, 140),
  });
  return { success: true, newBalance };
});
