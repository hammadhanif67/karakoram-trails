import { MapPin } from "lucide-react";
import { LayeredParallaxHero } from "@/components/ui/layer-parallax-hero";
import { CtaButton } from "@/components/ui/cta-button";
import { HeroFacts, HeroPlaces } from "./hero-client";

const places = ["Hunza", "Skardu", "Fairy Meadows", "Khunjerab"];

// Server component: the text is in the static HTML; only the rotating place name and the facts strip
// (live prices and dates) are client components (hero-client.tsx).
const HERO = "hero-passu-cones" as const;

export function Hero() {
  // No preload() for the hero photo: React would also put the hint in the prefetched home-page data, so
  // every page linking home would download it. The <img> already has fetchPriority="high".
  // Entrance is plain CSS (animate-hero-rise), so the text shows on first paint instead of
  // staying invisible until JavaScript has loaded and hydrated.
  const rise = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

  return (
    <LayeredParallaxHero
      image={{ name: HERO, alt: "The jagged Passu Cones under a wide, cloud-streaked sky in upper Hunza" }}
      footer={<HeroFacts />}
    >
      <div id="top" className="mx-auto w-full max-w-7xl px-5 pt-28 pb-12 sm:px-8 [@media(max-height:720px)]:pt-20 [@media(max-height:720px)]:pb-8">
        <p
          {...rise(0.05)}
          className="animate-hero-rise flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-apricot uppercase"
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span>Journeys to</span>
          <HeroPlaces places={places} />
        </p>

        <h1
          {...rise(0.15)}
          className="animate-hero-rise mt-6 max-w-4xl font-serif text-[3.25rem] leading-[0.95] font-medium text-cream sm:text-7xl lg:text-8xl xl:text-[7.5rem] [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:text-[2.6rem] [@media(max-height:720px)_and_(min-width:640px)]:text-6xl"
        >
          Where the mountains <em className="text-apricot">still keep secrets</em>
        </h1>

        <p {...rise(0.3)} className="animate-hero-rise mt-6 max-w-xl [@media(max-height:720px)]:mt-4 text-base leading-relaxed text-cream/85 sm:text-lg">
          Small-group road journeys through Gilgit-Baltistan, planned day by day, with honest drive times and a local
          team on the ground.
        </p>

        <div {...rise(0.45)} className="animate-hero-rise mt-9 flex flex-wrap gap-3 sm:gap-4 [@media(max-height:720px)]:mt-6">
          <CtaButton href="#tours" size="lg" arrow>
            Explore tours
          </CtaButton>
          <CtaButton href="#destinations" variant="outline" size="lg">
            See destinations
          </CtaButton>
        </div>

      </div>
    </LayeredParallaxHero>
  );
}
