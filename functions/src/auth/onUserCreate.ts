import { beforeUserCreated } from "firebase-functions/v2/identity";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

// `beforeUserCreated` fires BEFORE the auth record is committed, giving us a
// chance to reject or customize. We use it to seed the Firestore users/{uid}
// doc and set the default `role=student` custom claim in one place.
export const onUserCreate = beforeUserCreated(async (event) => {
  const u = event.data;
  if (!u) return;

  const db = getFirestore();
  const defaultRole = "student";

  await db.collection("users").doc(u.uid).set(
    {
      uid: u.uid,
      email: u.email ?? "",
      displayName: u.displayName ?? (u.email ? u.email.split("@")[0] : "Learner"),
      photoURL: u.photoURL ?? null,
      role: defaultRole,
      points: 0,
      coins: 0,
      completedCourses: 0,
      completedLessons: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: false }
  );

  // Custom claim → used by Firestore rules and the admin guard.
  await getAuth().setCustomUserClaims(u.uid, { role: defaultRole });

  logger.info("created user doc", { uid: u.uid });
  return { customClaims: { role: defaultRole } };
});
