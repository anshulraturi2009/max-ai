import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function TypingIndicator() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="flex items-start gap-3 justify-start"
    >
      <motion.div
        initial={{ scale: 0.88, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.06, type: "spring", stiffness: 240, damping: 18 }}
        className="relative mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-[0_16px_38px_rgba(249,115,22,0.35)] sm:inline-flex"
      >
        <Bot className="h-[18px] w-[18px]" />
      </motion.div>
      <div className="message-bubble-ai rounded-[26px] border px-4 py-3 shadow-[0_20px_56px_rgba(8,15,35,0.18)] backdrop-blur-xl sm:px-5 sm:py-4">
        <div className={`mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white sm:hidden">
            <Bot className="h-3 w-3" />
          </span>
          <span>AI</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>Thinking</span>
        </div>
        <div className="flex items-center gap-2" aria-label="MAX AI is typing">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
              transition={{
                duration: 0.75,
                repeat: Infinity,
                ease: "easeInOut",
                delay: dot * 0.12,
              }}
              className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
