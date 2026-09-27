import { cn } from "@/lib/utils";

type RevealProps = { delay?: number; className?: string; children: React.ReactNode };

/**
 * Scroll-in animation used across sections: a CSS scroll-driven animation (`.reveal` in globals.css),
 * no JavaScript. It only runs where the browser supports `animation-timeline: view()` and the visitor
 * allows motion; everywhere else the content is simply shown. `delay` (seconds, as before) staggers
 * neighbouring items by starting their animation slightly later in the scroll.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  return (
    <div className={cn("reveal", className)} style={delay ? ({ "--reveal-offset": `${Math.round(delay * 40)}%` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}
