"use client";

// Firestore data-access helpers for resumes + user profile (client side).
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { isInternalEmail } from "./auth";
import type { Resume, UserProfile, Plan } from "@/types";

export async function getOrCreateUserProfile(
  uid: string,
  email: string,
  name: string,
  photoURL?: string
): Promise<UserProfile> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  // Internal kodingyuk emails get auto-premium (plan.md §4.1).
  const plan: Plan = isInternalEmail(email) ? "premium" : "free";
  const now = Date.now();
  const profile: UserProfile = {
    uid,
    email,
    name,
    photoURL,
    plan,
    planExpiry: plan === "premium" ? null : null,
    quotaChecksToday: 0,
    quotaResetAt: now,
    createdAt: now,
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveResume(resume: Resume): Promise<void> {
  await setDoc(
    doc(db, "resumes", resume.id),
    { ...resume, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getResume(id: string): Promise<Resume | null> {
  const snap = await getDoc(doc(db, "resumes", id));
  return snap.exists() ? (snap.data() as Resume) : null;
}

export async function listResumes(uid: string): Promise<Resume[]> {
  try {
    const q = query(
      collection(db, "resumes"),
      where("uid", "==", uid),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Resume);
  } catch {
    // Composite index may not exist yet — fall back to filter-only query, sort client-side.
    const q = query(collection(db, "resumes"), where("uid", "==", uid));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => d.data() as Resume);
    return docs.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }
}
