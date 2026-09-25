import { Quote, Star } from "lucide-react";
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

/** Row of cards duplicated once so the CSS marquee can loop seamlessly. Pauses on hover and focus. */
function MarqueeRow({ items, reverse = false }: { items: Item[]; reverse?: boolean }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max gap-6 pr-6 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {items.map((t) => (
          <Card key={t.name} t={t} />
        ))}
        <div className="flex gap-6" aria-hidden>
          {items.map((t) => (
            <Card key={`${t.name}-dup`} t={t} />
          ))}
        </div>
      </div>
    </div>
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
      <div className="mt-14 space-y-6">
        <MarqueeRow items={testimonials} />
        <MarqueeRow items={[...testimonials].reverse()} reverse />
      </div>
    </section>
  );
}
