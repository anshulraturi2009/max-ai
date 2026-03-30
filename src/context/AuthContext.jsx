import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_EMAIL, AUTH_STORAGE_KEY, isAdminEmail } from "../constants/app";
import { syncLoginShowcaseUser, upsertUserProfile } from "../lib/firestore";
import { firebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `max-ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSessionUser(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid || createSessionId(),
    displayName: user.displayName?.trim() || "MAX AI User",
    email: user.email?.trim() || "",
    dob: user.dob || "",
    phoneNumber: user.phoneNumber?.trim() || "",
    photoURL: user.photoURL || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      setUser(savedUser ? normalizeSessionUser(JSON.parse(savedUser)) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    upsertUserProfile(user).catch(() => {});
    syncLoginShowcaseUser(user).catch(() => {});
  }, [user]);

  async function signInWithProfile(profile) {
    if (!firebaseConfigured) {
      throw new Error("Firebase setup missing hai.");
    }

    const nextUser = normalizeSessionUser({
      ...user,
      ...profile,
      uid: user?.uid || createSessionId(),
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    }

    setUser(nextUser);
    return nextUser;
  }

  async function signOutUser() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    setUser(null);
  }

  const value = {
    user,
    loading,
    authConfigured: firebaseConfigured,
    adminEmail: ADMIN_EMAIL,
    isAdmin: isAdminEmail(user?.email),
    signInWithProfile,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
