import type { Metadata } from "next";
import { AdminClient } from "@/components/admin/admin-client";

// Static shell. Protected by Cloudflare Access at the edge and by functions/admin/_middleware.ts;
// all data comes from /api/admin/*, which verifies the Access token on every request.
export const metadata: Metadata = {
  title: "Admin | Karakoram Trails",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminPage() {
  return (
    <main className="min-h-svh bg-stone-100 font-sans text-stone-900">
      <AdminClient />
    </main>
  );
}
