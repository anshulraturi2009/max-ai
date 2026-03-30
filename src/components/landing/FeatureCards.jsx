import { useLayoutEffect, useRef } from "react";
import {
  Gauge,
  HandCoins,
  Layers3,
  SearchCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { gsap } from "../../lib/gsap";

const features = [
  {
    title: "Search-aware intelligence",
    copy: "When a prompt needs fresh info, MAX AI can lean on live context instead of pretending certainty.",
    icon: SearchCheck,
  },
  {
    title: "Persona-shaped replies",
    copy: "Switch between bhai, friend, mentor, formal, or balanced modes without losing product polish.",
    icon: Sparkles,
  },
  {
    title: "Premium motion rhythm",
    copy: "Smooth transitions, entrance choreography, and calmer interaction cues build trust instantly.",
    icon: Gauge,
  },
  {
    title: "Workspace memory layer",
    copy: "Saved context and conversation-level settings make the assistant feel more intentional.",
    icon: Layers3,
  },
  {
    title: "Builder-first workflows",
    copy: "Quick actions, workspace briefs, and practical next-step replies keep the product useful.",
    icon: WandSparkles,
  },
  {
    title: "Expandable product base",
    copy: "The shell is ready to grow into voice, documents, analytics, and richer AI tools later on.",
    icon: HandCoins,
  },
];

export default function FeatureCards() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-feature-head]",
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        "[data-feature-card]",
        { autoAlpha: 0, y: 42, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.74,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: "[data-feature-grid]",
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
      id="features"
      className="content-auto px-4 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div data-feature-head className="max-w-3xl">
          <div className="section-eyebrow">System capabilities</div>
          <h2 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
            Designed like a product ecosystem, not a plain chat wrapper.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
            Every layer now aims for a better balance: visual confidence, practical
            utility, and enough room to grow into a serious AI platform.
          </p>
        </div>

        <div
          data-feature-grid
          className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-feature-card
                className="premium-card mesh-panel group p-6 transition duration-300 hover:-translate-y-1.5"
              >
                <div className="relative">
                  <div className="grid h-[52px] w-[52px] place-items-center rounded-[22px] border border-white/10 bg-white/[0.06] text-cyan-200 transition duration-300 group-hover:bg-cyan-300/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {feature.copy}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
