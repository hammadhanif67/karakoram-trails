import { Contact } from "@/components/sections/contact";
import { Departures } from "@/components/sections/departures";
import { Destinations } from "@/components/sections/destinations";
import { Faq } from "@/components/sections/faq";
import { FloatingWhatsApp } from "@/components/sections/floating-whatsapp";
import { Footer } from "@/components/sections/footer";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Navbar } from "@/components/sections/navbar";
import { Packages } from "@/components/sections/packages";
import { Promises } from "@/components/sections/promises";
import { RouteMap } from "@/components/sections/route-map";
import { Testimonials } from "@/components/sections/testimonials";
import { WhenToGo } from "@/components/sections/when-to-go";
import { WhyUs } from "@/components/sections/why-us";
import { features } from "@/lib/content";

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
        <WhenToGo />
        <RouteMap />
        <Packages />
        <Departures />
        <WhyUs />
        <HowItWorks />
        {features.showTestimonials ? <Testimonials /> : <Promises />}
        <Gallery />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
