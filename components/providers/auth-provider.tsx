"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firebase/firestore";
import type { UserDoc, UserRole } from "@/types";

export interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Track auth state + read role from custom claims on every token refresh.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const tokenResult = await u.getIdTokenResult();
        const claimRole = (tokenResult.claims.role as UserRole) ?? "student";
        setRole(claimRole);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to the user's Firestore profile doc for live points/coins.
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(userDoc(user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user?.uid]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, role, loading }),
    [user, profile, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
