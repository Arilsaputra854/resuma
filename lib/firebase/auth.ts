"use client";

// Client auth helpers wrapping Firebase Auth.
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

const KODINGYUK_DOMAIN = "@kodingyuk.id";

export function isInternalEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase().endsWith(KODINGYUK_DOMAIN);
}

export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
