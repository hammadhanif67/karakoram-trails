import { site } from "../../site.config";

export { site };

// Public site address, used for social-preview URLs, the sitemap and robots.txt. NEXT_PUBLIC_SITE_URL
// (set per deployment in Cloudflare Pages) overrides the default in site.config.ts.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");

/**
 * The config colours as CSS variables for <html>: --night, --pine-deep, ... (globals.css maps them to
 * Tailwind colours), plus --night-rgb ("15 30 34") for the scrims' rgb(var(--night-rgb) / 0.88).
 */
export function colorVariables() {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(site.colors)) vars[`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  vars["--night-rgb"] = [1, 3, 5].map((i) => parseInt(site.colors.night.slice(i, i + 2), 16)).join(" ");
  return vars as React.CSSProperties;
}

/** "Page | Karakoram Trails" */
export const pageTitle = (page: string) => `${page} | ${site.name}`;
