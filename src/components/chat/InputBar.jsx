import { useEffect, useRef } from "react";
import {
  Eraser,
  Mic,
  Paperclip,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import PersonaSelector from "./PersonaSelector";

export default function InputBar({
  draft,
  setDraft,
  onSend,
  personaId,
  onPersonaChange,
  persona,
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

    onSend(draft, personaId);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="safe-bottom z-20 border-t border-white/10 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/90 px-4 pt-4 sm:px-6">
      <div className="input-shell mx-auto max-w-5xl p-3">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-chip">
              <Sparkles className="h-3.5 w-3.5" />
              {persona.name} mode
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400">
              Shift + Enter for new line
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PersonaSelector value={personaId} onChange={onPersonaChange} />
            <button
              type="button"
              title="Coming soon"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08]"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Coming soon"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08]"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08]"
            >
              <Eraser className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message MAX AI in ${persona.name} mode...`}
            className="max-h-[180px] min-h-[64px] flex-1 bg-transparent px-3 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !draft.trim()}
            className="inline-flex h-14 items-center gap-2 rounded-[20px] bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
