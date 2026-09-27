import Link from "next/link";
import { ArrowUp, Mail, MapPin, MessageCircle, Mountain, Phone } from "lucide-react";
import { CtaButton } from "@/components/ui/cta-button";
import { BackToTop, HomeLink } from "@/components/ui/home-link";
import { brand, tours, whatsappLink } from "@/lib/content";

const explore = [
  { href: "/#destinations", label: "Destinations" },
  { href: "/#when-to-go", label: "When to go" },
  { href: "/#route", label: "The route" },
  { href: "/#departures", label: "Departures" },
  { href: "/#why-us", label: "Why travel with us" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

function Heading({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.7rem] font-medium tracking-[0.25em] text-apricot uppercase">{children}</p>;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-cream/70">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Brand and a closing call to action */}
        <div className="flex flex-col gap-8 border-b border-cream/10 py-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <HomeLink className="inline-flex items-center gap-2 text-cream">
              <Mountain className="h-7 w-7 text-apricot" aria-hidden />
              <span className="font-serif text-3xl font-semibold">{brand.name}</span>
            </HomeLink>
            <p className="mt-4 leading-relaxed">
              Small-group road journeys through Hunza, Skardu and Fairy Meadows, planned day by day by a team on the
              ground in Gilgit-Baltistan.
            </p>
          </div>
          <CtaButton
            href={whatsappLink("Assalam o Alaikum, I'd like to plan a trip.")}
            target="_blank"
            rel="noopener noreferrer"
            icon={<MessageCircle className="h-4 w-4" aria-hidden />}
            className="self-start lg:self-auto"
          >
            Plan your trip on WhatsApp
          </CtaButton>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
          <nav aria-label="Tours">
            <Heading>Tours</Heading>
            <ul className="mt-5 space-y-3 text-sm">
              {tours.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tours/${t.slug}/`} className="transition-colors hover:text-cream">
                    {t.name}
                    <span className="text-cream/40"> · {t.days} days</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Explore">
            <Heading>Explore</Heading>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-1">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <Heading>Contact</Heading>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a href={`tel:+${brand.whatsapp}`} className="flex items-center gap-3 transition-colors hover:text-cream">
                  <Phone className="h-4 w-4 shrink-0 text-apricot" aria-hidden />
                  {brand.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-3 break-all transition-colors hover:text-cream">
                  <Mail className="h-4 w-4 shrink-0 text-apricot" aria-hidden />
                  {brand.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-apricot" aria-hidden />
                {brand.office}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        {/* Extra bottom room on phones so the floating WhatsApp button / booking bar never covers it */}
        <div className="flex flex-col gap-4 border-t border-cream/10 pt-6 pb-28 text-xs md:flex-row md:items-center md:justify-between md:gap-8 lg:pb-6">
          <p>
            © {year} {brand.name}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { href: "/terms/", label: "Terms" },
                { href: "/privacy/", label: "Privacy" },
                { href: "/refund-policy/", label: "Refund policy" },
                { href: "/credits/", label: "Photo credits" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 transition-colors hover:text-cream hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <BackToTop className="inline-flex cursor-pointer items-center gap-2 self-start tracking-[0.2em] uppercase transition-colors hover:text-cream">
            Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </BackToTop>
        </div>
      </div>
    </footer>
  );
}
