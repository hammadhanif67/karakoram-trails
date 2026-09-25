import { Mountain } from "lucide-react";
import { brand, destinations } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-night text-cream/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <a href="#top" className="flex items-center gap-2 text-cream">
            <Mountain className="h-6 w-6 text-apricot" aria-hidden />
            <span className="font-serif text-2xl font-semibold">{brand.name}</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Small-group and private tours through Gilgit-Baltistan, run by people who call it home.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-apricot uppercase">Destinations</p>
          <ul className="mt-4 space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d.slug}>
                <a href="#destinations" className="hover:text-apricot">
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-apricot uppercase">Get in touch</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{brand.phoneDisplay}</li>
            <li>{brand.email}</li>
            <li>{brand.office}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-6 text-center text-xs text-cream/70">
        © {new Date().getFullYear()} {brand.name}. Photos from Pexels.
      </div>
    </footer>
  );
}
