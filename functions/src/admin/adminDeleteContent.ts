import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { assertAdmin } from "../shared/guards";

interface Input {
  courseId: string;
  hardDelete?: boolean;
}

export const adminDeleteContent = onCall<Input, Promise<{ success: boolean }>>(
  async (req) => {
    assertAdmin(req);
    const { courseId, hardDelete } = req.data;
    if (!courseId) throw new HttpsError("invalid-argument", "Missing courseId.");

    const db = getFirestore();
    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) throw new HttpsError("not-found", "Not found.");

    if (!hardDelete) {
      await courseRef.update({
        status: "deleted",
        published: false,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { success: true };
    }

    const lessons = await courseRef.collection("lessons").get();
    const batch = db.batch();
    lessons.forEach((d) => batch.delete(d.ref));
    batch.delete(courseRef);
    await batch.commit();
    return { success: true };
  }
);
