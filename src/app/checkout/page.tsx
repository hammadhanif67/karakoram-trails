import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/components/booking/checkout-client";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { pageMetadata } from "@/lib/seo";
import { pageTitle, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: pageTitle("Reserve your seats"),
  description: `Reserve seats on a ${site.name} group departure with a ${site.booking.depositPercent}% deposit.`,
  path: "/checkout/",
  noindex: true,
});

// One static page for every departure: /checkout/?departure=<id>, read in the browser.
export default function CheckoutPage() {
  return (
    <>
      <Navbar solid />
      <Suspense fallback={<main className="min-h-svh bg-cream" />}>
        <CheckoutClient />
      </Suspense>
      <Footer />
    </>
  );
}
