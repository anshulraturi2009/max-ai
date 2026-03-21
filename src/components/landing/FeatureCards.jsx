import { motion } from "framer-motion";
import {
  Gauge,
  HandCoins,
  Layers3,
  SearchCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const features = [
  {
    title: "Smart search-aware answers",
    copy: "When the question needs fresh info, MAX AI can look things up and respond with better context.",
    icon: SearchCheck,
  },
  {
    title: "Smart desi responses",
    copy: "Natural Hinglish-friendly interaction tuned for modern Indian users.",
    icon: Sparkles,
  },
  {
    title: "Fast and smooth chat experience",
    copy: "Responsive transitions, premium motion, and polished typing states.",
    icon: Gauge,
  },
  {
    title: "Future-ready AI integration",
    copy: "Mock engine structured so a real backend can plug in without chaos.",
    icon: Layers3,
  },
  {
    title: "Personal assistant interactions",
    copy: "Feels less like a bot and more like a high-context AI copilot.",
    icon: WandSparkles,
  },
  {
    title: "Expandable AI ecosystem",
    copy: "Designed to grow into workflows, tools, plugins, and domain-specific modules.",
    icon: HandCoins,
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="content-auto px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <div className="status-chip mb-4">Product capabilities</div>
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Designed like a real AI product, not a throwaway chat shell.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            MAX AI is meant to feel intelligent at every layer: brand,
            interaction, state transitions, and future architecture.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="panel panel-glow group p-6 transition duration-300 hover:-translate-y-1"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.07] text-cyan-200 transition duration-300 group-hover:bg-cyan-300/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {feature.copy}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
