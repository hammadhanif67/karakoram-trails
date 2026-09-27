import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { ONLINE_CUTOFF_HOURS } from "@/lib/booking-rules";
import { bookingTerms, brand, cancellationPolicy, whatsappLink } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Terms and booking conditions | ${brand.name}`,
  description: "How booking, payment, changes and cancellations work on Karakoram Trails group tours.",
  path: "/terms/",
});

export default function TermsPage() {
  const t = bookingTerms;
  return (
    <LegalPage eyebrow="Terms" title="Terms and booking conditions" current="/terms/">
      <p>
        These conditions apply when you book a group tour with {brand.name}. By ticking &ldquo;I accept the booking
        conditions&rdquo; at checkout, or confirming a booking with us on WhatsApp, you agree to them.
      </p>

      <section>
        <h2>1. Booking and deposit</h2>
        <ul>
          <li>Prices are per person, in Pakistani rupees (PKR). USD amounts on the site are approximate conversions.</li>
          <li>A {t.depositPercent}% deposit reserves your seats. Pay it by bank transfer or Raast and upload the receipt.</li>
          <li>
            We hold unpaid seats for up to {t.holdHours} hours. If no receipt arrives in that time, the seats are released
            and the booking is cancelled.
          </li>
          <li>Your booking is confirmed once we have checked your payment. We tell you on WhatsApp.</li>
          <li>Online booking closes {ONLINE_CUTOFF_HOURS} hours before departure. After that, ask us on WhatsApp.</li>
        </ul>
      </section>

      <section>
        <h2>2. Balance</h2>
        <p>The balance is due {t.balanceDueDays} days before departure.</p>
      </section>

      <section>
        <h2>3. Cancellations and refunds</h2>
        <ul>
          {cancellationPolicy.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p>
          See the <Link href="/refund-policy/">refund policy</Link> for how to cancel and how refunds are paid.
        </p>
      </section>

      <section>
        <h2>4. The trip</h2>
        <ul>
          <li>Groups are limited to {t.maxGroup} travellers.</li>
          <li>
            Drive and hike times are approximate. Roads in Gilgit-Baltistan change with weather, roadworks and landslides.
          </li>
          <li>
            If a road is blocked or conditions are unsafe, the tour leader may re-route or change the day&apos;s plan. Safety
            comes before the schedule.
          </li>
          <li>What is and is not included is listed on each tour page.</li>
        </ul>
      </section>

      <section>
        <h2>5. Your responsibilities</h2>
        <ul>
          <li>Carry a valid CNIC or passport (and a Pakistan visa if you need one); there are checkposts on the KKH.</li>
          <li>Tell us about health conditions, dietary needs or anything that may affect your trip when you book.</li>
          <li>We recommend travel insurance. It is not included in the price.</li>
        </ul>
      </section>

      <section>
        <h2>6. Your data</h2>
        <p>
          How we use your booking details is explained in our <Link href="/privacy/">privacy policy</Link>.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Questions about these conditions: <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {brand.phoneDisplay}</a>{" "}
          or <a href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
