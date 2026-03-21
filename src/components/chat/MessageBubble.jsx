import { motion } from "framer-motion";
import { usePerformance } from "../../context/PerformanceContext";
import { assistantProfile } from "../../data/assistant";

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function MessageContent({ content }) {
  return (
    <div className="space-y-3">
      {content.split("\n").map((line, index) => (
        <p key={`${line}-${index}`} className="whitespace-pre-wrap leading-7">
          {line || "\u00A0"}
        </p>
      ))}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const { isLowPerformance } = usePerformance();
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={isLowPerformance ? false : { opacity: 0, y: 14 }}
      animate={isLowPerformance ? undefined : { opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-full gap-2.5 sm:max-w-[78%] sm:gap-3 ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-white/10 sm:h-10 sm:w-10 ${
            isUser ? "bg-white/[0.08]" : "bg-white/[0.05]"
          }`}
          style={
            isUser
              ? undefined
              : { boxShadow: `0 0 40px rgba(${assistantProfile.rgb}, 0.12)` }
          }
        >
          <span
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isUser ? "text-white" : "text-slate-100"
            }`}
          >
            {isUser ? "You" : "AI"}
          </span>
        </div>

        <div
          className={`rounded-[24px] border px-4 py-3 text-sm text-slate-100 sm:rounded-[28px] sm:px-5 sm:py-4 ${
            isUser
              ? "message-bubble-user border-cyan-300/10"
              : "message-bubble-ai border-white/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            <span>{isUser ? "You" : "MAX AI"}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

          <MessageContent content={message.content} />
        </div>
      </div>
    </motion.div>
  );
}
