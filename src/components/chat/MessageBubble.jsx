import { motion } from "framer-motion";

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
  const isUser = message.role === "user";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 16, x: isUser ? 16 : -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{
        layout: { type: "spring", stiffness: 360, damping: 30 },
        opacity: { duration: 0.18 },
        x: { type: "spring", stiffness: 320, damping: 26 },
        y: { type: "spring", stiffness: 320, damping: 26 },
        scale: { duration: 0.18 },
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-full sm:max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl border px-4 py-3 text-left text-sm sm:px-5 sm:py-4 ${
            isUser ? "message-bubble-user" : "message-bubble-ai"
          }`}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <span>{isUser ? "You" : "AI"}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

          <MessageContent content={message.content} />
        </div>
      </div>
    </motion.div>
  );
}
