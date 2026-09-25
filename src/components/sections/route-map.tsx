"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { routeStops } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

// Simple equirectangular projection of the stops into the SVG's coordinate space.
const W = 640;
const H = 520;
const PAD = 70;
const lons = routeStops.map((s) => s.lon);
const lats = routeStops.map((s) => s.lat);
const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
const project = (lat: number, lon: number) => ({
  x: PAD + ((lon - minLon) / (maxLon - minLon)) * (W - PAD * 2),
  y: PAD + ((maxLat - lat) / (maxLat - minLat)) * (H - PAD * 2),
});
const points = routeStops.map((s) => ({ ...s, ...project(s.lat, s.lon) }));

// Smooth path: quadratic curves bending slightly to one side between consecutive stops.
const pathD = points.reduce((d, p, i) => {
  if (i === 0) return `M ${p.x} ${p.y}`;
  const prev = points[i - 1];
  const mx = (prev.x + p.x) / 2;
  const my = (prev.y + p.y) / 2;
  const dx = p.x - prev.x;
  const dy = p.y - prev.y;
  const bend = 0.18;
  return `${d} Q ${mx - dy * bend} ${my + dx * bend} ${p.x} ${p.y}`;
}, "");

// Fraction of the route reached at each stop (by straight-line distance; close enough for timing).
const segs = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
const total = segs.reduce((a, b) => a + b, 0);
const stopAt = points.map((_, i) => segs.slice(0, i).reduce((a, b) => a + b, 0) / total);

function Stop({ p, i, progress }: { p: (typeof points)[number]; i: number; progress: MotionValue<number> }) {
  const at = stopAt[i];
  const opacity = useTransform(progress, [Math.max(0, at - 0.04), at], [0, 1]);
  const scale = useTransform(progress, [Math.max(0, at - 0.04), at], [0.4, 1]);
  const pos =
    p.label === "right"
      ? { x: p.x + 20, y: p.y + 9, anchor: "start" as const }
      : p.label === "above"
        ? { x: p.x, y: p.y - 26, anchor: "middle" as const }
        : { x: p.x, y: p.y + 44, anchor: "middle" as const };
  return (
    <motion.g style={{ opacity }}>
      <motion.circle cx={p.x} cy={p.y} r={16} fill="var(--apricot)" opacity={0.18} style={{ scale, transformOrigin: `${p.x}px ${p.y}px` }} />
      <circle cx={p.x} cy={p.y} r={7} fill="var(--apricot)" stroke="var(--night)" strokeWidth={3} />
      {/* Names only (the notes are in the list beside the map); sized to stay legible on phones */}
      <text
        x={pos.x}
        y={pos.y}
        textAnchor={pos.anchor}
        className="fill-cream font-serif text-[30px]"
      >
        {p.name}
      </text>
    </motion.g>
  );
}

/**
 * SVG route across the north, built for this site (no Magic UI equivalent). The route draws itself
 * once the map scrolls into view, so it always completes however fast or slowly the visitor scrolls.
 */
export function RouteMap() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const drawn = useMotionValue(0);

  useEffect(() => {
    if (reduce) {
      drawn.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(drawn, 1, { duration: 3, ease: [0.45, 0, 0.25, 1] });
    return () => controls.stop();
  }, [inView, reduce, drawn]);

  return (
    <section id="route" className="relative overflow-hidden bg-night py-24 text-cream sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="The route"
            title={
              <>
                From the capital <em className="text-apricot">to the foot of Nanga Parbat</em>
              </>
            }
            intro="Our Grand Karakoram loop follows the old caravan roads: up the Kaghan Valley, over Babusar Pass, along the Karakoram Highway to Hunza, east to Skardu and back to Fairy Meadows."
          />
          <ol className="mt-10 space-y-4 border-l border-cream/15 pl-6">
            {routeStops.map((s, i) => (
              <li key={s.name} className="relative">
                <span aria-hidden className="absolute top-1.5 -left-[29px] h-2.5 w-2.5 rounded-full bg-apricot" />
                <span className="font-serif text-2xl">{s.name}</span>
                <span className="ml-3 text-xs tracking-[0.15em] text-cream/60 uppercase">
                  {i === 0 ? "Start" : `Stop ${i}`} · {s.note}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div ref={ref} className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Map of the route: Islamabad, Naran, Hunza, Skardu, Fairy Meadows"
          >
            {/* Decorative contour rings */}
            <g fill="none" stroke="var(--cream)" strokeOpacity={0.06}>
              {[60, 110, 160, 210, 260].map((r) => (
                <ellipse key={r} cx={W * 0.62} cy={H * 0.32} rx={r * 1.4} ry={r} />
              ))}
            </g>
            {/* Full route, faint */}
            <path d={pathD} fill="none" stroke="var(--cream)" strokeOpacity={0.15} strokeWidth={2} strokeDasharray="4 8" strokeLinecap="round" />
            {/* Route drawn on scroll */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="var(--apricot)"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ pathLength: drawn }}
            />
            {points.map((p, i) => (
              <Stop key={p.name} p={p} i={i} progress={drawn} />
            ))}
          </svg>
          <p className="mt-4 text-center text-xs text-cream/50">Map not to scale</p>
        </div>
      </div>
    </section>
  );
}
