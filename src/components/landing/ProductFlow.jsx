import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Command, Layers3, Sparkles } from "lucide-react";
import { gsap } from "../../lib/gsap";

const steps = [
  {
    index: "01",
    title: "Enter one clean workspace",
    copy: "Open a focused thread, choose the right persona, and set context before you start pushing prompts.",
    icon: Command,
  },
  {
    index: "02",
    title: "Feed the system real signal",
    copy: "Ask directly, attach files, or set a workspace brief so the assistant answers with less noise and more intent.",
    icon: Layers3,
  },
  {
    index: "03",
    title: "Refine instantly",
    copy: "Use quick actions like shorter, direct, next steps, Hinglish, or formal to tune the output without starting over.",
    icon: Sparkles,
  },
];

export default function ProductFlow() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-flow-copy]",
        { autoAlpha: 0, x: -34 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.82,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        "[data-flow-card]",
        { autoAlpha: 0, x: 44 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: "[data-flow-grid]",
            start: "top 76%",
          },
        },
      );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="flow"
      className="content-auto px-4 py-20 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="premium-card mesh-panel overflow-hidden p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div data-flow-copy>
              <div className="section-eyebrow">Interaction flow</div>
              <h2 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
                A cleaner path from prompt to polished output.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-slate-300">
                The redesign is not only visual. It improves the mental model of the
                product so each step feels more natural, premium, and easier to use.
              </p>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Why this matters
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Strong products remove friction at the exact moment users need
                  clarity. This flow is about reducing randomness and increasing
                  momentum.
                </p>
              </div>
            </div>

            <div data-flow-grid className="grid gap-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.index}
                    data-flow-card
                    className="premium-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5"
                  >
                    <div className="flex items-center gap-4 sm:block">
                      <span className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-cyan-100">
                        {step.index}
                      </span>
                      <div className="grid h-12 w-12 place-items-center rounded-[20px] border border-white/10 bg-white/[0.06] text-cyan-200 sm:mt-4">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {step.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {step.copy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
