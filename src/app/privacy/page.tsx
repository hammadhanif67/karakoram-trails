import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { brand, whatsappLink } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Privacy policy | ${brand.name}`,
  description: `What personal data ${brand.name} collects for bookings, how it is used and how to have it deleted.`,
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Privacy policy" current="/privacy/">
      <section>
        <h2>What we collect</h2>
        <p>When you book a tour, we collect:</p>
        <ul>
          <li>your name, email address and phone number;</li>
          <li>the number of travellers;</li>
          <li>any notes you add to your booking;</li>
          <li>the payment receipt you upload.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use these details only to handle your booking: to hold your seats, check your payment, contact you about
          your trip and keep a record of the booking. We do not sell your data or use it for advertising.
        </p>
      </section>

      <section>
        <h2>Payment receipts</h2>
        <p>
          Receipts are kept private. They are stored in a private file store and can only be opened by our team
          after signing in to our booking admin. They are never published.
        </p>
      </section>

      <section>
        <h2>Services we use</h2>
        <p>To run the booking system we rely on a few services, which handle your data on our behalf:</p>
        <ul>
          <li>Cloudflare hosts this site and stores bookings and receipts. It also runs the security check on our forms.</li>
          <li>Telegram delivers new-booking alerts to our team; an alert includes your name, phone, email and notes.</li>
          <li>WhatsApp, if you choose to message us there.</li>
        </ul>
      </section>

      <section>
        <h2>Deleting your data</h2>
        <p>
          To see or delete the data we hold about you, contact us on{" "}
          <a href={whatsappLink("Assalam o Alaikum, I'd like my booking data deleted.")} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{" "}
          or by email at <a href={`mailto:${brand.email}`}>{brand.email}</a>, with your booking reference if you have one.
        </p>
      </section>
    </LegalPage>
  );
}
