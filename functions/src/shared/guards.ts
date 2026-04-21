import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export function assertAuthed(req: CallableRequest): string {
  if (!req.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  return req.auth.uid;
}

export function assertAdmin(req: CallableRequest): string {
  const uid = assertAuthed(req);
  if (req.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin role required.");
  }
  return uid;
}

export function assertTeacher(req: CallableRequest): string {
  const uid = assertAuthed(req);
  const role = req.auth?.token.role;
  if (role !== "teacher" && role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Teacher or admin role required."
    );
  }
  return uid;
}
