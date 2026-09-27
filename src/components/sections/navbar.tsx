"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Menu, Mountain, X } from "lucide-react";
import { brand } from "@/lib/content";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { HomeLink } from "@/components/ui/home-link";
import { CtaButton } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";

// Absolute "/#" links so they also work from the tour pages.
const links = [
  { href: "/#destinations", label: "Destinations" },
  { href: "/#route", label: "Route" },
  { href: "/#tours", label: "Tours" },
  { href: "/#departures", label: "Departures" },
  { href: "/#why-us", label: "Why us" },
  { href: "/#faq", label: "FAQ" },
];

/** `solid`: always use the dark bar (pages without a dark hero behind the navbar). */
export function Navbar({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid || scrolled || open ? "bg-night/90 py-3 shadow-lg shadow-night/20 backdrop-blur-md" : "py-5",
      )}
    >
      {/* Magic UI Scroll Progress */}
      <ScrollProgress className="h-0.5 bg-none bg-apricot" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <HomeLink className="flex items-center gap-2 text-cream" onClick={() => setOpen(false)}>
          <Mountain className="h-6 w-6 text-apricot" aria-hidden />
          <span className="font-serif text-2xl font-semibold tracking-wide">{brand.name}</span>
        </HomeLink>

        <ul className="hidden items-center gap-7 xl:gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-cream/85 transition-colors hover:text-apricot">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <CtaButton href="/#contact" shine className="hidden lg:inline-flex">
          Plan my trip
        </CtaButton>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-cream lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100svh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="flex flex-col gap-2 px-5 pt-8">
              {links.map((l, i) => (
                <m.li
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-serif text-4xl text-cream transition-colors hover:text-apricot"
                  >
                    {l.label}
                  </a>
                </m.li>
              ))}
            </ul>
            <div className="px-6 pt-8">
              <CtaButton href="/#contact" size="lg" shine className="w-full" onClick={() => setOpen(false)}>
                Plan my trip
              </CtaButton>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
