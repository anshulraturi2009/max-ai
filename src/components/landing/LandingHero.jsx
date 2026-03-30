import { useLayoutEffect, useRef } from "react";
import {
  ArrowRight,
  AudioLines,
  Bot,
  Orbit,
  Sparkles,
  Stars,
  WandSparkles,
} from "lucide-react";
import MagneticButton from "../common/MagneticButton";
import { gsap } from "../../lib/gsap";
import { usePerformance } from "../../context/PerformanceContext";

const commandStacks = [
  "Realtime workspace memory",
  "Search aware reasoning",
  "Premium motion systems",
];

const orbitCards = [
  {
    icon: Bot,
    label: "Focused AI core",
    copy: "One clean assistant layer with strong context and premium responses.",
    className: "left-0 top-14 w-56",
  },
  {
    icon: AudioLines,
    label: "Smooth motion shell",
    copy: "GSAP rhythm, layered depth, and strong interaction polish.",
    className: "right-0 top-24 w-56",
  },
  {
    icon: Orbit,
    label: "Future-ready depth",
    copy: "Three.js aura gives the product a more serious visual identity.",
    className: "left-10 bottom-6 w-60",
  },
];

export default function LandingHero({ onPrimary, onSecondary, isAuthed }) {
  const { isLowPerformance, isMobile } = usePerformance();
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    if (isLowPerformance || !heroRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .fromTo(
          "[data-hero-copy]",
          { autoAlpha: 0, y: 42 },
          { autoAlpha: 1, y: 0, duration: 0.82, stagger: 0.08 },
        )
        .fromTo(
          "[data-hero-stat]",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.06 },
          "-=0.46",
        )
        .fromTo(
          "[data-hero-shell]",
          { autoAlpha: 0, scale: 0.92, y: 32, rotateX: 10 },
          { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, duration: 1 },
          "-=0.6",
        )
        .fromTo(
          "[data-hero-orbit]",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.68",
        );
    }, heroRef);

    return () => context.revert();
  }, [isLowPerformance]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden px-4 pb-18 pt-24 sm:px-6 lg:px-10 lg:pb-28 lg:pt-28"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="relative z-10">
          <div data-hero-copy className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            MAX AI cinematic workspace
          </div>

          <h1
            data-hero-copy
            className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-[5.4rem]"
          >
            A premium AI command center with{" "}
            <span className="display-gradient bg-clip-text text-transparent">
              smooth motion, spatial depth, and clean usability
            </span>
            .
          </h1>

          <p
            data-hero-copy
            className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-xl sm:leading-9"
          >
            MAX AI now leans into a sharper product identity: cinematic visuals,
            guided workflows, ambient 3D energy, and an interface that feels
            powerful without becoming hard to use.
          </p>

          <div data-hero-copy className="mt-8 flex flex-wrap gap-3">
            {commandStacks.map((stack) => (
              <span key={stack} className="command-chip">
                <Stars className="h-3.5 w-3.5 text-cyan-200" />
                {stack}
              </span>
            ))}
          </div>

          <div data-hero-copy className="mt-10 flex flex-col gap-4 sm:flex-row">
            <MagneticButton
              type="button"
              onClick={onPrimary}
              className="glass-button glass-button-primary"
            >
              {isAuthed ? "Open premium workspace" : "Launch MAX AI"}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>

            <MagneticButton
              type="button"
              onClick={onSecondary}
              className="glass-button"
              strength={14}
            >
              Explore motion system
              <WandSparkles className="h-4 w-4" />
            </MagneticButton>
          </div>

          <div className="hero-stats mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["3D depth", "Ambient Three.js layer tuned for premium product presence."],
              ["Smooth flow", "GSAP-led motion makes transitions feel intentional."],
              ["Clean usage", "Hierarchy stays readable even with richer visuals."],
            ].map(([title, copy]) => (
              <div
                key={title}
                data-hero-stat
                className="metric-tile"
              >
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/90">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          data-hero-shell
          className={`relative mx-auto w-full ${
            isMobile ? "h-[420px] max-w-[400px]" : "h-[640px] max-w-[620px]"
          }`}
        >
          <div className="premium-card mesh-panel absolute inset-0 overflow-hidden p-6 sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.14),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_18%)]" />
            <div className="absolute inset-[10%] rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_64%)]" />
            {!isLowPerformance ? (
              <>
                <div className="neural-ring absolute left-1/2 top-[48%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80" />
                <div className="neural-ring absolute left-1/2 top-[48%] h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-65" />
              </>
            ) : null}

            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <div className="section-eyebrow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium shell preview
                </div>
                <span className="status-chip">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Motion synced
                </span>
              </div>

              <div className="relative mx-auto flex w-full max-w-[360px] flex-1 items-center justify-center">
                <div className="absolute h-[220px] w-[220px] rounded-full border border-cyan-200/15 bg-cyan-300/10 blur-3xl" />
                <div className="absolute h-[250px] w-[250px] rounded-full border border-white/10" />
                <div className="absolute h-[320px] w-[320px] rounded-full border border-white/8" />
                <div className="absolute h-[120px] w-[120px] rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(223,248,255,0.92),rgba(142,228,255,0.85))] shadow-[0_25px_60px_rgba(114,224,255,0.35)]" />
                <div className="absolute h-[74px] w-[74px] rounded-[24px] border border-white/15 bg-slate-950/90" />
                <div className="absolute inset-x-10 bottom-8 rounded-[28px] border border-white/10 bg-slate-950/65 px-5 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    <span>Workspace signal</span>
                    <span>Live</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[84, 66, 90].map((width, index) => (
                      <div key={width} className="h-2.5 rounded-full bg-white/[0.06]">
                        <div
                          className={`shimmer-line h-full rounded-full ${
                            isLowPerformance ? "" : "animate-shimmer"
                          }`}
                          style={{
                            width: `${width}%`,
                            animationDelay: `${index * 0.5}s`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!isLowPerformance && !isMobile
                ? orbitCards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.label}
                        data-hero-orbit
                        className={`premium-card absolute ${card.className} animate-float p-4`}
                        style={{ animationDelay: `${index * 0.7}s` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.08] text-cyan-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {card.label}
                            </p>
                            <p className="mt-1 text-xs leading-6 text-slate-300">
                              {card.copy}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
