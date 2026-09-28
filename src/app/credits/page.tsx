import type { Metadata } from "next";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { Photo } from "@/components/ui/photo";
import { brand } from "@/lib/content";
import { photoCredits } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Photo credits | ${brand.name}`,
  description: "Sources, photographers and licences for the photos of Hunza, Skardu and Fairy Meadows used on this site.",
  path: "/credits/",
});

// Built from the image manifest (scripts/optimize-images.mjs), the same source as public/images/CREDITS.md.
export default function CreditsPage() {
  const credits = photoCredits();
  return (
    <>
      <Navbar solid />
      <main className="min-h-[70svh] bg-cream px-5 pt-36 pb-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">Photo credits</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight font-medium text-ink sm:text-6xl">Who took these photos</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-mist">
            Every photo on this site, with its photographer, source and licence. We checked that each one shows the place
            named on its source page before using it.
          </p>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((c) => (
              <li key={c.name} className="overflow-hidden rounded-2xl border border-line bg-white/60">
                <Photo name={c.name} alt={c.subject} sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="aspect-[3/2] w-full object-cover" />
                <div className="p-5 text-sm">
                  <p className="font-serif text-xl leading-snug text-ink">{c.subject}</p>
                  <p className="mt-2 text-mist">
                    Photo by {c.author} on{" "}
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-pine underline underline-offset-4 hover:text-apricot">
                      {c.site}
                    </a>
                  </p>
                  <p className="mt-1 text-mist">
                    <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-apricot">
                      {c.license}
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-12 max-w-3xl leading-relaxed text-mist">
            If you took a photo shown on this site and would like a different credit or its removal, write to{" "}
            <a href={`mailto:${brand.email}`} className="text-pine underline underline-offset-4 hover:text-apricot">
              {brand.email}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
