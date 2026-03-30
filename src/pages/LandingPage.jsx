import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import AmbientBackdrop from "../components/common/AmbientBackdrop";
import MagneticButton from "../components/common/MagneticButton";
import FeatureCards from "../components/landing/FeatureCards";
import LandingHero from "../components/landing/LandingHero";
import ProductFlow from "../components/landing/ProductFlow";
import WhySection from "../components/landing/WhySection";
import { useAuth } from "../context/AuthContext";
import { gsap } from "../lib/gsap";

export default function LandingPage() {
  const { user } = useAuth();
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    if (!pageRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-nav-intro]",
        { autoAlpha: 0, y: -18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.06,
        },
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  function handlePrimary() {
    if (typeof window !== "undefined") {
      window.location.assign(user ? "/app" : "/auth");
    }
  }

  function handleSecondary() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden">
      <AmbientBackdrop />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" data-nav-intro className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))]">
              <span className="font-display text-lg font-bold text-white">M</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">
                MAX AI
              </p>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Premium command core
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {[
              ["Features", "#features"],
              ["Flow", "#flow"],
              ["Why", "#why"],
            ].map(([item, href]) => (
              <a
                key={item}
                href={href}
                data-nav-intro
                className="text-sm text-slate-300 transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth" data-nav-intro className="status-chip hidden sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              Personal access
            </Link>
            <MagneticButton
              type="button"
              onClick={handlePrimary}
              className="glass-button glass-button-primary px-5 py-3 text-sm"
            >
              {user ? "Open app" : "Start chatting"}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <LandingHero
          isAuthed={Boolean(user)}
          onPrimary={handlePrimary}
          onSecondary={handleSecondary}
        />
        <FeatureCards />
        <ProductFlow />
        <WhySection />
      </main>

      <footer className="relative z-10 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[34px] border border-white/10 bg-white/[0.04] px-6 py-8 backdrop-blur-2xl sm:px-8 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-lg">
              <div className="section-eyebrow">Built to feel serious</div>
              <h3 className="mt-5 font-display text-3xl font-semibold text-white">
                MAX AI is becoming a premium AI workspace, not just another chat page.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Richer depth, better motion, cleaner usability, and a structure
                that can actually grow into real product capabilities.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Design direction", "Cinematic, clean, and startup-grade."],
                ["Motion system", "GSAP choreography with calmer pacing."],
                ["3D layer", "Ambient depth without hurting readability."],
              ].map(([title, copy]) => (
                <div key={title} className="metric-tile min-w-[200px]">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/90">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
