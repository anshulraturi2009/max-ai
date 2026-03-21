import { Menu, RefreshCcw, Sparkles } from "lucide-react";
import { assistantProfile } from "../../data/assistant";

export default function ChatHeader({
  engine,
  isThinking,
  thinkingStage = "thinking",
  onMenuToggle,
  onClear,
}) {
  const statusLabel =
    engine?.status === "offline"
      ? "Backend offline"
      : isThinking && thinkingStage === "searching"
        ? "Searching web"
        : isThinking
          ? "AI thinking"
          : "AI ready";
  const statusDotClass =
    engine?.status === "offline"
      ? "bg-amber-300"
      : isThinking
        ? "bg-cyan-300"
        : "bg-emerald-300";

  return (
    <div className="z-20 shrink-0 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-200 transition hover:bg-white/[0.08] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div
            className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${assistantProfile.accent}44, rgba(255,255,255,0.04))`,
              boxShadow: `0 0 50px rgba(${assistantProfile.rgb}, 0.16)`,
            }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
              Active workspace
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-white">
                MAX AI
              </h1>
              <span className="status-chip">
                <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
                {statusLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {engine?.label || "Live AI engine"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden max-w-xs text-right text-sm leading-6 text-slate-400 xl:block">
            {engine?.detail || assistantProfile.prompt}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08] sm:px-4"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
