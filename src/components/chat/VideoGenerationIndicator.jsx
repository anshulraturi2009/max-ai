import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const STATUS_STEPS = [
  "Prompt samajh raha hai",
  "Scene aur framing set kar raha hai",
  "Motion aur camera render kar raha hai",
  "Final video polish kar raha hai",
];

function getActiveStepIndex(startedAt) {
  if (!startedAt) {
    return 0;
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));

  if (elapsedSeconds < 8) {
    return 0;
  }

  if (elapsedSeconds < 22) {
    return 1;
  }

  if (elapsedSeconds < 45) {
    return 2;
  }

  return 3;
}

export default function VideoGenerationIndicator({ startedAt, lowMotion = false }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const [activeStepIndex, setActiveStepIndex] = useState(() =>
    getActiveStepIndex(startedAt),
  );

  useEffect(() => {
    setActiveStepIndex(getActiveStepIndex(startedAt));

    const intervalId = window.setInterval(() => {
      setActiveStepIndex(getActiveStepIndex(startedAt));
    }, lowMotion ? 2800 : 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt]);

  const currentLabel = useMemo(
    () => STATUS_STEPS[activeStepIndex] || STATUS_STEPS[0],
    [activeStepIndex],
  );
  const Shell = lowMotion ? "div" : motion.div;
  const AvatarShell = lowMotion ? "div" : motion.div;

  return (
    <Shell
      {...(!lowMotion
        ? {
            layout: "position",
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { type: "spring", stiffness: 300, damping: 28 },
          }
        : {})}
      className="flex items-start gap-3 justify-start"
    >
      <AvatarShell
        {...(!lowMotion
          ? {
              initial: { scale: 0.88, rotate: -10 },
              animate: { scale: 1, rotate: 0 },
              transition: { delay: 0.06, type: "spring", stiffness: 240, damping: 18 },
            }
          : {})}
        className="relative mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-[0_16px_38px_rgba(249,115,22,0.35)] sm:inline-flex"
      >
        <Film className="h-[18px] w-[18px]" />
      </AvatarShell>
      <div className="w-full max-w-full sm:max-w-[80%]">
        <div
          className={`rounded-[28px] border p-4 shadow-[0_20px_70px_rgba(8,15,35,0.18)] backdrop-blur-2xl sm:p-5 ${
            isLight
              ? "border-cyan-200 bg-white/90"
              : "border-cyan-300/12 bg-slate-900/80"
          }`}
        >
          <div className={`mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${isLight ? "text-cyan-700/80" : "text-cyan-100/70"}`}>
            <Film className="h-3.5 w-3.5" />
            AI video render
          </div>

          <div
            className={`relative overflow-hidden rounded-[22px] border ${
              isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/90"
            }`}
          >
            <div
              className={`aspect-video w-full blur-[0.2px] ${
                isLight
                  ? "bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_70%_75%,rgba(251,146,60,0.12),transparent_30%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(226,232,240,0.98))]"
                  : "bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_70%_75%,rgba(125,211,252,0.16),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]"
              }`}
            />
            {lowMotion ? null : (
              <motion.div
                animate={{ x: ["-100%", "130%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`rounded-full px-4 py-2 text-sm backdrop-blur-xl ${
                  isLight
                    ? "border border-cyan-200 bg-white/85 text-cyan-700"
                    : "border border-cyan-200/20 bg-slate-950/65 text-cyan-50/90"
                }`}
              >
                Video generate ho rahi hai
              </div>
            </div>
          </div>

          <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
            <Sparkles className="h-4 w-4 text-cyan-200" />
            {currentLabel}
          </div>

          <div className="mt-3 space-y-2">
            {STATUS_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              const isDone = index < activeStepIndex;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                    isActive
                      ? isLight
                        ? "bg-cyan-100 text-cyan-800"
                        : "bg-cyan-400/10 text-cyan-50"
                      : isDone
                        ? isLight
                          ? "text-slate-700"
                          : "text-slate-300"
                        : isLight
                          ? "text-slate-400"
                          : "text-slate-500"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive
                        ? "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
                        : isDone
                          ? "bg-emerald-300"
                          : isLight
                            ? "bg-slate-300"
                            : "bg-slate-700"
                    }`}
                  />
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
