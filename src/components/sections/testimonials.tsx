import { Quote } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/content";

type Item = (typeof testimonials)[number];

function Card({ t }: { t: Item }) {
  return (
    <figure className="w-[19rem] shrink-0 rounded-3xl border border-line bg-white/70 p-6 sm:w-[23rem]">
      <div className="flex items-center justify-between">
        {/* One SVG for the five stars: this card is repeated 24 times by the marquee */}
        <svg viewBox="0 0 100 18" className="h-4 w-[5.5rem] fill-apricot" role="img" aria-label="5 out of 5 stars">
          <path d="M9 0l2.6 5.6 6.1.6-4.6 4.1 1.3 6L9 13.2 3.6 16.3l1.3-6L.3 6.2l6.1-.6zM29.5 0l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6zM50 0l2.6 5.6 6.1.6-4.6 4.1 1.3 6L50 13.2l-5.4 3.1 1.3-6-4.6-4.1 6.1-.6zM70.5 0l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6zM91 0l2.6 5.6 6.1.6-4.6 4.1 1.3 6L91 13.2l-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
        <Quote className="h-6 w-6 text-line" aria-hidden />
      </div>
      <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-ink">{t.text}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-serif text-lg text-cream" aria-hidden>
          {t.name[0]}
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">{t.name}</span>
          <span className="block text-xs text-mist">
            {t.from} · {t.trip}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section id="stories" className="overflow-hidden bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="Traveller stories"
          title={
            <>
              Memories that <em className="text-pine">outlast the trip</em>
            </>
          }
        />
      </div>
      <div className="mt-14 space-y-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee pauseOnHover repeat={2} className="[--duration:60s] [--gap:1.5rem]">
          {testimonials.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse repeat={2} className="[--duration:60s] [--gap:1.5rem]" aria-hidden>
          {[...testimonials].reverse().map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
