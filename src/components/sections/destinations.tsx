import { InteractiveTravelCard } from "@/components/ui/3d-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { destinations, photo } from "@/lib/content";

export function Destinations() {
  return (
    <section id="destinations" className="relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Popular destinations"
            title={
              <>
                Three valleys, <em className="text-pine">one unforgettable north</em>
              </>
            }
          />
          <Reveal delay={0.15} className="max-w-sm">
            <p className="text-base leading-relaxed text-mist">
              From orchard villages to cold deserts and glacier meadows. Pick one or see all three on the Grand
              Karakoram.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.12} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <InteractiveTravelCard
                title={d.title}
                subtitle={d.subtitle}
                image={photo(d.image)}
                blurb={d.blurb}
                season={d.best}
                actionText="View tours"
                href="#tours"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
