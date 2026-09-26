import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/components/booking/checkout-client";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";

export const metadata: Metadata = {
  title: "Reserve your seats | Karakoram Trails",
  robots: { index: false, follow: false },
};

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
