import { motion } from "framer-motion";
import { usePerformance } from "../../context/PerformanceContext";
import { assistantProfile } from "../../data/assistant";

export default function TypingIndicator() {
  const { isLowPerformance } = usePerformance();

  return (
    <motion.div
      initial={isLowPerformance ? false : { opacity: 0, y: 8 }}
      animate={isLowPerformance ? undefined : { opacity: 1, y: 0 }}
      exit={isLowPerformance ? undefined : { opacity: 0, y: 8 }}
      className="flex items-start gap-3"
    >
      <div
        className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] sm:h-10 sm:w-10"
        style={{ boxShadow: `0 0 40px rgba(${assistantProfile.rgb}, 0.12)` }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
          AI
        </span>
      </div>

      <div className="message-bubble-ai rounded-[24px] border border-white/10 px-4 py-3 sm:rounded-[28px] sm:px-5 sm:py-4">
        <div className="flex items-center gap-2" aria-label="MAX AI is typing">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={
                isLowPerformance
                  ? undefined
                  : { y: [0, -6, 0], opacity: [0.35, 1, 0.35] }
              }
              transition={
                isLowPerformance
                  ? undefined
                  : {
                      duration: 0.9,
                      repeat: Infinity,
                      delay: dot * 0.14,
                    }
              }
              className="h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
              style={{ backgroundColor: assistantProfile.accent }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
