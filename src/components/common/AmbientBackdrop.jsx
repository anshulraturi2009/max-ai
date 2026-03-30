import { lazy, Suspense } from "react";
import { usePerformance } from "../../context/PerformanceContext";
import { cx } from "../../lib/cx";

const NeuralSceneCanvas = lazy(() => import("./NeuralSceneCanvas"));

export default function AmbientBackdrop({
  accent = "101, 229, 255",
  variant = "default",
}) {
  const { isLowPerformance, isMobile } = usePerformance();
  const isChatVariant = variant === "chat";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cx(
          "absolute inset-0",
          isChatVariant
            ? "bg-[radial-gradient(circle_at_82%_18%,rgba(83,132,255,0.14),transparent_16%),radial-gradient(circle_at_72%_54%,rgba(101,229,255,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%)]"
            : "bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_80%_16%,rgba(83,132,255,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_22%)]",
        )}
      />
      <div
        className={cx(
          "absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]",
          isChatVariant
            ? "opacity-35 [mask-image:linear-gradient(90deg,transparent_4%,black_24%,black_78%,transparent_100%)]"
            : "opacity-60 [mask-image:radial-gradient(circle_at_center,black_35%,transparent_80%)]",
        )}
      />

      <div
        className={`absolute rounded-full blur-[100px] ${
          isChatVariant ? "left-[62%] top-[10%]" : "left-[6%] top-[8%]"
        } ${isMobile ? "h-40 w-40" : "h-72 w-72"} ${
          isLowPerformance ? "" : "animate-pulse-soft"
        }`}
        style={{ background: `rgba(${accent}, ${isChatVariant ? "0.16" : "0.22"})` }}
      />
      <div
        className={`absolute rounded-full blur-[110px] ${
          isChatVariant ? "right-[-4%] top-[18%]" : "right-[8%] top-[18%]"
        } ${isMobile ? "h-44 w-44" : "h-80 w-80"}`}
        style={{ background: "rgba(130, 118, 255, 0.16)" }}
      />
      <div
        className={`absolute rounded-full blur-[120px] ${
          isChatVariant ? "bottom-[-6%] right-[10%]" : "bottom-[4%] left-[16%]"
        } ${isMobile ? "h-44 w-44" : "h-96 w-96"} ${
          isLowPerformance ? "" : "animate-float"
        }`}
        style={{ background: "rgba(33, 211, 255, 0.12)" }}
      />

      {isChatVariant ? (
        <>
          <div className="absolute inset-y-[11%] right-[4%] hidden w-[34%] rounded-[44px] border border-white/8 bg-white/[0.015] shadow-[0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.04)] lg:block" />
          <div className="absolute inset-y-[8%] right-[2%] hidden w-[36%] rounded-[48px] border border-white/6 lg:block" />
          <div className="absolute right-[18%] top-[20%] hidden h-[18rem] w-[18rem] rounded-full border border-cyan-200/10 lg:block" />
          <div className="absolute right-[9%] top-[34%] hidden h-[24rem] w-[24rem] rounded-full border border-violet-200/10 lg:block" />
        </>
      ) : (
        <>
          <div className="absolute inset-[12%] rounded-[48px] border border-white/8 bg-white/[0.015] shadow-[0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.04)]" />
          <div className="absolute inset-[10%] rounded-[52px] border border-white/6" />
        </>
      )}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {!isLowPerformance ? (
        isChatVariant ? (
          <div className="absolute inset-y-[10%] right-[-6%] hidden w-[54%] lg:block">
            <Suspense fallback={null}>
              <NeuralSceneCanvas
                accent={accent}
                className="opacity-35 [mask-image:linear-gradient(90deg,transparent_4%,black_34%,black_100%)]"
              />
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={null}>
            <NeuralSceneCanvas accent={accent} />
          </Suspense>
        )
      ) : null}

      <div
        className={cx(
          "absolute inset-0",
          isChatVariant
            ? "bg-[radial-gradient(circle_at_72%_44%,transparent_16%,rgba(2,6,23,0.2)_52%,rgba(2,6,23,0.72)_100%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.46)_100%)]",
        )}
      />
    </div>
  );
}
