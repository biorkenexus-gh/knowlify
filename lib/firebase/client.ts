import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators =
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true" &&
  typeof window !== "undefined";

export const app: FirebaseApp =
  getApps()[0] ?? initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Wire emulators once per page load (idempotent via global flag).
declare global {
  // eslint-disable-next-line no-var
  var __KNOWLIFY_EMULATORS_CONNECTED__: boolean | undefined;
}

if (useEmulators && !globalThis.__KNOWLIFY_EMULATORS_CONNECTED__) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    connectFunctionsEmulator(functions, "localhost", 5001);
    globalThis.__KNOWLIFY_EMULATORS_CONNECTED__ = true;
    // eslint-disable-next-line no-console
    console.info("[knowlify] connected to Firebase emulators");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[knowlify] emulator connection failed", err);
  }
}
