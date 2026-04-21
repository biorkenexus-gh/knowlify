import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { assertAdmin } from "../shared/guards";

interface Input {
  userId: string;
}

// Deletes the Auth user + their Firestore user doc + cascades (progress,
// bookmarks, attempts, transactions). Last admin is protected.
export const adminDeleteUser = onCall<Input, Promise<{ success: boolean }>>(
  async (req) => {
    const callerUid = assertAdmin(req);
    const { userId } = req.data;
    if (!userId) throw new HttpsError("invalid-argument", "Missing userId.");
    if (userId === callerUid) {
      throw new HttpsError("failed-precondition", "Cannot delete yourself.");
    }

    const db = getFirestore();
    const userSnap = await db.collection("users").doc(userId).get();
    if (!userSnap.exists) throw new HttpsError("not-found", "User not found.");

    if (userSnap.data()?.role === "admin") {
      const admins = await db
        .collection("users")
        .where("role", "==", "admin")
        .count()
        .get();
      if (admins.data().count <= 1) {
        throw new HttpsError(
          "failed-precondition",
          "Cannot delete the last admin."
        );
      }
    }

    // Cascade delete — batched to respect Firestore's 500-per-batch limit.
    const scopes = [
      db.collection("progress").where("userId", "==", userId),
      db.collection("bookmarks").where("userId", "==", userId),
      db.collection("attempts").where("userId", "==", userId),
      db.collection("transactions").where("userId", "==", userId),
    ];
    for (const q of scopes) {
      const snap = await q.get();
      const chunks: typeof snap.docs[] = [];
      for (let i = 0; i < snap.docs.length; i += 450) {
        chunks.push(snap.docs.slice(i, i + 450));
      }
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await db.collection("users").doc(userId).delete();

    try {
      await getAuth().deleteUser(userId);
    } catch (err) {
      // Auth record might already be gone — that's fine.
    }

    return { success: true };
  }
);
