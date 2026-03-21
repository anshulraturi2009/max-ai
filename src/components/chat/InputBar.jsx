import { useEffect, useRef } from "react";
import {
  Eraser,
  Mic,
  Paperclip,
  SendHorizonal,
  Sparkles,
} from "lucide-react";

export default function InputBar({
  draft,
  setDraft,
  onSend,
  disabled,
  onClear,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      180,
    )}px`;
  }, [draft]);

  function handleSend() {
    if (disabled || !draft.trim()) {
      return;
    }

    onSend(draft);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="safe-bottom z-20 shrink-0 border-t border-white/10 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/90 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="input-shell mx-auto max-w-5xl p-2.5 sm:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-chip">
              <Sparkles className="h-3.5 w-3.5" />
              MAX AI live
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400 sm:inline-flex">
              Shift + Enter for new line
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Coming soon"
              className="hidden h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] sm:grid"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Coming soon"
              className="hidden h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] sm:grid"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] sm:h-11 sm:w-11"
            >
              <Eraser className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask MAX AI anything..."
            className="max-h-[180px] min-h-[52px] flex-1 bg-transparent px-2 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-500 sm:min-h-[64px] sm:px-3 sm:py-4"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !draft.trim()}
            className="inline-flex h-12 items-center gap-2 rounded-[18px] bg-white px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:rounded-[20px] sm:px-5"
          >
            <span className="hidden sm:inline">Send</span>
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
