import type { Metadata } from "next";
import { photo, type ImageName } from "./images";
import { site } from "./site";

const DEFAULT_IMAGE = site.seo.defaultImage as ImageName;

/**
 * Full metadata for one page. Next.js merges metadata shallowly, so a page that sets only a title would
 * otherwise inherit the root layout's openGraph (title, description, url) unchanged; every page therefore
 * builds its own canonical URL, Open Graph and Twitter tags here. `path` is relative to metadataBase and
 * ends with "/" (trailingSlash: true); pass null for pages without a canonical address (404).
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  imageAlt,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string | null;
  image?: ImageName;
  imageAlt?: string;
  noindex?: boolean;
}): Metadata {
  const images = [{ url: photo(image).src, alt: imageAlt ?? title }];
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.seo.locale,
      title,
      description,
      images,
      ...(path ? { url: path } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
