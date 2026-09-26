// Public site address, used for social-preview URLs, the sitemap and robots.txt.
// Set NEXT_PUBLIC_SITE_URL in Cloudflare Pages once the final domain is known.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://karakoram-trails.pages.dev").replace(/\/$/, "");
