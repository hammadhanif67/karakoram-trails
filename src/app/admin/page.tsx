import type { Metadata } from "next";
import { AdminClient } from "@/components/admin/admin-client";
import { pageMetadata } from "@/lib/seo";
import { pageTitle, site } from "@/lib/site";

// Static shell. Protected by Cloudflare Access at the edge and by functions/admin/_middleware.ts;
// all data comes from /api/admin/*, which verifies the Access token on every request.
export const metadata: Metadata = {
  ...pageMetadata({ title: pageTitle("Admin"), description: `${site.name} admin.`, path: "/admin/", noindex: true }),
  referrer: "no-referrer",
};

export default function AdminPage() {
  return (
    <main className="min-h-svh bg-stone-100 font-sans text-stone-900">
      <AdminClient />
    </main>
  );
}
