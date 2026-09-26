"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TextReveal } from "@/components/magicui/text-reveal";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { whyUs } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

export function WhyUs() {
  const reduce = useReducedMotionSafe();
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <section id="why-us" className="bg-cream">
      {/* Magic UI Text Reveal: words brighten one by one as you scroll */}
      {reduce ? (
        <p className="mx-auto max-w-4xl px-5 pt-24 font-serif text-4xl leading-tight text-ink sm:px-8 sm:pt-32 lg:text-5xl">
          {whyUs.statement}
        </p>
      ) : (
        <TextReveal className="h-[160vh] font-serif font-medium text-ink [&_span.flex]:text-4xl [&_span.flex]:leading-tight [&_span.flex]:font-medium lg:[&_span.flex]:text-6xl">
          {whyUs.statement}
        </TextReveal>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-5 pt-8 pb-24 sm:px-8 sm:pb-32 lg:grid-cols-[6fr_5fr] lg:gap-20">
        <div ref={photoRef} className="relative h-[28rem] overflow-hidden rounded-3xl sm:h-[36rem] lg:h-[44rem]">
          <motion.div className="absolute inset-x-0 -top-[10%] h-[120%]" style={{ y }}>
            <Photo name={whyUs.image} alt={whyUs.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
          </motion.div>
        </div>

        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.25em] text-apricot uppercase">Why travel with us</p>
          </Reveal>
          <ol className="mt-8 space-y-10">
            {whyUs.points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-line pt-8">
                  <span className="font-serif text-5xl leading-none text-apricot italic" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl leading-tight font-medium text-ink">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-mist">{p.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      {/* Stats in large type on a dark band, counted up with Magic UI Number Ticker */}
      <div className="bg-night text-cream">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-cream/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {whyUs.stats.map((s, i) => (
            <div key={s.label} className="py-10 sm:px-10 sm:py-16 sm:first:pl-0">
              <dt className="text-xs tracking-[0.25em] text-cream/60 uppercase">{s.label}</dt>
              <dd className="mt-4 flex items-baseline font-serif text-7xl leading-none font-medium tabular-nums lg:text-8xl">
                <NumberTicker
                  value={s.value}
                  startValue={s.start}
                  decimalPlaces={s.decimals ?? 0}
                  delay={0.15 * i}
                  className="tracking-normal text-cream"
                />
                <span className="ml-1 text-4xl text-apricot lg:text-5xl">{s.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
