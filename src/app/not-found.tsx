import type { Metadata } from "next";
import Link from "next/link";
import { CtaButton } from "@/components/ui/cta-button";
import { LogoMark } from "@/components/ui/logo";
import { pageMetadata } from "@/lib/seo";
import { pageTitle, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: pageTitle("Page not found"),
  description: "This page doesn't exist. Head back to the home page for tours to Hunza, Skardu and Fairy Meadows.",
  path: null,
  noindex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-night px-5 text-center text-cream">
      <Link href="/" className="flex items-center gap-2">
        <LogoMark className="h-6 w-6 text-apricot" />
        <span className="font-serif text-2xl font-semibold">{site.name}</span>
      </Link>
      <p className="mt-16 font-serif text-8xl text-apricot">404</p>
      <h1 className="mt-4 font-serif text-4xl">This trail doesn&apos;t exist</h1>
      <p className="mt-4 max-w-md text-cream/75">The page may have moved. Head back to base camp and pick a new route.</p>
      <CtaButton href="/" arrow className="mt-10">
        Back to home
      </CtaButton>
    </main>
  );
}
