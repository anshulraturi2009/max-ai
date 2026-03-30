import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="flex justify-start"
    >
      <div className="message-bubble-ai rounded-2xl border px-4 py-3 sm:px-5 sm:py-4">
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
              className="h-2 w-2 rounded-full bg-emerald-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
