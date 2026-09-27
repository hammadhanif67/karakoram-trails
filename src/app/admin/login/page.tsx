import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin sign in | Karakoram Trails",
  description: "Sign in to the Karakoram Trails admin.",
  path: "/admin/login/",
  noindex: true,
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
