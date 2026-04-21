import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { assertAdmin } from "../shared/guards";

interface Input {
  userId: string;
  role: "student" | "teacher" | "admin";
}

// Updates a user's role (Firestore doc + custom claim). Refuses to demote the
// last admin so we can never lock ourselves out.
export const setUserRole = onCall<Input, Promise<{ success: boolean }>>(
  async (req) => {
    assertAdmin(req);
    const { userId, role } = req.data;
    if (!userId || !["student", "teacher", "admin"].includes(role)) {
      throw new HttpsError("invalid-argument", "Bad input.");
    }

    const db = getFirestore();
    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "User not found.");
    const currentRole = snap.data()?.role as string;

    // Last-admin guard
    if (currentRole === "admin" && role !== "admin") {
      const admins = await db
        .collection("users")
        .where("role", "==", "admin")
        .count()
        .get();
      if (admins.data().count <= 1) {
        throw new HttpsError(
          "failed-precondition",
          "Cannot demote the last admin."
        );
      }
    }

    await userRef.update({
      role,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await getAuth().setCustomUserClaims(userId, { role });

    return { success: true };
  }
);
