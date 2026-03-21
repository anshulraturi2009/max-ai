import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
    >
      <path
        d="M21.81 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.56h5.53c-.11.88-.72 2.21-2.08 3.1l-.02.12 3 2.28.21.02c1.89-1.72 2.97-4.24 2.97-7.28Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 22c2.71 0 4.98-.88 6.64-2.39l-3.17-2.42c-.85.58-1.99.98-3.47.98-2.65 0-4.9-1.72-5.7-4.09l-.11.01-3.12 2.37-.04.11C4.89 19.86 8.25 22 12.2 22Z"
        fill="#34A853"
      />
      <path
        d="M6.5 14.08a5.92 5.92 0 0 1-.34-2c0-.7.12-1.39.32-2l-.01-.13-3.16-2.4-.1.05a9.88 9.88 0 0 0 0 8.96l3.29-2.48Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.83c1.86 0 3.11.79 3.82 1.45l2.79-2.67C17.16 3.08 14.9 2 12.2 2 8.25 2 4.89 4.14 3.23 7.43l3.27 2.48c.81-2.37 3.07-4.08 5.7-4.08Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthCard() {
  const { user, authConfigured, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = location.state?.from || "/app";

  async function handleGoogleAuth() {
    if (user) {
      navigate(redirectPath);
      return;
    }

    if (!authConfigured) {
      setError("Firebase env values add karo, tab Google login live ho jayega.");
      return;
    }

    try {
      setPending(true);
      setError("");
      await signInWithGoogle();
      navigate(redirectPath);
    } catch (authError) {
      setError(
        authError?.message?.includes("popup")
          ? "Google popup ko allow karke phir try karo."
          : "Google sign-in complete nahi ho paya. Ek baar phir try karo.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel panel-glow relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="mb-6 flex items-center justify-between">
        <span className="status-chip">
          <LockKeyhole className="h-3.5 w-3.5" />
          Google-only access
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          Secure workspace
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-3xl font-semibold text-white">
          Enter the MAX AI core
        </h2>
        <p className="max-w-md text-sm leading-7 text-slate-300">
          Premium MAX AI workspace me entry abhi sirf Google sign-in ke through
          hai. Fast access, simple onboarding, aur later backend integration ke
          liye clean auth path.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={pending}
        className="mt-8 flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white px-4 py-4 text-left text-slate-900 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100">
            <GoogleMark />
          </span>
          <span>
            <span className="block text-sm font-semibold">
              {user ? "Open AI workspace" : "Continue with Google"}
            </span>
            <span className="block text-xs text-slate-500">
              {authConfigured
                ? "Single-click sign-in for premium access"
                : "Add Firebase env keys to activate auth"}
            </span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Setup note</p>
        <p className="mt-2 leading-7">
          `.env` me Firebase web app keys daalo, Firebase console me Google sign-in
          enable karo, aur authorized domains me local dev host add karo.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
