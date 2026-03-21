import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioLines,
  Bot,
  Orbit,
  Sparkles,
  Stars,
} from "lucide-react";
import { usePerformance } from "../../context/PerformanceContext";

const floatingCards = [
  {
    icon: Bot,
    label: "Smart AI orchestration",
    copy: "One consistent assistant voice with polished intelligence and clean UX.",
    className: "left-0 top-10 w-56",
  },
  {
    icon: AudioLines,
    label: "Responsive chat motion",
    copy: "Typing, transitions, and flow tuned for premium feel.",
    className: "right-0 top-40 w-60",
  },
  {
    icon: Orbit,
    label: "Future-ready architecture",
    copy: "Mock engine today, real AI backend tomorrow.",
    className: "left-10 bottom-0 w-64",
  },
];

export default function LandingHero({ onPrimary, onSecondary, isAuthed }) {
  const { isLowPerformance, isMobile } = usePerformance();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-28 lg:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <motion.div
          initial={isLowPerformance ? false : { opacity: 0, y: 28 }}
          animate={isLowPerformance ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10"
        >
          <div className="status-chip mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Desi AI Platform
          </div>

          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            MAX AI feels like the{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              next AI workspace
            </span>{" "}
            built for modern India.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-xl">
            Premium landing. Intelligent chat. Search-aware assistance.
            Futuristic product energy. Everything tuned to feel like a serious AI
            startup, not a plain chatbot demo.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onPrimary}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
            >
              {isAuthed ? "Open Workspace" : "Start Chatting"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onSecondary}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-7 py-4 text-sm font-semibold text-white transition duration-300 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Explore Features
              <Stars className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["AI-ready", "Live search-aware engine"],
              ["Google-only", "Fast premium access"],
              ["Frontend-first", "Backend-ready later"],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
              >
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/90">
                  {title}
                </p>
                <p className="mt-2 text-sm text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={isLowPerformance ? false : { opacity: 0, scale: 0.96, y: 20 }}
          animate={isLowPerformance ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className={`relative mx-auto w-full ${
            isMobile ? "h-[300px] max-w-[360px]" : "h-[620px] max-w-[560px]"
          }`}
        >
          <div className="absolute inset-[14%] rounded-full border border-cyan-300/20 bg-cyan-400/5 blur-2xl" />
          {!isLowPerformance ? (
            <>
              <div className="neural-ring absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />
              <div className="neural-ring absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />
            </>
          ) : null}
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-gradient-to-br from-cyan-300/20 via-white/8 to-blue-500/20 ${
              isMobile ? "h-[132px] w-[132px]" : "h-[180px] w-[180px]"
            }`}
          />
          <div
            className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-slate-950/70 ${
              isMobile ? "h-20 w-20" : "h-24 w-24"
            }`}
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-300/90 to-blue-500/90 text-slate-950">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {!isLowPerformance &&
            !isMobile &&
            floatingCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className={`panel absolute ${card.className} animate-float p-4`}
                style={{ animationDelay: `${index * 0.6}s` }}
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
              </motion.div>
            );
            })}

          <div
            className={`absolute rounded-[28px] border border-cyan-300/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5 ${
              isMobile ? "inset-x-4 bottom-4" : "inset-x-20 bottom-10"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                Neural activity
              </span>
              <span className="status-chip">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                AI ready
              </span>
            </div>
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-white/[0.06]">
                <div
                  className={`shimmer-line h-full w-3/4 rounded-full ${
                    isLowPerformance ? "" : "animate-shimmer"
                  }`}
                />
              </div>
              <div className="h-3 rounded-full bg-white/[0.06]">
                <div
                  className={`shimmer-line h-full w-2/3 rounded-full ${
                    isLowPerformance ? "" : "animate-shimmer"
                  }`}
                />
              </div>
              <div className="h-3 rounded-full bg-white/[0.06]">
                <div
                  className={`shimmer-line h-full w-5/6 rounded-full ${
                    isLowPerformance ? "" : "animate-shimmer"
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
