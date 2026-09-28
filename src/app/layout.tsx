import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { CurrencyProvider } from "@/lib/currency";
import { LiveDataProvider } from "@/lib/live-data";
import { MotionProvider } from "@/lib/motion-provider";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Both families are variable fonts: one file per style (latin subset only), whatever the number of weights.
// Only the weights the site uses are declared (Cormorant text without a weight class renders at 500).
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: "normal",
  display: "swap",
});

// Italic lives in its own call so it isn't preloaded on every page: it's the same "Cormorant" family, but
// only the home page uses it, and there the browser fetches it as soon as the italic text is laid out.
const cormorantItalic = Cormorant({
  variable: "--font-cormorant-italic", // unused; set so the call is referenced (its className would make text italic)
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Karakoram Trails | Tours to Hunza, Skardu and Fairy Meadows",
  description:
    "Small-group road journeys through Gilgit-Baltistan, planned day by day, with honest drive times and a local team on the ground.",
  // Every page builds its own canonical, Open Graph and Twitter tags with pageMetadata() (src/lib/seo.ts).
};

export const viewport: Viewport = {
  themeColor: "#0f1e22",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${cormorantItalic.variable} ${montserrat.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body> before React hydrates */}
      <body suppressHydrationWarning>
        <MotionProvider>
          <CurrencyProvider>
            <LiveDataProvider>{children}</LiveDataProvider>
          </CurrencyProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
