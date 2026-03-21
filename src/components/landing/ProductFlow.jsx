import { motion } from "framer-motion";

const steps = [
  {
    index: "01",
    title: "Choose your mode",
    copy: "Pick the persona that matches the energy, tone, and support style you want.",
  },
  {
    index: "02",
    title: "Ask anything",
    copy: "From coding and ideas to daily decisions and growth, drop your prompt naturally.",
  },
  {
    index: "03",
    title: "Get intelligent replies instantly",
    copy: "Receive fast responses with polished motion, typing feedback, and premium UX rhythm.",
  },
];

export default function ProductFlow() {
  return (
    <section className="content-auto px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="panel overflow-hidden p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="status-chip mb-4">How it works</div>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Three clean steps to enter flow state with AI.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                The product experience stays simple on the surface but carries
                enough polish underneath that it feels credible, premium, and alive.
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.index}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="w-fit rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-cyan-100">
                      {step.index}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {step.copy}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
