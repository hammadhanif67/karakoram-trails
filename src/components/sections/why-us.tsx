"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BedDouble, Compass, Headset, ShieldCheck, Users, Wallet, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { photo, reasons } from "@/lib/content";

const icons: Record<string, LucideIcon> = { Compass, ShieldCheck, Users, BedDouble, Wallet, Headset };

export function WhyUs() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  const hunza = photo("hunza");

  return (
    <section id="why-us" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div ref={ref} className="relative h-[26rem] overflow-hidden rounded-3xl sm:h-[34rem] lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)]">
          <motion.img
            src={hunza.src}
            srcSet={hunza.srcSet}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt="A rider on a golden autumn road through Hunza"
            loading="lazy"
            className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
            style={{ y }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-cream">
            <p className="font-serif text-2xl leading-snug italic sm:text-3xl">
              &ldquo;We only take guests to places we would take our own families.&rdquo;
            </p>
            <p className="mt-3 text-xs tracking-[0.2em] text-apricot uppercase">The Karakoram Trails team</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <SectionHeading
            eyebrow="Why choose us"
            title={
              <>
                Local roots, <em className="text-pine">premium care</em>
              </>
            }
            intro="We are a Gilgit-Baltistan team. That means better routes, warmer welcomes and help that is never more than a call away."
          />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {reasons.map((r, i) => {
              const Icon = icons[r.icon];
              return (
                <Reveal key={r.title} delay={(i % 2) * 0.1 + Math.floor(i / 2) * 0.08}>
                  <div className="group">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine text-cream transition-colors duration-300 group-hover:bg-apricot group-hover:text-apricot-ink">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-serif text-2xl font-semibold text-ink">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist">{r.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
