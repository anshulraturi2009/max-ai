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

function readStoredSessionUser() {
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
      dob: parsed.dob || "",
      gender: parsed.gender?.trim() || "",
      phoneNumber: parsed.phoneNumber?.trim() || "",
      photoURL: parsed.photoURL || "",
    };
  } catch {
    return null;
  }
}

function persistSessionUser(user) {
  if (typeof window === "undefined" || !user?.uid) {
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      dob: user.dob ?? "",
      gender: user.gender ?? "",
      phoneNumber: user.phoneNumber ?? "",
      photoURL: user.photoURL ?? "",
    }),
  );
}

function clearStoredSessionUser() {
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
      clearStoredSessionUser();
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearStoredSessionUser();
        setUser(null);
        setLoading(false);
        return;
      }

      const storedUser = readStoredSessionUser();

      try {
        const profile = (await getUserProfile(firebaseUser.uid)) ?? {};
        const nextUser = normalizeAuthUser(firebaseUser, {
          ...storedUser,
          ...profile,
        });

        await migrateLegacyUserData(nextUser, storedUser);

        persistSessionUser(nextUser);
        setUser(nextUser);

        if (isUserProfileComplete(nextUser)) {
          await upsertUserProfile(nextUser);
          syncLoginShowcaseUser(nextUser).catch(() => {});
        }
      } catch {
        const fallbackUser = normalizeAuthUser(firebaseUser, storedUser ?? {});
        persistSessionUser(fallbackUser);
        setUser(fallbackUser);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!firebaseConfigured || !auth || !googleProvider) {
      throw new Error("Firebase Google sign-in is not configured.");
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
      throw new Error("No active Google session was found. Please sign in again.");
    }

    const nextUser = normalizeAuthUser(auth.currentUser, {
      ...user,
      ...profile,
      email: auth.currentUser.email || user?.email || "",
      photoURL: auth.currentUser.photoURL || user?.photoURL || "",
    });

    if (!nextUser.displayName || !nextUser.phoneNumber || !nextUser.gender) {
      throw new Error("Name, gender, and phone number are required.");
    }

    if ((nextUser.phoneNumber ?? "").replace(/\D/g, "").length < 10) {
      throw new Error("Enter a valid phone number.");
    }

    await updateProfile(auth.currentUser, {
      displayName: nextUser.displayName,
    }).catch(() => {});

    await upsertUserProfile(nextUser);
    await migrateLegacyUserData(nextUser, readStoredSessionUser());
    persistSessionUser(nextUser);
    setUser(nextUser);
    syncLoginShowcaseUser(nextUser).catch(() => {});
    return nextUser;
  }

  async function signOutUser() {
    clearStoredSessionUser();

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
