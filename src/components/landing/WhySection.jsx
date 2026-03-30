import { useLayoutEffect, useRef } from "react";
import { Globe2, HeartHandshake, Zap } from "lucide-react";
import { gsap } from "../../lib/gsap";

const reasons = [
  {
    title: "Built for Indian digital ambition",
    copy: "The language, rhythm, and emotional tone are tuned for users who want strong UX without losing desi identity.",
    icon: Globe2,
  },
  {
    title: "Premium without becoming noisy",
    copy: "The redesign adds depth, 3D atmosphere, and motion discipline while keeping content readable and useful.",
    icon: HeartHandshake,
  },
  {
    title: "Momentum-first interaction design",
    copy: "Faster decisions, clearer controls, and better response shaping keep users moving instead of getting lost.",
    icon: Zap,
  },
];

export default function WhySection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-why-head]",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        "[data-why-card]",
        { autoAlpha: 0, y: 36, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.74,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: "[data-why-grid]",
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
      id="why"
      className="content-auto px-4 py-20 sm:px-6 lg:px-10 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <div data-why-head className="mb-10 max-w-3xl">
          <div className="section-eyebrow">Why MAX AI</div>
          <h2 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
            A more cinematic product identity without sacrificing clarity.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            The goal is not to look flashy. The goal is to feel inevitable:
            premium, smooth, intelligent, and easier to trust from the first
            interaction.
          </p>
        </div>

        <div data-why-grid className="grid gap-5 lg:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article
                key={reason.title}
                data-why-card
                className="premium-card p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-[22px] border border-white/10 bg-white/[0.07] text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {reason.copy}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
