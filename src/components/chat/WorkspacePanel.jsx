import { useEffect, useState } from "react";
import { Check, Layers3, Sparkles } from "lucide-react";
import { personas } from "../../data/personas";
import { cx } from "../../lib/cx";

const briefTemplates = [
  {
    id: "startup",
    label: "Startup copilot",
    value:
      "I am building a startup. Prioritize product clarity, landing page ideas, growth strategy, execution plans, and practical next steps.",
  },
  {
    id: "coding",
    label: "Coding guide",
    value:
      "I want help with code, debugging, architecture, and implementation. Give direct technical explanations, examples, and practical fixes.",
  },
  {
    id: "study",
    label: "Study mode",
    value:
      "Explain concepts simply, then reinforce them with examples, mini summaries, and revision-friendly steps.",
  },
  {
    id: "content",
    label: "Content studio",
    value:
      "Help with scripts, captions, hooks, naming, brand positioning, and content ideas that feel sharp and ready to post.",
  },
];

export default function WorkspacePanel({
  open,
  personaId,
  workspaceContext,
  onSave,
  conversationTitle,
}) {
  const [draftPersonaId, setDraftPersonaId] = useState(personaId);
  const [draftWorkspaceContext, setDraftWorkspaceContext] = useState(workspaceContext);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setDraftPersonaId(personaId);
    setDraftWorkspaceContext(workspaceContext);
    setSaveMessage("");
  }, [personaId, workspaceContext, open]);

  if (!open) {
    return null;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSaveMessage("");
      await onSave({
        personaId: draftPersonaId,
        workspaceContext: draftWorkspaceContext,
      });
      setSaveMessage("Workspace settings saved.");
    } catch (error) {
      setSaveMessage(
        error?.message || "Workspace settings save nahi hui. Ek baar phir try karo.",
      );
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(templateValue) {
    setDraftWorkspaceContext(templateValue);
    setSaveMessage("");
  }

  return (
    <div className="border-b border-white/10 bg-slate-950/70 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="mx-auto max-w-[1320px] rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="status-chip">
              <Layers3 className="h-3.5 w-3.5" />
              Workspace controls
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-white">
              Shape how MAX AI helps in this chat
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Persona tone aur workspace brief dono current conversation ko smarter
              banate hain. Agar chat abhi nayi hai to ye settings next message se apply
              hongi.
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Active thread
            </p>
            <p className="mt-2 max-w-sm truncate text-white">
              {conversationTitle || "New workspace draft"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Assistant persona
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  setDraftPersonaId(persona.id);
                  setSaveMessage("");
                }}
                className={cx(
                  "rounded-full border px-3 py-2 text-left transition",
                  draftPersonaId === persona.id
                    ? "border-cyan-300/20 bg-cyan-300/10 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.06]",
                )}
              >
                <span className="block text-sm font-medium">{persona.name}</span>
                <span className="block text-xs text-slate-400">{persona.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Workspace brief
            </p>
            <span className="text-xs text-slate-500">
              {draftWorkspaceContext.trim().length}/500
            </span>
          </div>

          <textarea
            rows={4}
            maxLength={500}
            value={draftWorkspaceContext}
            onChange={(event) => {
              setDraftWorkspaceContext(event.target.value);
              setSaveMessage("");
            }}
            placeholder="Example: I am building a SaaS startup and want crisp answers about landing page copy, product strategy, and growth ideas."
            className="mt-3 w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {briefTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[20px] text-sm text-slate-400">
            {saveMessage ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-cyan-200" />
                {saveMessage}
              </span>
            ) : (
              "Persona + brief milkar replies ko more focused aur personalized banayenge."
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
