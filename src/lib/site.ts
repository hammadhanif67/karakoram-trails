import { site } from "../../site.config";

export { site };

// Public site address, used for social-preview URLs, the sitemap and robots.txt. NEXT_PUBLIC_SITE_URL
// (set per deployment in Cloudflare Pages) overrides the default in site.config.ts.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");

/** "Page | Karakoram Trails" */
export const pageTitle = (page: string) => `${page} | ${site.name}`;
