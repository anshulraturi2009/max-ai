import { motion } from "framer-motion";
import { personas } from "../../data/personas";

export default function PersonaCards() {
  return (
    <section id="personas" className="content-auto px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="status-chip mb-4">Persona showcase</div>
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              One platform. Multiple vibes. Different emotional textures.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            Every mode has its own visual identity, response tone, and personality
            energy so switching feels intentional instead of cosmetic.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`panel relative overflow-hidden p-5`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${persona.aura} opacity-80`}
              />
              <div className="relative">
                <div
                  className="mb-5 h-14 w-14 rounded-2xl border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${persona.accent}55, rgba(255,255,255,0.08))`,
                    boxShadow: `0 0 50px rgba(${persona.rgb}, 0.18)`,
                  }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {persona.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-200/80">
                      {persona.short}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-100">
                    {persona.mood}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-200/90">
                  {persona.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
