import { Menu, MessageSquarePlus, RefreshCcw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
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
    <header
      className={`px-4 py-3 backdrop-blur-2xl sm:px-6 ${
        isLight
          ? "border-b border-slate-200/80 bg-white/55"
          : "border-b border-white/10 bg-slate-950/40"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition lg:hidden ${
              isLight
                ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            }`}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-orange-500/35 to-cyan-400/30 blur-xl" />
              <img
                src="/max-ai-icon-192-v3.png"
                alt="MAX AI"
                className={`relative h-12 w-12 rounded-[18px] shadow-[0_14px_35px_rgba(8,15,35,0.18)] ${
                  isLight ? "border border-slate-200 bg-white" : "border border-white/10"
                }`}
              />
            </div>

            <div>
              <h1 className="bg-gradient-to-r from-orange-300 via-white to-cyan-300 bg-clip-text text-lg font-semibold text-transparent sm:text-xl">
                MAX AI
              </h1>
              <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                    isLight
                      ? "border border-slate-200 bg-white/80"
                      : "border border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
                  {statusLabel}
                </span>
                <span className={isLight ? "text-slate-500" : "text-slate-400/90"}>
                  {engine?.label || "Live AI"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InstallButton />

          <button
            type="button"
            onClick={onNewChat}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
              isLight
                ? "border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                : "border border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.08]"
            }`}
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">New chat</span>
          </button>

          {canClear ? (
            <button
              type="button"
              onClick={onClear}
              className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                isLight
                  ? "border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                  : "border border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.08]"
              }`}
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
