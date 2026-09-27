import type { Metadata } from "next";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { brand } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Photo credits | ${brand.name}`,
  description: "Sources, photographers and licences for the photos of Hunza, Skardu and Fairy Meadows used on this site.",
  path: "/credits/",
});

// The per-photo list (file, source, author, licence) is added with the image update (CONTENT_BRIEF section 9),
// from public/images/CREDITS.md.
export default function CreditsPage() {
  return (
    <>
      <Navbar solid />
      <main className="min-h-[70svh] bg-cream px-5 pt-36 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">Photo credits</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight font-medium text-ink sm:text-6xl">Who took these photos</h1>
          <p className="mt-6 text-lg leading-relaxed text-mist">
            We are replacing the photos on this site with verified images of each place, from Unsplash, Pexels and
            Wikimedia Commons. Each one will be listed here with its source, photographer and licence.
          </p>
          <p className="mt-4 leading-relaxed text-mist">
            If you took a photo shown on this site and would like a credit or its removal, write to{" "}
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
