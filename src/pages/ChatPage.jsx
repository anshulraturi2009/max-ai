import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ChatHeader from "../components/chat/ChatHeader";
import InputBar from "../components/chat/InputBar";
import MessageBubble from "../components/chat/MessageBubble";
import ParticleBackground from "../components/chat/ParticleBackground";
import Sidebar from "../components/chat/Sidebar";
import TypingIndicator from "../components/chat/TypingIndicator";
import VideoGenerationIndicator from "../components/chat/VideoGenerationIndicator";
import { useAuth } from "../context/AuthContext";
import { useChatWorkspace } from "../hooks/useChatWorkspace";
import { useVoiceCall } from "../hooks/useVoiceCall";
import { useTheme } from "../context/ThemeContext";

export default function ChatPage() {
  const { user, isAdmin, signOutUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const {
    filteredChats,
    activeChat,
    activeChatId,
    searchValue,
    setSearchValue,
    draft,
    setDraft,
    thinkingState,
    syncError,
    engine,
    createNewChat,
    setActiveChat,
    clearCurrentChat,
    submitMessage,
  } = useChatWorkspace();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [compactVisuals, setCompactVisuals] = useState(false);
  const [ultraLiteMode, setUltraLiteMode] = useState(false);
  const scrollContainerRef = useRef(null);
  const isThinking = thinkingState?.chatId === activeChatId;
  const thinkingStage = isThinking ? thinkingState?.stage || "thinking" : "thinking";
  const reduceEffects = compactVisuals || prefersReducedMotion;
  const isLight = resolvedTheme === "light";
  const voiceCall = useVoiceCall({
    messages: activeChat?.messages || [],
    isThinking,
    onSend: submitMessage,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const saveDataQuery =
      typeof navigator !== "undefined" && navigator.connection?.saveData;

    const updateCompactVisuals = () => {
      const deviceMemory =
        typeof navigator !== "undefined" && navigator.deviceMemory
          ? navigator.deviceMemory
          : 8;
      const hardwareConcurrency =
        typeof navigator !== "undefined" && navigator.hardwareConcurrency
          ? navigator.hardwareConcurrency
          : 8;
      const lowPowerDevice =
        deviceMemory <= 4 || hardwareConcurrency <= 6 || Boolean(saveDataQuery);
      const ultraLiteDevice =
        mobileQuery.matches &&
        (deviceMemory <= 2 || hardwareConcurrency <= 4 || Boolean(saveDataQuery));

      setCompactVisuals(Boolean(mobileQuery.matches || lowPowerDevice));
      setUltraLiteMode(Boolean(ultraLiteDevice));
    };

    updateCompactVisuals();
    mobileQuery.addEventListener?.("change", updateCompactVisuals);

    return () => {
      mobileQuery.removeEventListener?.("change", updateCompactVisuals);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.documentElement.classList.add("app-shell-locked");
    document.body.classList.add("app-shell-locked");
    document.documentElement.classList.toggle("app-perf-lite", compactVisuals);
    document.body.classList.toggle("app-perf-lite", compactVisuals);
    document.documentElement.classList.toggle("app-perf-ultra-lite", ultraLiteMode);
    document.body.classList.toggle("app-perf-ultra-lite", ultraLiteMode);

    return () => {
      document.documentElement.classList.remove("app-shell-locked");
      document.documentElement.classList.remove("app-perf-lite");
      document.documentElement.classList.remove("app-perf-ultra-lite");
      document.body.classList.remove("app-shell-locked");
      document.body.classList.remove("app-perf-lite");
      document.body.classList.remove("app-perf-ultra-lite");
    };
  }, [compactVisuals, ultraLiteMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: ultraLiteMode ? "auto" : "smooth",
    });
  }, [activeChat?.messages, isThinking, ultraLiteMode]);

  async function handleSignOut() {
    await signOutUser();
  }

  function handleClearChat() {
    if (!isAdmin) {
      return;
    }

    clearCurrentChat();
  }

  return (
    <div
      className={`relative h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none ${
        isLight ? "bg-[#eef4ff] text-slate-900" : "bg-[#08111f] text-slate-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isLight
              ? "bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(96,165,250,0.14),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_55%,#e7eefb_100%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_35%),linear-gradient(180deg,#08111f_0%,#0b1222_48%,#060b16_100%)]"
          }`}
        />
        {!reduceEffects ? (
          <>
            <div
              className={`absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:64px_64px] ${
                isLight ? "opacity-[0.08]" : "opacity-[0.12]"
              }`}
            />
            <motion.div
              className={`absolute left-[10%] top-[-10%] h-[24rem] w-[24rem] rounded-full blur-3xl ${
                isLight ? "bg-orange-400/18" : "bg-orange-500/20"
              }`}
              animate={{ y: [0, 24, 0], x: [0, 30, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-[-14%] right-[6%] h-[26rem] w-[26rem] rounded-full blur-3xl ${
                isLight ? "bg-sky-400/14" : "bg-cyan-400/16"
              }`}
              animate={{ y: [0, -26, 0], x: [0, -20, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <ParticleBackground />
          </>
        ) : ultraLiteMode ? (
          <>
            <div
              className={`absolute inset-0 ${
                isLight
                  ? "bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_56%,#e7eefb_100%)] opacity-95"
                  : "bg-[linear-gradient(180deg,#08111f_0%,#0b1222_56%,#060b16_100%)] opacity-95"
              }`}
            />
            <div
              className={`absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] [background-size:96px_96px] ${
                isLight ? "opacity-[0.04]" : "opacity-[0.05]"
              }`}
            />
          </>
        ) : (
          <>
            <div
              className={`absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:84px_84px] ${
                isLight ? "opacity-[0.05]" : "opacity-[0.07]"
              }`}
            />
            <div
              className={`absolute left-[6%] top-[-8%] h-[14rem] w-[14rem] rounded-full blur-3xl ${
                isLight ? "bg-orange-400/10" : "bg-orange-500/12"
              }`}
            />
            <div
              className={`absolute bottom-[-10%] right-[4%] h-[15rem] w-[15rem] rounded-full blur-3xl ${
                isLight ? "bg-sky-400/10" : "bg-cyan-400/10"
              }`}
            />
            <ParticleBackground lite />
          </>
        )}
      </div>

      <div className="relative flex h-full w-full overflow-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          chats={filteredChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChat}
          onNewChat={createNewChat}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          user={user}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-none">
          <ChatHeader
            engine={engine}
            isThinking={isThinking}
            thinkingStage={thinkingStage}
            onMenuToggle={() => setMobileSidebarOpen(true)}
            onNewChat={createNewChat}
            onClear={handleClearChat}
            canClear={isAdmin}
          />

          {voiceCall.callActive ? (
            <div
              className={`mobile-chat-call-strip px-4 py-3 backdrop-blur-xl sm:px-6 ${
                isLight
                  ? "border-b border-slate-200/80 bg-white/55"
                  : "border-b border-white/10 bg-slate-950/40"
              }`}
            >
              <div
                className={`mx-auto flex w-full max-w-5xl flex-col gap-2 rounded-[24px] border px-4 py-3 text-sm shadow-[0_16px_40px_rgba(5,12,24,0.14)] ${
                  isLight
                    ? "border-emerald-300/30 bg-emerald-50 text-emerald-900"
                    : "border-emerald-300/20 bg-emerald-400/10 text-emerald-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                    <span className="font-medium">
                      Voice call {voiceCall.callStage === "speaking" ? "live" : "active"}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
                    {voiceCall.callStage}
                  </span>
                </div>

                <p className={`text-sm ${isLight ? "text-emerald-900/90" : "text-emerald-50/90"}`}>
                  {voiceCall.feedback || "Phone button dobara dabao to call end ho jayegi."}
                </p>

                {voiceCall.transcript ? (
                  <p
                    className={`rounded-2xl border px-3 py-2 text-sm leading-6 ${
                      isLight
                        ? "border-emerald-200 bg-white/70 text-emerald-900/85"
                        : "border-emerald-300/15 bg-slate-950/30 text-emerald-50/85"
                    }`}
                  >
                    {voiceCall.transcript}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className={`mobile-chat-scroll h-full min-h-0 overflow-y-auto overscroll-y-contain px-4 pb-5 [scrollbar-gutter:stable] sm:px-6 sm:py-5 ${
                voiceCall.callActive ? "mobile-chat-scroll--call" : ""
              }`}
            >
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-8">
                {syncError ? (
                  <div
                    className={`rounded-[24px] border px-4 py-3 text-sm shadow-[0_18px_44px_rgba(120,53,15,0.12)] backdrop-blur-xl ${
                      isLight
                        ? "border-amber-300 bg-amber-50 text-amber-900"
                        : "border-amber-400/20 bg-amber-500/10 text-amber-100"
                    }`}
                  >
                    {syncError}
                  </div>
                ) : null}

                {activeChat?.messages.length ? (
                  ultraLiteMode ? (
                    <>
                      {activeChat.messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          lowMotion
                        />
                      ))}
                      {isThinking && thinkingStage === "rendering-video" ? (
                        <VideoGenerationIndicator
                          key="video-generation-indicator"
                          startedAt={thinkingState?.startedAt}
                          lowMotion
                        />
                      ) : null}
                      {isThinking && thinkingStage !== "rendering-video" ? (
                        <TypingIndicator key="typing-indicator" lowMotion />
                      ) : null}
                    </>
                  ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                      {activeChat.messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          lowMotion={ultraLiteMode}
                        />
                      ))}
                      {isThinking && thinkingStage === "rendering-video" ? (
                        <VideoGenerationIndicator
                          key="video-generation-indicator"
                          startedAt={thinkingState?.startedAt}
                          lowMotion={ultraLiteMode}
                        />
                      ) : null}
                      {isThinking && thinkingStage !== "rendering-video" ? (
                        <TypingIndicator key="typing-indicator" lowMotion={ultraLiteMode} />
                      ) : null}
                    </AnimatePresence>
                  )
                ) : (
                  <div className="agent-shell-panel flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
                    <div
                      className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] ${
                        isLight
                          ? "border border-slate-200 bg-white/80 text-slate-500"
                          : "border border-white/10 bg-white/[0.04] text-slate-300"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.9)]" />
                      AI Agent UI
                    </div>
                    <h2 className={`text-3xl font-semibold sm:text-4xl ${isLight ? "text-slate-900" : "text-white"}`}>
                      Start a conversation
                    </h2>
                    <p
                      className={`mt-4 max-w-xl text-sm leading-7 sm:text-base ${
                        isLight ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      Prompt bhejo, voice call start karo, files attach karo, ya text se
                      video generate karao. MAX AI ab ek cinematic workspace style me ready
                      hai.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl shrink-0">
            <InputBar
              draft={draft}
              setDraft={setDraft}
              onSend={submitMessage}
              disabled={isThinking}
              voiceCallActive={voiceCall.callActive}
              voiceCallStage={voiceCall.callStage}
              voiceCallSupported={voiceCall.isSupported}
              voiceCallFeedback={voiceCall.feedback}
              onToggleVoiceCall={voiceCall.toggleCall}
              onClear={handleClearChat}
              canClear={isAdmin}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
