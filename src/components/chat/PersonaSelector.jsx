import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { personas, personaMap } from "../../data/personas";
import { cx } from "../../lib/cx";

export default function PersonaSelector({
  value,
  onChange,
  align = "right",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedPersona = personaMap[value] ?? personaMap.other;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
      >
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: selectedPersona.accent }}
        />
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
            Persona
          </span>
          <span className="block text-sm font-semibold text-white">
            {selectedPersona.name}
          </span>
        </span>
        <ChevronDown
          className={cx(
            "h-4 w-4 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cx(
              "absolute z-50 mt-3 w-[320px] rounded-[28px] border border-white/10 bg-slate-950/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <div className="mb-3 px-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Response style
              </p>
            </div>

            <div className="space-y-2">
              {personas.map((persona) => {
                const active = persona.id === selectedPersona.id;

                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      onChange(persona.id);
                      setOpen(false);
                    }}
                    className={cx(
                      "flex w-full items-start gap-3 rounded-[22px] border px-3 py-3 text-left transition",
                      active
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]",
                    )}
                  >
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: persona.accent }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white">
                          {persona.name}
                        </span>
                        {active ? (
                          <Check className="h-4 w-4 text-cyan-200" />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-slate-500">
                        {persona.short}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-slate-300">
                        {persona.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
