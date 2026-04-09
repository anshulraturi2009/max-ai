import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ChatHeader from "../components/chat/ChatHeader";
import InputBar from "../components/chat/InputBar";
import MessageBubble from "../components/chat/MessageBubble";
import Sidebar from "../components/chat/Sidebar";
import TypingIndicator from "../components/chat/TypingIndicator";
import VideoGenerationIndicator from "../components/chat/VideoGenerationIndicator";
import { useAuth } from "../context/AuthContext";
import { useChatWorkspace } from "../hooks/useChatWorkspace";
import { useVoiceCall } from "../hooks/useVoiceCall";

export default function ChatPage() {
  const { user, isAdmin, signOutUser } = useAuth();
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
  const scrollContainerRef = useRef(null);
  const isThinking = thinkingState?.chatId === activeChatId;
  const thinkingStage = isThinking ? thinkingState?.stage || "thinking" : "thinking";
  const voiceCall = useVoiceCall({
    messages: activeChat?.messages || [],
    isThinking,
    onSend: submitMessage,
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [activeChat?.messages, isThinking]);

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
    <div className="h-[100dvh] overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex h-full w-full overflow-hidden">
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
            <div className="border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    <span className="font-medium">
                      Voice call {voiceCall.callStage === "speaking" ? "live" : "active"}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
                    {voiceCall.callStage}
                  </span>
                </div>

                <p className="text-sm text-emerald-50/90">
                  {voiceCall.feedback || "Phone button dobara dabao to call end ho jayegi."}
                </p>

                {voiceCall.transcript ? (
                  <p className="rounded-xl border border-emerald-300/15 bg-slate-950/25 px-3 py-2 text-sm leading-6 text-emerald-50/85">
                    {voiceCall.transcript}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto px-4 py-5 sm:px-6"
            >
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-6">
                {syncError ? (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {syncError}
                  </div>
                ) : null}

                {activeChat?.messages.length ? (
                  <AnimatePresence initial={false} mode="popLayout">
                    {activeChat.messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isThinking && thinkingStage === "rendering-video" ? (
                      <VideoGenerationIndicator
                        key="video-generation-indicator"
                        startedAt={thinkingState?.startedAt}
                      />
                    ) : null}
                    {isThinking && thinkingStage !== "rendering-video" ? (
                      <TypingIndicator key="typing-indicator" />
                    ) : null}
                  </AnimatePresence>
                ) : (
                  <div className="panel flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                    <h2 className="text-2xl font-semibold text-white">
                      Start a conversation
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                      Simple chat mode active. Message bhejo, voice use karo, ya files
                      attach karo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl">
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
