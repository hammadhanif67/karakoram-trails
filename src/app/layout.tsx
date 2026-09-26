import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { CurrencyProvider } from "@/lib/currency";
import { MotionProvider } from "@/lib/motion-provider";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Karakoram Trails | Tours to Hunza, Skardu and Fairy Meadows",
  description:
    "Small-group and private tours through Northern Pakistan: Hunza Valley, Skardu and Fairy Meadows, with local guides, 4x4 transport and handpicked stays.",
  openGraph: {
    title: "Karakoram Trails",
    description: "Curated journeys through Hunza, Skardu and Fairy Meadows.",
    images: ["/images/hero-skardu-shangrila-1280.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1e22",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${montserrat.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body> before React hydrates */}
      <body suppressHydrationWarning>
        <MotionProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
