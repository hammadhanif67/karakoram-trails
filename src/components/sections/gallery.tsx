"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Photo } from "@/components/ui/photo";
import { gallery } from "@/lib/content";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Img = (typeof gallery)[number];

function Column({ images, y, className }: { images: Img[]; y: MotionValue<string>; className?: string }) {
  return (
    <motion.div style={{ y }} className={cn("flex flex-col gap-4 sm:gap-6", className)}>
      {images.map((img, i) => (
        <figure key={img.image} className="group relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <Photo
            name={img.image}
            alt={img.alt}
            sizes="(min-width: 768px) 33vw, 50vw"
            className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              i % 2 === 0 ? "aspect-[4/5]" : "aspect-square"
            }`}
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-night/80 to-transparent p-4 text-xs text-cream opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {img.alt}
          </figcaption>
        </figure>
      ))}
    </motion.div>
  );
}

/** Three-column grid where the middle column scrolls against the outer ones for a parallax feel. */
export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  // Columns stack differently on phones, where offsetting them would make images overlap.
  const wide = useMediaQuery("(min-width: 768px)");
  const still = reduce || !wide;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], still ? ["0%", "0%"] : ["8%", "-8%"]);
  const down = useTransform(scrollYProgress, [0, 1], still ? ["0%", "0%"] : ["-10%", "10%"]);

  const cols = [gallery.slice(0, 2), gallery.slice(2, 4), gallery.slice(4, 6)];

  return (
    <section id="gallery" className="overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title={
            <>
              Glimpses <em className="text-pine">of the north</em>
            </>
          }
        />
        <div ref={ref} className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          <Column images={cols[0]} y={up} />
          <Column images={cols[1]} y={down} className="md:mt-16" />
          <Column images={cols[2]} y={up} className="col-span-2 grid grid-cols-2 md:col-span-1 md:flex" />
        </div>
      </div>
    </section>
  );
}
