import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Stars } from "lucide-react";
import AmbientBackdrop from "../components/common/AmbientBackdrop";
import GoogleAuthCard from "../components/auth/GoogleAuthCard";

export default function AuthPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <AmbientBackdrop accent="141, 248, 155" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-300/25 to-cyan-500/20">
              <span className="font-display text-lg font-bold text-white">M</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">
                MAX AI
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Auth gateway
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
          >
            Back to home
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel p-8 sm:p-10">
            <div className="status-chip mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              Entry protocol
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Secure access for a premium AI workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Google-only auth keeps onboarding fast while preserving a clean,
              scalable identity layer for the product. Simple login. Premium
              entry. Backend-ready structure.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                ["Single sign-on feel", "Fast entry for users, less friction, cleaner app flow."],
                ["Trust-first interface", "Security language and visual polish reinforce product seriousness."],
                ["Launch-ready foundation", "You can connect roles, profiles, and cloud data later."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="status-chip">
                <Sparkles className="h-3.5 w-3.5" />
                Premium onboarding
              </span>
              <span className="status-chip">
                <Stars className="h-3.5 w-3.5" />
                Google auth only
              </span>
            </div>
          </div>

          <GoogleAuthCard />
        </div>
      </div>
    </div>
  );
}
