import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import AmbientBackdrop from "../components/common/AmbientBackdrop";
import FeatureCards from "../components/landing/FeatureCards";
import LandingHero from "../components/landing/LandingHero";
import PersonaCards from "../components/landing/PersonaCards";
import ProductFlow from "../components/landing/ProductFlow";
import WhySection from "../components/landing/WhySection";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handlePrimary() {
    navigate(user ? "/app" : "/auth");
  }

  function handleSecondary() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBackdrop />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/25 to-blue-500/20">
              <span className="font-display text-lg font-bold text-white">M</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">
                MAX AI
              </p>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                AI command core
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-300 transition hover:text-white">
              Features
            </a>
            <a href="#personas" className="text-sm text-slate-300 transition hover:text-white">
              Personas
            </a>
            <a href="#why" className="text-sm text-slate-300 transition hover:text-white">
              Why
            </a>
            <Link to="/auth" className="status-chip">
              <Sparkles className="h-3.5 w-3.5" />
              Google Access
            </Link>
            <button
              type="button"
              onClick={handlePrimary}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              {user ? "Open App" : "Start Chatting"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition md:hidden"
          >
            {user ? "Open" : "Start"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <LandingHero
          isAuthed={Boolean(user)}
          onPrimary={handlePrimary}
          onSecondary={handleSecondary}
        />
        <FeatureCards />
        <PersonaCards />
        <ProductFlow />
        <WhySection />
      </main>

      <footer className="content-auto relative z-10 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="font-display text-2xl font-semibold text-white">
              MAX AI
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Premium AI product design with futuristic energy, multi-persona
              conversations, and backend-ready architecture.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm text-slate-400 sm:grid-cols-4">
            {["About", "Features", "Privacy", "Contact"].map((item) => (
              <div key={item}>
                <p className="font-semibold text-white">{item}</p>
                <p className="mt-3">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
