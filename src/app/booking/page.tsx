import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingStatusClient } from "@/components/booking/booking-status-client";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";

// The URL carries the customer's access token: never send it as a Referer and never index the page.
// Cloudflare Pages also sends Referrer-Policy: no-referrer and Cache-Control: no-store (public/_headers).
export const metadata: Metadata = {
  title: "Your booking | Karakoram Trails",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
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
