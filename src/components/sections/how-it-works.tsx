"use client";

import { useRef } from "react";
import { ClipboardList, MessageCircle, Mountain, type LucideIcon } from "lucide-react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { steps } from "@/lib/content";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";

const icons: LucideIcon[] = [MessageCircle, ClipboardList, Mountain];

export function HowItWorks() {
  const reduce = useReducedMotionSafe();
  const wide = useMediaQuery("(min-width: 768px)");
  const container = useRef<HTMLDivElement>(null);
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const refs = [r0, r1, r2];

  return (
    <section id="how-it-works" className="bg-pine-deep py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="How it works"
          title={
            <>
              Three steps <em className="text-apricot">to the mountains</em>
            </>
          }
        />

        <div ref={container} className="relative mt-16 grid gap-14 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <div key={s.title} className="relative z-10 flex flex-col items-center text-center">
                {/* Not animated in, so the beam measures the icon's final position */}
                <div
                  ref={refs[i]}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-cream/20 bg-night text-apricot shadow-xl shadow-night/40"
                >
                  <Icon className="h-8 w-8" aria-hidden />
                </div>
                <Reveal delay={i * 0.12}>
                  <p className="mt-6 font-serif text-lg text-apricot italic">Step {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 font-serif text-3xl font-medium">{s.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs leading-relaxed text-cream/75">{s.text}</p>
                </Reveal>
              </div>
            );
          })}

          {/* Magic UI Animated Beam between the step icons. Side-by-side layouts only: on phones the steps
              stack and the beam would run through the text. Off under reduced motion. */}
          {[0, 1].map((i) =>
            reduce || !wide ? null : (
              <AnimatedBeam
                key={i}
                containerRef={container}
                fromRef={refs[i]}
                toRef={refs[i + 1]}
                curvature={-30}
                pathColor="#f6f1e7"
                pathOpacity={0.15}
                pathWidth={2}
                gradientStartColor="#d08a3c"
                gradientStopColor="#f6f1e7"
                duration={4}
                delay={i * 1.2}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
