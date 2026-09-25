import type { NextConfig } from "next";

// Static export for Cloudflare Pages: `npm run build` writes plain HTML/CSS/JS to `out/`.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // No image server on a static host; photos are pre-optimized by scripts/optimize-images.mjs.
  images: { unoptimized: true },
};

export default nextConfig;
