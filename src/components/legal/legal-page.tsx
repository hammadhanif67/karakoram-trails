import Link from "next/link";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { legalMeta } from "@/lib/content";

export const legalLinks = [
  { href: "/terms/", label: "Terms and booking conditions" },
  { href: "/refund-policy/", label: "Refund policy" },
  { href: "/privacy/", label: "Privacy policy" },
];

/** Shared layout for /terms, /privacy and /refund-policy. */
export function LegalPage({ eyebrow, title, current, children }: { eyebrow: string; title: string; current: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar solid />
      <main className="bg-cream px-5 pt-36 pb-24 sm:px-8">
        <article className="mx-auto max-w-3xl">
          {legalMeta.draft && (
            <p role="note" className="mb-8 rounded-2xl border border-apricot/40 bg-apricot/10 px-5 py-4 text-sm text-ink">
              <strong className="font-semibold">Draft.</strong> This page is being reviewed by the business owner and may
              change before it is final.
            </p>
          )}
          <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight font-medium text-ink sm:text-6xl">{title}</h1>
          <p className="mt-3 text-sm text-mist">Last updated {legalMeta.updated}</p>
          <div className="mt-10 space-y-10 leading-relaxed text-ink [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-3 [&_section>ul]:mt-3 [&_section>ul]:list-disc [&_section>ul]:pl-5 [&_a]:text-pine [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-apricot">
            {children}
          </div>
          <nav aria-label="Legal pages" className="mt-16 border-t border-line pt-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {legalLinks
                .filter((l) => l.href !== current)
                .map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-pine underline underline-offset-4 hover:text-apricot">
                      {l.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
