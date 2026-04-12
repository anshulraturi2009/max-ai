import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Braces, Code2, Database, Globe2, Layers3, User } from "lucide-react";

const SHOWCASE_SCENES = [
  {
    id: "full-stack",
    icon: Layers3,
    eyebrow: "Web systems",
    question: "What is full stack development?",
    answer:
      "Full stack development means building the complete product layer by layer: frontend UI, backend logic, APIs, databases, deployment, and how everything works together in production.",
    chips: ["Frontend", "Backend", "API", "Database"],
  },
  {
    id: "dsa",
    icon: Code2,
    eyebrow: "Developer prep",
    question: "What is DSA?",
    answer:
      "DSA stands for Data Structures and Algorithms. It helps you store data efficiently, think clearly about problem solving, and write faster, scalable code during real projects and interviews.",
    chips: ["Arrays", "Trees", "Graphs", "Complexity"],
  },
  {
    id: "rest-api",
    icon: Globe2,
    eyebrow: "Backend basics",
    question: "What is a REST API?",
    answer:
      "A REST API is a structured way for apps to communicate over HTTP using resources, routes, and methods like GET, POST, PUT, and DELETE, usually with JSON responses.",
    chips: ["HTTP", "JSON", "Routes", "Status codes"],
  },
  {
    id: "sql-nosql",
    icon: Database,
    eyebrow: "Architecture",
    question: "SQL vs NoSQL?",
    answer:
      "SQL databases use structured tables and relationships, while NoSQL databases are more flexible for fast-moving or large-scale document, key-value, and distributed data workloads.",
    chips: ["Tables", "Documents", "Scaling", "Schema"],
  },
];

function useTypewriterText(text, sceneKey) {
  const prefersReducedMotion = useReducedMotion();
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (!text) {
      setVisibleLength(0);
      return undefined;
    }

    if (prefersReducedMotion) {
      setVisibleLength(text.length);
      return undefined;
    }

    setVisibleLength(0);
    const interval = window.setInterval(() => {
      setVisibleLength((current) => {
        if (current >= text.length) {
          window.clearInterval(interval);
          return text.length;
        }

        return Math.min(text.length, current + 2);
      });
    }, 26);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, sceneKey, text]);

  return prefersReducedMotion ? text : text.slice(0, visibleLength);
}

export default function AuthShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const activeScene = SHOWCASE_SCENES[sceneIndex];
  const typedAnswer = useTypewriterText(activeScene.answer, activeScene.id);
  const railOffset = useMemo(() => `${sceneIndex * -76}px`, [sceneIndex]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSceneIndex((current) => (current + 1) % SHOWCASE_SCENES.length);
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, sceneIndex]);

  return (
    <div className="relative min-h-[640px] overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/55 shadow-[0_36px_120px_rgba(2,6,23,0.62)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,rgba(8,17,31,0.96),rgba(6,11,22,0.94))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.9)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-orange-500/24 blur-3xl" />
      <div className="absolute right-[12%] top-[12%] h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[10%] left-[10%] h-36 w-36 rounded-full bg-emerald-400/14 blur-3xl" />
      <div className="absolute bottom-0 right-8 h-44 w-44 rounded-full bg-blue-500/18 blur-3xl" />

      <div className="relative flex h-full min-h-[640px] flex-col lg:flex-row">
        <div className="flex w-full flex-col border-b border-white/10 p-5 lg:w-[220px] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-orange-300">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Live preview
              </p>
              <p className="mt-1 text-sm text-slate-300">
                MAX AI coding workspace
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-3">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: railOffset }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="space-y-3"
            >
              {SHOWCASE_SCENES.map((scene, index) => {
                const Icon = scene.icon;
                const active = index === sceneIndex;
                return (
                  <div
                    key={scene.id}
                    className={`rounded-[22px] border px-3 py-3 transition ${
                      active
                        ? "border-orange-400/30 bg-orange-500/10 shadow-[0_10px_28px_rgba(249,115,22,0.14)]"
                        : "border-white/8 bg-slate-950/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-2xl ${
                          active
                            ? "bg-gradient-to-br from-orange-500/80 to-amber-400/70 text-white"
                            : "bg-white/[0.06] text-slate-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                          {scene.eyebrow}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-100">
                          {scene.question}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        <div className="flex min-h-[640px] flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
              AI response demo
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400 sm:inline-flex">
              <span>Typing live</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>Auto switching topics</span>
            </div>
          </div>

          <div className="mt-5 flex-1 rounded-[30px] border border-white/10 bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <motion.div
              key={activeScene.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_10px_24px_rgba(34,211,238,0.2)]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-100">Developer asks</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {activeScene.eyebrow}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="message-bubble-user max-w-[88%] rounded-[26px] border px-4 py-3 text-sm leading-7 shadow-[0_18px_50px_rgba(8,15,35,0.24)]">
                  {activeScene.question}
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_12px_28px_rgba(249,115,22,0.24)]">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="message-bubble-ai max-w-[92%] rounded-[28px] border px-4 py-4 text-sm leading-7 shadow-[0_18px_50px_rgba(8,15,35,0.24)] sm:px-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    MAX AI answering
                  </p>
                  <div className="mt-3 min-h-[112px] text-slate-100">
                    {typedAnswer}
                    {!prefersReducedMotion && typedAnswer.length < activeScene.answer.length ? (
                      <motion.span
                        aria-hidden="true"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
                        className="ml-1 inline-block h-5 w-[2px] rounded-full bg-orange-400 align-middle shadow-[0_0_10px_rgba(251,146,60,0.8)]"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {activeScene.chips.map((chip) => (
                  <span
                    key={`${activeScene.id}-${chip}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
