import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
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
  title: "Karakoram Trails | Tours to Hunza, Skardu and Fairy Meadows",
  description:
    "Small-group and private tours through Northern Pakistan: Hunza Valley, Skardu and Fairy Meadows, with local guides, 4x4 transport and handpicked stays.",
  openGraph: {
    title: "Karakoram Trails",
    description: "Curated journeys through Hunza, Skardu and Fairy Meadows.",
    images: ["/images/skardu-1280.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1e22",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
