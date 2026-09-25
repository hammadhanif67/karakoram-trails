import Link from "next/link";
import { Mountain } from "lucide-react";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata = { title: "Page not found | Karakoram Trails" };

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-night px-5 text-center text-cream">
      <Link href="/" className="flex items-center gap-2">
        <Mountain className="h-6 w-6 text-apricot" aria-hidden />
        <span className="font-serif text-2xl font-semibold">Karakoram Trails</span>
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
