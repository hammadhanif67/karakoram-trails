"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/content";

/** Compact phone-only WhatsApp button that appears once the visitor scrolls past the hero. */
export function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <m.a
          href={whatsappLink("Assalam o Alaikum, I'd like to plan a trip.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-whatsapp transition-colors duration-250 hover:bg-whatsapp-hover active:bg-whatsapp-hover px-4 text-[0.7rem] font-medium tracking-[0.14em] text-white uppercase shadow-lg shadow-night/30 ring-1 ring-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-apricot lg:hidden"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </m.a>
      )}
    </AnimatePresence>
  );
}
