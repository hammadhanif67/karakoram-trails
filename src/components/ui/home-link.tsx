"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

type Props = Omit<React.ComponentProps<typeof Link>, "href">;

/**
 * Link to the home page. On other pages it navigates home; on the home page itself (where a plain
 * link to "/" does nothing, e.g. from "/#tours") it scrolls back to the top and clears the hash.
 */
export function HomeLink({ onClick, ...props }: Props) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      onClick={(e) => {
        onClick?.(e);
        if (pathname !== "/" || e.defaultPrevented) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        if (window.location.hash) history.replaceState(null, "", "/");
      }}
      {...props}
    />
  );
}

/** Scrolls the current page back to the top (any page). */
export function BackToTop({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {children}
    </button>
  );
}
