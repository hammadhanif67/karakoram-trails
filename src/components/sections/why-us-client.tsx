"use client";

// Interactive parts of "Why travel with us"; the section itself is a server component (why-us.tsx).
import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/magicui/text-reveal";
import { Photo } from "@/components/ui/photo";
import { whyUs } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

/** The statement: Magic UI Text Reveal (words brighten one by one as you scroll), plain text under reduced motion. */
export function WhyUsStatement() {
  const reduce = useReducedMotionSafe();
  return reduce ? (
    <p className="mx-auto max-w-4xl px-5 pt-24 font-serif text-4xl leading-tight text-ink sm:px-8 sm:pt-32 lg:text-5xl">
      {whyUs.statement}
    </p>
  ) : (
    <TextReveal className="h-[160vh] font-serif font-medium text-ink [&_span.flex]:text-4xl [&_span.flex]:leading-tight [&_span.flex]:font-medium lg:[&_span.flex]:text-6xl">
      {whyUs.statement}
    </TextReveal>
  );
}

/** Altit Fort photo that drifts slightly against the page (off under reduced motion). */
export function WhyUsPhoto() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  return (
    <div ref={ref} className="relative h-[28rem] overflow-hidden rounded-3xl sm:h-[36rem] lg:h-[44rem]">
      <m.div className="absolute inset-x-0 -top-[10%] h-[120%]" style={{ y }}>
        <Photo name={whyUs.image} alt={whyUs.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
      </m.div>
    </div>
  );
}
