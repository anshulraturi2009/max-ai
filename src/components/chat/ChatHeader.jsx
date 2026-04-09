import { Menu, MessageSquarePlus, RefreshCcw } from "lucide-react";
import InstallButton from "./InstallButton";

export default function ChatHeader({
  engine,
  isThinking,
  thinkingStage = "thinking",
  onMenuToggle,
  onNewChat,
  onClear,
  canClear = false,
}) {
  const statusLabel =
    engine?.status === "offline"
      ? "Offline"
      : engine?.status === "waking"
        ? "Waking"
      : isThinking && thinkingStage === "rendering-video"
        ? "Rendering video"
      : isThinking && thinkingStage === "searching"
        ? "Searching"
      : isThinking
          ? "Thinking"
          : "Ready";

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">MAX AI</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1">
                {statusLabel}
              </span>
              <span>{engine?.label || "Live AI"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InstallButton />

          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-slate-700"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">New chat</span>
          </button>

          {canClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-slate-700"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
