import { motion } from "framer-motion";
import { Download, Film } from "lucide-react";

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

function VideoMessageCard({ message }) {
  const videoUrl = message.media?.downloadUrl || "";
  const videoPrompt = message.media?.prompt || "";
  const videoModel = message.media?.model || "";

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
      <div className="border-b border-white/10 bg-slate-950/90 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Film className="h-4 w-4 text-cyan-200" />
            Generated video
          </div>

          <a
            href={videoUrl}
            download
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/[0.1]"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>

      <video
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
        src={videoUrl}
      >
        Your browser does not support inline video playback.
      </video>

      <div className="space-y-3 px-4 py-4">
        {videoPrompt ? (
          <p className="text-sm leading-6 text-slate-200">{videoPrompt}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1">
            Text to video
          </span>
          {videoModel ? (
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1">
              {videoModel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const hasVideo = message.messageType === "video" && Boolean(message.media?.downloadUrl);

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

          {message.content ? <MessageContent content={message.content} /> : null}
          {hasVideo ? (
            <div className={message.content ? "mt-4" : ""}>
              <VideoMessageCard message={message} />
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
