import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ADMIN_EMAIL, AUTH_STORAGE_KEY, isAdminEmail } from "../constants/app";
import {
  getUserProfile,
  isUserProfileComplete,
  migrateLegacyUserData,
  syncLoginShowcaseUser,
  upsertUserProfile,
} from "../lib/firestore";
import { auth, firebaseConfigured, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

function normalizeAuthUser(firebaseUser, profile = {}) {
  if (!firebaseUser) {
    return null;
  }

  return {
    uid: firebaseUser.uid,
    displayName: profile.displayName?.trim() || firebaseUser.displayName?.trim() || "",
    email: profile.email?.trim() || firebaseUser.email?.trim() || "",
    dob: profile.dob || "",
    gender: profile.gender?.trim() || "",
    phoneNumber: profile.phoneNumber?.trim() || firebaseUser.phoneNumber?.trim() || "",
    photoURL: profile.photoURL || firebaseUser.photoURL || "",
  };
}

function readLegacySessionUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      uid: parsed.uid || "",
      email: parsed.email?.trim()?.toLowerCase() || "",
      displayName: parsed.displayName?.trim() || "",
      phoneNumber: parsed.phoneNumber?.trim() || "",
      photoURL: parsed.photoURL || "",
    };
  } catch {
    return null;
  }
}

function clearLegacySessionUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function shouldUseRedirectSignIn() {
  if (typeof window === "undefined") {
    return false;
  }

  const mobileViewport = window.matchMedia?.("(max-width: 768px)")?.matches;
  const standaloneMode = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const userAgent = window.navigator?.userAgent || "";
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  return Boolean(mobileViewport || standaloneMode || mobileUserAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      clearLegacySessionUser();
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearLegacySessionUser();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const legacyUser = readLegacySessionUser();
        const profile = (await getUserProfile(firebaseUser.uid)) ?? {};
        const nextUser = normalizeAuthUser(firebaseUser, profile);

        await migrateLegacyUserData(nextUser, legacyUser);

        clearLegacySessionUser();
        setUser(nextUser);

        if (isUserProfileComplete(nextUser)) {
          await upsertUserProfile(nextUser);
          syncLoginShowcaseUser(nextUser).catch(() => {});
        }
      } catch {
        setUser(normalizeAuthUser(firebaseUser));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!firebaseConfigured || !auth || !googleProvider) {
      throw new Error("Firebase Google auth configured nahi hai.");
    }

    if (shouldUseRedirectSignIn()) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      return normalizeAuthUser(credential.user);
    } catch (error) {
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }

      throw error;
    }
  }

  async function completeGoogleProfile(profile) {
    if (!auth?.currentUser) {
      throw new Error("Google login session nahi mila. Ek baar phir sign-in karo.");
    }

    const nextUser = normalizeAuthUser(auth.currentUser, {
      ...user,
      ...profile,
      email: auth.currentUser.email || user?.email || "",
      photoURL: auth.currentUser.photoURL || user?.photoURL || "",
    });

    if (!nextUser.displayName || !nextUser.phoneNumber || !nextUser.gender) {
      throw new Error("Name, gender aur phone number sab required hain.");
    }

    if ((nextUser.phoneNumber ?? "").replace(/\D/g, "").length < 10) {
      throw new Error("Valid phone number enter karo.");
    }

    await updateProfile(auth.currentUser, {
      displayName: nextUser.displayName,
    }).catch(() => {});

    await upsertUserProfile(nextUser);
    await migrateLegacyUserData(nextUser, readLegacySessionUser());
    clearLegacySessionUser();
    setUser(nextUser);
    syncLoginShowcaseUser(nextUser).catch(() => {});
    return nextUser;
  }

  async function signOutUser() {
    clearLegacySessionUser();

    if (!auth) {
      setUser(null);
      return;
    }

    await signOut(auth);
    setUser(null);
  }

  const profileComplete = isUserProfileComplete(user);

  const value = useMemo(
    () => ({
      user,
      loading,
      authConfigured: firebaseConfigured,
      adminEmail: ADMIN_EMAIL,
      isAdmin: isAdminEmail(user?.email),
      profileComplete,
      signInWithGoogle,
      completeGoogleProfile,
      signOutUser,
    }),
    [loading, profileComplete, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
