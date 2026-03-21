import { usePerformance } from "../../context/PerformanceContext";

export default function AmbientBackdrop({ accent = "101, 229, 255" }) {
  const { isLowPerformance, isMobile } = usePerformance();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {!isLowPerformance ? (
        <>
          <div className="grid-overlay absolute inset-0 opacity-40" />
          <div
            className="hero-glow absolute left-1/2 top-[-180px] h-[580px] w-[580px] -translate-x-1/2 rounded-full"
            style={{ "--accent-rgb": accent }}
          />
        </>
      ) : null}

      <div
        className={`absolute left-[8%] top-[12%] rounded-full blur-3xl ${
          isMobile ? "h-40 w-40" : "h-60 w-60"
        } ${isLowPerformance ? "" : "animate-pulse-soft"}`}
        style={{ background: `rgba(${accent}, 0.18)` }}
      />
      <div
        className={`absolute bottom-[8%] right-[10%] rounded-full bg-cyan-400/10 blur-3xl ${
          isMobile ? "h-44 w-44" : "h-72 w-72"
        } ${isLowPerformance ? "" : "animate-float"}`}
      />
      {!isLowPerformance ? (
        <div className="absolute right-[16%] top-[30%] h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
      ) : null}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
