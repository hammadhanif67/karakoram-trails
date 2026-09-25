import { Quote, Star } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/content";

type Item = (typeof testimonials)[number];

function Card({ t }: { t: Item }) {
  return (
    <figure className="w-[19rem] shrink-0 rounded-3xl border border-line bg-white/70 p-6 sm:w-[23rem]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-apricot" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
          ))}
        </div>
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
    <section id="stories" className="overflow-hidden bg-[#efe8da] py-24 sm:py-32">
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
