import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import AmbientBackdrop from "../components/common/AmbientBackdrop";
import ChatHeader from "../components/chat/ChatHeader";
import InputBar from "../components/chat/InputBar";
import MessageBubble from "../components/chat/MessageBubble";
import Sidebar from "../components/chat/Sidebar";
import TypingIndicator from "../components/chat/TypingIndicator";
import { useAuth } from "../context/AuthContext";
import { personaMap } from "../data/personas";
import { useChatWorkspace } from "../hooks/useChatWorkspace";

const starterPrompts = [
  "Mere startup ke liye futuristic landing page ideas do",
  "React aur Tailwind me premium dashboard ka structure batao",
  "Mere next 30 days ke growth plan ko smart tareeke se design karo",
];

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
    selectPersona,
    clearCurrentChat,
    setDraftFromSuggestion,
    submitMessage,
  } = useChatWorkspace();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  const activePersona =
    personaMap[activeChat?.personaId || "other"] ?? personaMap.other;
  const isThinking = thinkingState?.chatId === activeChatId;

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

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ "--accent-rgb": activePersona.rgb }}
    >
      <AmbientBackdrop accent={activePersona.rgb} />

      <div className="relative z-10 flex h-full overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          chats={filteredChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChat}
          onNewChat={createNewChat}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          activePersonaId={activePersona.id}
          onSelectPersona={selectPersona}
          user={user}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ChatHeader
            persona={activePersona}
            engine={engine}
            isThinking={isThinking}
            onMenuToggle={() => setMobileSidebarOpen(true)}
            onClear={clearCurrentChat}
          />

          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-6"
            >
              <div className="mx-auto flex max-w-5xl flex-col gap-5 pb-8">
                {syncError ? (
                  <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 px-5 py-4 text-sm leading-7 text-amber-100">
                    {syncError}
                  </div>
                ) : null}

                {activeChat?.messages.length ? (
                  <AnimatePresence initial={false}>
                    {activeChat.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        persona={activePersona}
                      />
                    ))}
                    {isThinking ? <TypingIndicator persona={activePersona} /> : null}
                  </AnimatePresence>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel panel-glow relative overflow-hidden p-6 sm:p-8"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activePersona.aura} opacity-70`}
                    />
                    <div className="relative">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="status-chip mb-5">
                            <Bot className="h-3.5 w-3.5" />
                            Intelligent welcome state
                          </div>
                          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                            Welcome to your {activePersona.name.toLowerCase()} AI
                            workspace.
                          </h2>
                          <p className="mt-4 text-sm leading-8 text-slate-200/90">
                            {activePersona.description} Ask anything and{" "}
                            {engine?.status === "offline"
                              ? "the app will stay in ready mode until the live backend comes online."
                              : `${engine?.label || "the live engine"} will respond with persona-aware tone and polished motion.`}
                          </p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">
                            Current AI layer
                          </p>
                          <p className="mt-3 max-w-sm text-sm leading-7 text-white">
                            {engine?.detail || activePersona.prompt}
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        {starterPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => setDraftFromSuggestion(prompt)}
                            className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1]"
                          >
                            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-100/80">
                              <Sparkles className="h-3.5 w-3.5" />
                              Quick start
                            </div>
                            <p className="text-sm leading-7 text-slate-100">
                              {prompt}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <InputBar
            draft={draft}
            setDraft={setDraft}
            onSend={submitMessage}
            personaId={activePersona.id}
            onPersonaChange={selectPersona}
            persona={activePersona}
            disabled={isThinking}
            onClear={clearCurrentChat}
          />
        </main>
      </div>
    </div>
  );
}
