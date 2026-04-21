import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function loadCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_ADMIN_* env vars. Set them in .env.local."
    );
  }
  return { projectId, clientEmail, privateKey };
}

export const adminApp: App =
  getApps()[0] ??
  initializeApp({
    credential: cert(loadCredentials()),
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
