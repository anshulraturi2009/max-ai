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
  const actionButtonClass = isLight
    ? "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 max-sm:border-transparent max-sm:bg-transparent max-sm:text-slate-700 max-sm:hover:bg-slate-200/55"
    : "border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.08] max-sm:border-transparent max-sm:bg-transparent max-sm:text-slate-200 max-sm:hover:bg-white/[0.06]";
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
      className={`mobile-top-shell relative px-4 pb-2 sm:px-6 sm:py-3 sm:backdrop-blur-2xl ${
        isLight
          ? "sm:border-b sm:border-slate-200/80 sm:bg-white/55"
          : "sm:border-b sm:border-white/10 sm:bg-slate-950/40"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-full sm:hidden ${
          isLight
            ? "bg-[linear-gradient(180deg,rgba(238,244,255,0.94)_0%,rgba(238,244,255,0.6)_55%,rgba(238,244,255,0)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(8,17,31,0.94)_0%,rgba(8,17,31,0.58)_55%,rgba(8,17,31,0)_100%)]"
        }`}
      />

      <div className="relative mx-auto flex w-full max-w-6xl items-start justify-between gap-3 sm:items-center">
        <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition lg:hidden sm:h-10 sm:w-10 sm:rounded-2xl ${actionButtonClass}`}
          >
          <Menu className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-start gap-3 sm:items-center">
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

            <div className="min-w-0">
              <h1
                className={`bg-gradient-to-r bg-clip-text text-base font-semibold tracking-[0.22em] text-transparent sm:text-xl sm:tracking-normal ${
                  isLight
                    ? "from-orange-500 via-slate-900 to-cyan-600"
                    : "from-orange-300 via-white to-cyan-300"
                }`}
              >
                MAX AI
              </h1>
              <div
                className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 sm:rounded-full sm:px-3 sm:py-1 ${
                    isLight
                      ? "sm:border sm:border-slate-200 sm:bg-white/80"
                      : "sm:border sm:border-white/10 sm:bg-white/[0.04]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
                  {statusLabel}
                </span>
                <span className={`truncate ${isLight ? "text-slate-500" : "text-slate-400/90"}`}>
                  {engine?.label || "Live AI"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <InstallButton ghostOnMobile />

          <button
            type="button"
            onClick={onNewChat}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border px-0 py-0 text-sm transition sm:h-auto sm:w-auto sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 ${actionButtonClass}`}
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">New chat</span>
          </button>

          {canClear ? (
            <button
              type="button"
              onClick={onClear}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border px-0 py-0 text-sm transition sm:h-auto sm:w-auto sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2 ${actionButtonClass}`}
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
