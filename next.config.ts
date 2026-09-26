import type { NextConfig } from "next";

// Static export for Cloudflare Pages: `npm run build` writes plain HTML/CSS/JS to `out/`.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // No image server on a static host; photos are pre-optimized by scripts/optimize-images.mjs.
  images: { unoptimized: true },
  // Hide the "N" dev-tools badge during `npm run dev` (it never appears on the built site).
  devIndicators: false,
};

export default nextConfig;
