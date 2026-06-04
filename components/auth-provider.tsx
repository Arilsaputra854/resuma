"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { watchAuth } from "@/lib/firebase/auth";
import { getOrCreateUserProfile } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // watchAuth throws if Firebase env missing — degrade to signed-out.
    let unsub = () => {};
    try {
      unsub = watchAuth((user) => {
        if (!user) {
          setState({ user: null, profile: null, loading: false });
          return;
        }
        // Unblock UI immediately — never wait on Firestore (a hung getDoc
        // would otherwise pin loading=true forever, e.g. blank "Memuat…").
        setState({ user, profile: null, loading: false });

        // Load profile in background; fill it in when (if) it resolves.
        getOrCreateUserProfile(
          user.uid,
          user.email ?? "",
          user.displayName ?? user.email ?? "User",
          user.photoURL ?? undefined
        )
          .then((profile) =>
            setState((s) => (s.user?.uid === user.uid ? { ...s, profile } : s))
          )
          .catch((err) => {
            console.error("Profile load failed:", err);
          });
      });
    } catch {
      setState({ user: null, profile: null, loading: false });
    }
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
