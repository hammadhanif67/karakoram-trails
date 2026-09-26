"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isBookableOnline } from "./booking-rules";
import { departures as fallbackDepartures, tours as fallbackTours } from "./content";

// Prices and departures come from D1 via /api/departures, so what the site shows always matches
// the checkout. The static content.ts values are only the build-time fallback: they render in the
// static HTML and stay if the API is unavailable (e.g. a host without Pages Functions).

export type LiveDeparture = {
  id: number | null; // D1 id; null for fallback rows
  tour: string; // tour slug
  date: string; // ISO date
  seats: number;
  seatsLeft: number;
  /** false within the online-booking cutoff: show "contact us on WhatsApp" instead. */
  bookable: boolean;
};

type ApiResponse = {
  tours: { slug: string; pricePKR: number }[];
  departures: { id: number; tour: string; date: string; seats: number; seatsLeft: number; bookable: boolean }[];
};

type LiveData = {
  source: "fallback" | "live";
  prices: Record<string, number>;
  departures: LiveDeparture[];
};

const fallback: LiveData = {
  source: "fallback",
  prices: Object.fromEntries(fallbackTours.map((t) => [t.slug, t.pricePKR])),
  // bookable: true until the browser can check the date (avoids a build-time vs. visit-time mismatch)
  departures: fallbackDepartures.map((d) => ({ id: null, ...d, bookable: true })),
};

const LiveDataContext = createContext<LiveData>(fallback);

function isApiResponse(x: unknown): x is ApiResponse {
  const r = x as ApiResponse;
  return (
    !!r &&
    Array.isArray(r.tours) &&
    Array.isArray(r.departures) &&
    r.tours.every((t) => typeof t.slug === "string" && Number.isInteger(t.pricePKR)) &&
    r.departures.every((d) => Number.isInteger(d.id) && typeof d.tour === "string" && typeof d.date === "string")
  );
}

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LiveData>(fallback);

  useEffect(() => {
    // Fallback rows: drop past departures and apply the cutoff with the visitor's clock.
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time-dependent values must be computed after hydration
    setData((d) =>
      d.source === "live"
        ? d
        : { ...d, departures: d.departures.filter((x) => x.date >= today).map((x) => ({ ...x, bookable: isBookableOnline(x.date, now) })) },
    );

    const ctrl = new AbortController();
    fetch("/api/departures", { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json: unknown) => {
        if (!isApiResponse(json)) throw new Error("Unexpected /api/departures response");
        setData({
          source: "live",
          prices: { ...fallback.prices, ...Object.fromEntries(json.tours.map((t) => [t.slug, t.pricePKR])) },
          departures: json.departures.map((d) => ({ ...d })),
        });
      })
      .catch(() => {
        /* keep the fallback (no API on this host, offline, or an error) */
      });
    return () => ctrl.abort();
  }, []);

  return <LiveDataContext.Provider value={data}>{children}</LiveDataContext.Provider>;
}

export const useLiveData = () => useContext(LiveDataContext);

/** Price per person (PKR) for a tour slug. */
export function useTourPrice(slug: string): number {
  return useContext(LiveDataContext).prices[slug];
}

/** Lowest current tour price (PKR). */
export function useFromPrice(): number {
  const { prices } = useContext(LiveDataContext);
  return Math.min(...Object.values(prices));
}

/** Upcoming departures, soonest first; optionally for one tour. */
export function useDepartures(tourSlug?: string): LiveDeparture[] {
  const { departures } = useContext(LiveDataContext);
  return useMemo(
    () => departures.filter((d) => !tourSlug || d.tour === tourSlug).sort((a, b) => a.date.localeCompare(b.date)),
    [departures, tourSlug],
  );
}
