import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./client";

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Force-refresh ID token so the client picks up the `role` claim set by
  // the `onUserCreate` Cloud Function trigger.
  await cred.user.getIdToken(true);
  return cred.user;
}

export async function signIn(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export async function refreshIdToken(): Promise<void> {
  if (auth.currentUser) await auth.currentUser.getIdToken(true);
}
