// Firebase Admin SDK — server only. Used by API routes for verified writes
// (webhook plan updates, quota resets) bypassing security rules.
import {
  getApps,
  initializeApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin(): App {
  const apps = getApps();
  if (apps.length) return apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private key stored with literal \n in env — restore real newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env missing (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
