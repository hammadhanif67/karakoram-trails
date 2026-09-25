import { Contact } from "@/components/sections/contact";
import { Destinations } from "@/components/sections/destinations";
import { Footer } from "@/components/sections/footer";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Packages } from "@/components/sections/packages";
import { Testimonials } from "@/components/sections/testimonials";
import { WhyUs } from "@/components/sections/why-us";

export default function Home() {
  return (
    <>
      <a
        href="#destinations"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-apricot focus:px-4 focus:py-2 focus:text-apricot-ink"
      >
        Skip to content
      </a>
      <Navbar />
      <main>
        <Hero />
        <Destinations />
        <Packages />
        <WhyUs />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
