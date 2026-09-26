// GET /api/departures
// Live tour prices and upcoming departures from D1 (the single source of truth). The site renders
// content.ts values in the static HTML and replaces them with this response in the browser.
import { isBookableOnline } from "../../src/lib/booking-rules";
import { releaseExpiredHolds } from "../../server/bookings";
import type { Env } from "../../server/env";

type TourRow = { slug: string; price_pkr: number };
type DepartureRow = { id: number; tour: string; date: string; seats: number; seats_left: number };

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const now = new Date();
  // Pakistan date (UTC+5): a departure stays listed through its own start day.
  const today = new Date(now.getTime() + 5 * 3600_000).toISOString().slice(0, 10);

  try {
    // Free seats from unpaid bookings whose hold has expired, so seatsLeft is accurate.
    await releaseExpiredHolds(env.DB, now);
    const [tours, departures] = await env.DB.batch([
      env.DB.prepare("SELECT slug, price_pkr FROM tours WHERE active = 1 ORDER BY id"),
      env.DB.prepare(
        `SELECT d.id, t.slug AS tour, d.start_date AS date, d.seats_total AS seats,
                d.seats_total - d.seats_booked - d.seats_held AS seats_left
           FROM departures d JOIN tours t ON t.id = d.tour_id
          WHERE d.status = 'open' AND t.active = 1 AND d.start_date >= ?1
          ORDER BY d.start_date, d.id`,
      ).bind(today),
    ]);

    const body = {
      generatedAt: now.toISOString(),
      depositPercent: Number(env.DEPOSIT_PERCENT ?? 30),
      tours: (tours.results as TourRow[]).map((t) => ({ slug: t.slug, pricePKR: t.price_pkr })),
      departures: (departures.results as DepartureRow[]).map((d) => ({
        id: d.id,
        tour: d.tour,
        date: d.date,
        seats: d.seats,
        seatsLeft: Math.max(0, d.seats_left),
        // Rule: no online booking within 72 h of departure ("contact us on WhatsApp").
        bookable: isBookableOnline(d.date, now),
      })),
    };

    return Response.json(body, {
      headers: {
        // Short cache: seat counts change as people book.
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (err) {
    console.error("GET /api/departures failed", err);
    return Response.json({ error: "Departures are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
};
