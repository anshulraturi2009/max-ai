import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import GoogleAuthCard from "../components/auth/GoogleAuthCard";
import ProfileAccessCard from "../components/auth/ProfileAccessCard";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { user, loading, profileComplete } = useAuth();

  useEffect(() => {
    document.title = "MAX AI Login";
  }, []);

  if (!loading && user && profileComplete) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure sign-in
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">MAX AI</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sign in with Google once, finish the short onboarding step, and
              keep your chats available across devices.
            </p>
          </div>
        </div>

        {user ? <ProfileAccessCard /> : <GoogleAuthCard />}
      </div>
    </div>
  );
}
