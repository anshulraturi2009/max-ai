import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";

function resolveFirebaseAuthDomain(defaultDomain) {
  if (typeof window === "undefined") {
    return defaultDomain;
  }

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]";

  if (isLocalhost || !hostname) {
    return defaultDomain;
  }

  return hostname;
}

const firebaseCoreConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: resolveFirebaseAuthDomain(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseConfig = {
  ...firebaseCoreConfig,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Object.values(firebaseCoreConfig).every(Boolean);

let firebaseApp = null;
let auth = null;
let googleProvider = null;
let analyticsPromise = Promise.resolve(null);

if (firebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  googleProvider = new GoogleAuthProvider();

  if (typeof window !== "undefined") {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }
}

export { analyticsPromise, auth, firebaseApp, googleProvider };
