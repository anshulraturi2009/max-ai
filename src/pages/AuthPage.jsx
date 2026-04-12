import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthShowcase from "../components/auth/AuthShowcase";
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#050816_0%,#07101d_44%,#050816_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,0.85)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.85)_1px,transparent_1px)] [background-size:80px_80px]" />
        <div className="absolute left-[6%] top-[12%] h-48 w-48 rounded-full bg-orange-500/18 blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] h-56 w-56 rounded-full bg-cyan-400/14 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,430px)] lg:gap-10">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 scale-[1.03] rounded-[40px] bg-slate-950/30 opacity-45 blur-2xl" />
            <AuthShowcase />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-b from-orange-500/10 via-transparent to-cyan-400/10 blur-2xl" />
            <div className="relative space-y-6">
              <div className="space-y-3 text-center lg:text-left">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 lg:mx-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure sign-in
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    MAX AI
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
                    Sign in with Google once, finish the short onboarding step,
                    and keep your chats available across devices.
                  </p>
                </div>
              </div>

              {user ? <ProfileAccessCard /> : <GoogleAuthCard />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
