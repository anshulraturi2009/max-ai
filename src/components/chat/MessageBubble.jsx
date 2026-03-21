import { motion } from "framer-motion";
import { usePerformance } from "../../context/PerformanceContext";

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

export default function MessageBubble({ message, persona }) {
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
        className={`flex max-w-[92%] gap-3 sm:max-w-[78%] ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 ${
            isUser ? "bg-white/[0.08]" : "bg-white/[0.05]"
          }`}
          style={
            isUser
              ? undefined
              : { boxShadow: `0 0 40px rgba(${persona.rgb}, 0.12)` }
          }
        >
          <span
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isUser ? "text-white" : "text-slate-100"
            }`}
          >
            {isUser ? "You" : persona.name.slice(0, 2)}
          </span>
        </div>

        <div
          className={`rounded-[28px] border px-5 py-4 text-sm text-slate-100 ${
            isUser
              ? "message-bubble-user border-cyan-300/10"
              : "message-bubble-ai border-white/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            <span>{isUser ? "You" : `MAX AI | ${persona.name}`}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

          <MessageContent content={message.content} />
        </div>
      </div>
    </motion.div>
  );
}
