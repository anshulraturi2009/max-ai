import { motion } from "framer-motion";
import { usePerformance } from "../../context/PerformanceContext";

export default function TypingIndicator({ persona }) {
  const { isLowPerformance } = usePerformance();

  return (
    <motion.div
      initial={isLowPerformance ? false : { opacity: 0, y: 8 }}
      animate={isLowPerformance ? undefined : { opacity: 1, y: 0 }}
      exit={isLowPerformance ? undefined : { opacity: 0, y: 8 }}
      className="flex items-start gap-3"
    >
      <div
        className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"
        style={{ boxShadow: `0 0 40px rgba(${persona.rgb}, 0.12)` }}
      >
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: persona.accent }}
        />
      </div>

      <div className="message-bubble-ai max-w-[85%] rounded-[26px] px-4 py-4 sm:max-w-[70%]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          MAX AI | {persona.name}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={
                isLowPerformance
                  ? undefined
                  : { y: [0, -4, 0], opacity: [0.3, 1, 0.3] }
              }
              transition={
                isLowPerformance
                  ? undefined
                  : {
                      duration: 1,
                      repeat: Infinity,
                      delay: dot * 0.12,
                    }
              }
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: persona.accent }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
