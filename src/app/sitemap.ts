import type { MetadataRoute } from "next";
import { tours } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    ...tours.map((t) => ({ url: `${siteUrl}/tours/${t.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
