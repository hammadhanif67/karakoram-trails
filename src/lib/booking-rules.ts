// Booking rules shared by the site (browser) and the Pages Functions (server).
// Pure functions only: no framework or Cloudflare types, so both sides can import this file.

/** Online booking closes this many hours before a departure starts. */
export const ONLINE_CUTOFF_HOURS = 72;

const HOUR = 60 * 60 * 1000;

/**
 * Departures are stored as calendar dates. Treat a departure as starting at 00:00 Pakistan time
 * (UTC+5, no daylight saving), which is the conservative reading of the date.
 */
export function departureStart(date: string): Date {
  return new Date(`${date}T00:00:00+05:00`);
}

/** True while the departure is more than ONLINE_CUTOFF_HOURS away. */
export function isBookableOnline(date: string, now: Date = new Date()): boolean {
  return departureStart(date).getTime() - now.getTime() > ONLINE_CUTOFF_HOURS * HOUR;
}

/**
 * When an unpaid ('pending_payment') booking releases its seats:
 * the earlier of now + holdHours and departure start - ONLINE_CUTOFF_HOURS.
 * Bookings in 'verifying' never auto-expire (enforced where this is used, stage 2).
 */
export function holdExpiresAt(date: string, holdHours: number, now: Date = new Date()): Date {
  const byHold = now.getTime() + holdHours * HOUR;
  const byCutoff = departureStart(date).getTime() - ONLINE_CUTOFF_HOURS * HOUR;
  return new Date(Math.min(byHold, byCutoff));
}

/** Deposit rounded to whole rupees. */
export function depositFor(totalPkr: number, percent: number): number {
  return Math.round((totalPkr * percent) / 100);
}
