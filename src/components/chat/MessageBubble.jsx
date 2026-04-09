import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Bot, Download, Film, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

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

function TypewriterContent({ content = "", durationMs = 0, lowMotion = false }) {
  const [visibleLength, setVisibleLength] = useState(0);
  const normalizedContent = useMemo(() => String(content ?? ""), [content]);

  useEffect(() => {
    if (!normalizedContent) {
      setVisibleLength(0);
      return undefined;
    }

    if (!durationMs || normalizedContent.length <= 1) {
      setVisibleLength(normalizedContent.length);
      return undefined;
    }

    let frameId = 0;
    let startTime = 0;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min(1, (timestamp - startTime) / durationMs);
      const nextLength = Math.max(
        1,
        Math.min(
          normalizedContent.length,
          Math.round(progress * normalizedContent.length),
        ),
      );

      setVisibleLength((currentLength) =>
        currentLength === nextLength ? currentLength : nextLength,
      );

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    setVisibleLength(1);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationMs, normalizedContent]);

  const displayedContent =
    visibleLength >= normalizedContent.length
      ? normalizedContent
      : normalizedContent.slice(0, visibleLength);
  const isTyping = displayedContent.length < normalizedContent.length;

  return (
    <div className="space-y-3">
      <MessageContent content={displayedContent} />
      {isTyping ? (
        lowMotion ? (
          <span
            aria-hidden="true"
            className="inline-block h-5 w-[2px] rounded-full bg-orange-400 align-middle opacity-80"
          />
        ) : (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-5 w-[2px] rounded-full bg-orange-400 align-middle shadow-[0_0_12px_rgba(251,146,60,0.85)]"
        />
        )
      ) : null}
    </div>
  );
}

function VideoMessageCard({ message }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const videoUrl = message.media?.downloadUrl || "";
  const videoPrompt = message.media?.prompt || "";
  const videoModel = message.media?.model || "";

  if (!videoUrl) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-[24px] border shadow-[0_18px_48px_rgba(2,6,23,0.16)] ${
        isLight ? "border-slate-200 bg-white" : "border-white/10 bg-slate-950/80"
      }`}
    >
      <div
        className={`px-4 py-3 ${
          isLight ? "border-b border-slate-200 bg-slate-50" : "border-b border-white/10 bg-slate-950/90"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`flex items-center gap-2 text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
            <Film className="h-4 w-4 text-cyan-200" />
            Generated video
          </div>

          <a
            href={videoUrl}
            download
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium transition ${
              isLight
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                : "border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]"
            }`}
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
        className={`aspect-video w-full ${isLight ? "bg-slate-200" : "bg-black"}`}
        src={videoUrl}
      >
        Your browser does not support inline video playback.
      </video>

      <div className="space-y-3 px-4 py-4">
        {videoPrompt ? (
          <p className={`text-sm leading-6 ${isLight ? "text-slate-700" : "text-slate-200"}`}>{videoPrompt}</p>
        ) : null}

        <div className={`flex flex-wrap items-center gap-2 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          <span className={`rounded-full px-2.5 py-1 ${isLight ? "border border-slate-200 bg-slate-50" : "border border-white/10 bg-white/[0.05]"}`}>
            Text to video
          </span>
          {videoModel ? (
            <span className={`rounded-full px-2.5 py-1 ${isLight ? "border border-slate-200 bg-slate-50" : "border border-white/10 bg-white/[0.05]"}`}>
              {videoModel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({ message, lowMotion = false }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const isUser = message.role === "user";
  const hasVideo = message.messageType === "video" && Boolean(message.media?.downloadUrl);
  const shouldAnimateReply =
    !lowMotion &&
    !isUser &&
    !hasVideo &&
    message.revealStyle === "typewriter" &&
    typeof message.revealDurationMs === "number" &&
    message.revealDurationMs > 0;
  const Shell = lowMotion ? "div" : motion.div;
  const AvatarShell = lowMotion ? "div" : motion.div;
  const CardShell = lowMotion ? "div" : motion.div;

  return (
    <Shell
      {...(!lowMotion
        ? {
            layout: "position",
            initial: { opacity: 0, y: 16, x: isUser ? 16 : -16, scale: 0.98 },
            animate: { opacity: 1, y: 0, x: 0, scale: 1 },
            exit: { opacity: 0, y: -10, scale: 0.98 },
            transition: {
              layout: { type: "spring", stiffness: 360, damping: 30 },
              opacity: { duration: 0.18 },
              x: { type: "spring", stiffness: 320, damping: 26 },
              y: { type: "spring", stiffness: 320, damping: 26 },
              scale: { duration: 0.18 },
            },
          }
        : {})}
      className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser ? (
        <AvatarShell
          {...(!lowMotion
            ? {
                initial: { scale: 0.88, rotate: -10 },
                animate: { scale: 1, rotate: 0 },
                transition: {
                  delay: 0.08,
                  type: "spring",
                  stiffness: 240,
                  damping: 18,
                },
              }
            : {})}
          className="relative mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-[0_16px_38px_rgba(249,115,22,0.35)] sm:inline-flex"
        >
          <Bot className="h-[18px] w-[18px]" />
        </AvatarShell>
      ) : null}

      <div className={`max-w-full sm:max-w-[78%] ${isUser ? "text-right" : ""}`}>
        <CardShell
          {...(!lowMotion ? { whileHover: { y: -2, scale: 1.01 } } : {})}
          className={`rounded-[26px] border px-4 py-3 text-left text-sm shadow-[0_20px_56px_rgba(8,15,35,0.25)] backdrop-blur-xl sm:px-5 sm:py-4 ${
            isUser ? "message-bubble-user" : "message-bubble-ai"
          }`}
        >
          <div className={`mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            {isUser ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[10px] text-white sm:hidden">
                <User className="h-3 w-3" />
              </span>
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[10px] text-white sm:hidden">
                <Bot className="h-3 w-3" />
              </span>
            )}
            <span>{isUser ? "You" : "AI"}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

          {message.content ? (
            shouldAnimateReply ? (
              <TypewriterContent
                content={message.content}
                durationMs={message.revealDurationMs}
                lowMotion={lowMotion}
              />
            ) : (
              <MessageContent content={message.content} />
            )
          ) : null}
          {hasVideo ? (
            <div className={message.content ? "mt-4" : ""}>
              <VideoMessageCard message={message} />
            </div>
          ) : null}
        </CardShell>
      </div>

      {isUser ? (
        <AvatarShell
          {...(!lowMotion
            ? {
                initial: { scale: 0.88, rotate: 10 },
                animate: { scale: 1, rotate: 0 },
                transition: {
                  delay: 0.08,
                  type: "spring",
                  stiffness: 240,
                  damping: 18,
                },
              }
            : {})}
          className="relative mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_16px_38px_rgba(34,211,238,0.28)] sm:inline-flex"
        >
          <User className="h-4 w-4" />
        </AvatarShell>
      ) : null}
    </Shell>
  );
}
