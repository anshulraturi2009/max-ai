import { motion } from "framer-motion";
import { Globe2, HeartHandshake, Zap } from "lucide-react";

const reasons = [
  {
    title: "Built for Indian digital energy",
    copy: "Hinglish-first tone, ambitious product vibe, and a sharper emotional connection for young users.",
    icon: Globe2,
  },
  {
    title: "Premium without losing warmth",
    copy: "The UI feels powerful and startup-grade, but the interaction still feels human and approachable.",
    icon: HeartHandshake,
  },
  {
    title: "Fast momentum by design",
    copy: "Every decision, from auth to persona switching to empty states, is tuned to keep flow high.",
    icon: Zap,
  },
];

export default function WhySection() {
  return (
    <section id="why" className="content-auto px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <div className="status-chip mb-4">Why MAX AI</div>
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            A premium Indian youth-focused AI platform with actual product presence.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            MAX AI is shaped to feel ambitious, intelligent, and culturally
            alive. Not loud. Not cheesy. Just clear product confidence.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="panel p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.07] text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {reason.copy}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
