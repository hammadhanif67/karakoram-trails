import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingStatusClient } from "@/components/booking/booking-status-client";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { pageMetadata } from "@/lib/seo";

// The URL carries the customer's access token: never send it as a Referer and never index the page.
// Cloudflare Pages also sends Referrer-Policy: no-referrer and Cache-Control: no-store (public/_headers).
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Your booking | Karakoram Trails",
    description: "The status of your Karakoram Trails booking.",
    path: "/booking/",
    noindex: true,
  }),
  referrer: "no-referrer",
};

export default function BookingPage() {
  return (
    <>
      <Navbar solid />
      <main className="min-h-svh bg-cream pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Suspense fallback={<p className="text-center text-mist">Loading your booking…</p>}>
            <BookingStatusClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
