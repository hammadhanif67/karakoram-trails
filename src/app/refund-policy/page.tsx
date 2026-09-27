import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { brand, cancellationPolicy, whatsappLink } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Refund policy | ${brand.name}`,
  description: "How deposit refunds and free date changes work on Karakoram Trails group tours, and how to cancel a booking.",
  path: "/refund-policy/",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="Refund policy" title="Cancellations and refunds" current="/refund-policy/">
      <section>
        <h2>If you cancel</h2>
        <p>Refunds depend on how long before the departure date you tell us:</p>
        {/* Same list as the FAQ and the checkout (content.ts: cancellationPolicy) */}
        <ul>
          {cancellationPolicy.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>How to cancel</h2>
        <p>
          Send us your booking reference (KT-…) on{" "}
          <a href={whatsappLink("Assalam o Alaikum, I'd like to cancel my booking.")} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{" "}
          or by email at <a href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>
      </section>
      <section>
        <h2>How refunds are paid</h2>
        <p>We confirm the refund amount with you and arrange the payment on WhatsApp or by email.</p>
      </section>
      <section>
        <h2>More details</h2>
        <p>
          This policy is part of our <Link href="/terms/">terms and booking conditions</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
