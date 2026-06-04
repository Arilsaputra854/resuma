// Firebase client SDK init. Browser-safe (NEXT_PUBLIC_ vars only).
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-init on hot reload.
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// getAuth throws synchronously on an invalid/empty apiKey (e.g. placeholder env
// during build/SSR). Guard so module import never crashes a render; callers
// degrade to signed-out when these are null.
function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export const auth = safe(() => getAuth(app))!;
export const db = safe(() => getFirestore(app))!;
export const storage = safe(() => getStorage(app))!;
export const googleProvider = new GoogleAuthProvider();
