import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";
import { pageMetadata } from "@/lib/seo";
import { pageTitle, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: pageTitle("Admin sign in"),
  description: `Sign in to the ${site.name} admin.`,
  path: "/admin/login/",
  noindex: true,
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
