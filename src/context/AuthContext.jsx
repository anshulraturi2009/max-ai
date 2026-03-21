import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { ADMIN_EMAIL, isAdminEmail } from "../constants/app";
import { upsertUserProfile } from "../lib/firestore";
import { auth, firebaseConfigured, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    upsertUserProfile(user).catch(() => {});
  }, [user]);

  async function signInWithGoogle() {
    if (!firebaseConfigured || !auth || !googleProvider) {
      throw new Error("Firebase auth is not configured.");
    }

    await signInWithPopup(auth, googleProvider);
  }

  async function signOutUser() {
    if (!auth) {
      return;
    }

    await signOut(auth);
  }

  const value = {
    user,
    loading,
    authConfigured: firebaseConfigured,
    adminEmail: ADMIN_EMAIL,
    isAdmin: isAdminEmail(user?.email),
    signInWithGoogle,
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
