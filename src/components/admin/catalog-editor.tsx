"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Info, Plus, RefreshCw } from "lucide-react";
import { isBookableOnline } from "@/lib/booking-rules";
import { departures as fallbackDepartures, formatDate, formatPrice, getTour, seasonWarnings, tours as fallbackTours, type SeasonWarning } from "@/lib/content";
import { cn } from "@/lib/utils";
import { api, ApiError } from "./api";

type Tour = { slug: string; name: string; price_pkr: number; active: number };
type Departure = {
  id: number;
  tour: string;
  start_date: string;
  seats_total: number;
  seats_booked: number;
  seats_held: number;
  status: "open" | "closed" | "cancelled";
  active_bookings: number;
};
type AdminEvent = {
  id: number;
  created_at: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
};
type Catalog = { maxGroupSize: number; tours: Tour[]; departures: Departure[]; events: AdminEvent[] };
type ActiveBooking = { ref: string; status: string; travellers: number; lead_name: string };

const btn = "cursor-pointer rounded border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50";
const btnDark = "cursor-pointer rounded bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50";
const input = "h-9 rounded border border-stone-300 bg-white px-2.5 text-sm";
const dt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/** Today in Pakistan (UTC+5), as used by the public departures list. */
const todayPk = () => new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Earliest date that is still more than 72 hours away (the online-booking cutoff). */
function firstAllowedDate() {
  let d = todayPk();
  while (!isBookableOnline(d)) d = addDays(d, 1);
  return d;
}

/** Differences between D1 and the build-time fallback in content.ts (same rules as scripts/seed-d1.mjs). */
function drift(c: Catalog): string[] {
  const out: string[] = [];
  const today = todayPk();
  for (const t of fallbackTours) {
    const db = c.tours.find((x) => x.slug === t.slug && x.active);
    if (!db) out.push(`${t.name}: in content.ts but not active in D1.`);
    else {
      if (db.name !== t.name) out.push(`${t.slug}: name is "${db.name}" in D1, "${t.name}" in content.ts.`);
      if (db.price_pkr !== t.pricePKR) out.push(`${t.name}: price is ${formatPrice(db.price_pkr, "PKR")} in D1, ${formatPrice(t.pricePKR, "PKR")} in content.ts.`);
    }
  }
  const key = (tour: string, date: string, seats: number) => `${tour}|${date}|${seats}`;
  const dbSet = new Set(c.departures.filter((d) => d.status === "open" && d.start_date >= today).map((d) => key(d.tour, d.start_date, d.seats_total)));
  const fbSet = new Set(fallbackDepartures.filter((d) => d.date >= today).map((d) => key(d.tour, d.date, d.seats)));
  const label = (k: string) => {
    const [tour, date, seats] = k.split("|");
    return `${getTour(tour)?.name ?? tour} ${formatDate(date)} (${seats} seats)`;
  };
  for (const k of dbSet) if (!fbSet.has(k)) out.push(`${label(k)}: open in D1, missing from content.ts.`);
  for (const k of fbSet) if (!dbSet.has(k)) out.push(`${label(k)}: in content.ts, not open in D1.`);
  return out;
}

export function CatalogEditor() {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api<Catalog>("/api/admin/catalog"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
  }, [load]);

  const done = (message: string) => {
    setNotice(message);
    load();
  };

  const diffs = data ? drift(data) : [];
  const today = todayPk();

  return (
    <section aria-labelledby="catalog-title" className="mt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="catalog-title" className="text-3xl font-semibold text-stone-900">Departures &amp; prices</h1>
          <p className="mt-1 text-sm text-stone-500">Changes go live on the site within about 30 seconds. Every change is logged below.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="h-4 w-4 accent-stone-900" />
            Show closed and past
          </label>
          <button onClick={load} aria-label="Refresh" className="cursor-pointer rounded border border-stone-300 p-1.5 hover:bg-stone-100">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
          </button>
        </div>
      </header>

      {notice && (
        <p role="status" className="mt-4 flex items-start justify-between gap-4 rounded bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
          <button onClick={() => setNotice(null)} className="cursor-pointer text-emerald-700 hover:underline">Dismiss</button>
        </p>
      )}
      {error && <p role="alert" className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {diffs.length > 0 && (
        <div role="note" className="mt-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" aria-hidden /> The site&apos;s fallback copy (content.ts) is out of date
          </p>
          <p className="mt-1">
            The live site uses D1, so bookings are fine. Visitors without JavaScript, and the first moment of each page load,
            still show the old values until content.ts is updated and the site redeployed.
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5">
            {diffs.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {!data && !error && <p className="mt-8 text-sm text-stone-500">Loading…</p>}

      {data && (
        <div className="mt-6 space-y-6">
          {data.tours.map((t) => {
            const deps = data.departures.filter((d) => d.tour === t.slug && (showClosed || (d.status === "open" && d.start_date >= today)));
            const hidden = data.departures.filter((d) => d.tour === t.slug).length - deps.length;
            return (
              <article key={t.slug} className="rounded-lg border border-stone-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 px-5 py-4">
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">{t.name}</h2>
                    <p className="text-sm text-stone-500">{getTour(t.slug)?.days ?? "?"} days{t.active ? "" : " · inactive"}</p>
                  </div>
                  <PriceEditor tour={t} onDone={done} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm max-sm:block sm:min-w-[40rem] [&_tbody]:max-sm:block">
                    <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase max-sm:hidden">
                      <tr>
                        <th className="px-5 py-2.5">Date</th>
                        <th className="px-3 py-2.5 text-right">Booked</th>
                        <th className="px-3 py-2.5 text-right">Held</th>
                        <th className="px-3 py-2.5">Total seats</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deps.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-6 text-center text-stone-500 max-sm:block">
                            No upcoming open departures.{hidden > 0 && !showClosed ? ` ${hidden} closed or past hidden.` : ""}
                          </td>
                        </tr>
                      )}
                      {deps.map((d) => (
                        <DepartureRow key={d.id} d={d} max={data.maxGroupSize} past={d.start_date < today} onDone={done} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {hidden > 0 && !showClosed && deps.length > 0 && (
                  <p className="px-5 pt-2 text-xs text-stone-500">{hidden} closed or past departure{hidden === 1 ? "" : "s"} hidden.</p>
                )}
                {t.active ? <AddDeparture tour={t} max={data.maxGroupSize} onDone={done} /> : null}
              </article>
            );
          })}
          <ChangeLog events={data.events} departures={data.departures} />
        </div>
      )}
    </section>
  );
}

function PriceEditor({ tour, onDone }: { tour: Tour; onDone: (m: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(tour.price_pkr));
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = Number(value);
  const valid = Number.isInteger(price) && price >= 1000 && price <= 1_000_000;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/tours/${tour.slug}/price`, { method: "PATCH", body: JSON.stringify({ price, expected: tour.price_pkr }) });
      setEditing(false);
      setConfirming(false);
      onDone(`${tour.name}: price changed from ${formatPrice(tour.price_pkr, "PKR")} to ${formatPrice(price, "PKR")} for new bookings.`);
    } catch (e) {
      setError((e as Error).message);
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="text-right">
        <p className="text-xs text-stone-500 uppercase">Price per person</p>
        <p className="text-lg font-semibold tabular-nums">{formatPrice(tour.price_pkr, "PKR")}</p>
        <button onClick={() => { setValue(String(tour.price_pkr)); setEditing(true); }} className="mt-1 cursor-pointer text-sm text-stone-600 underline hover:text-stone-900">
          Change price
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded border border-stone-200 bg-stone-50 p-3 text-sm sm:w-auto">
      {!confirming ? (
        <form onSubmit={(e) => { e.preventDefault(); if (valid && price !== tour.price_pkr) setConfirming(true); }} className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1">
            <span className="text-xs text-stone-500">New price (PKR per person)</span>
            <input type="number" inputMode="numeric" min={1000} max={1000000} step={1} value={value} onChange={(e) => setValue(e.target.value)} className={cn(input, "w-36 tabular-nums")} autoFocus />
          </label>
          <button type="submit" disabled={!valid || price === tour.price_pkr} className={btnDark}>Review</button>
          <button type="button" onClick={() => setEditing(false)} className={btn}>Cancel</button>
          {!valid && <p className="w-full text-xs text-red-700">Whole rupees from 1,000 to 1,000,000.</p>}
        </form>
      ) : (
        <div role="alertdialog" aria-labelledby={`price-${tour.slug}`}>
          <p id={`price-${tour.slug}`} className="font-medium">
            Change {tour.name} from {formatPrice(tour.price_pkr, "PKR")} to {formatPrice(price, "PKR")}?
          </p>
          <p className="mt-1 text-stone-600">Applies to new bookings only. Existing bookings keep the price they were booked at.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={busy} className={btnDark}>{busy ? "Saving…" : "Confirm new price"}</button>
            <button onClick={() => setConfirming(false)} disabled={busy} className={btn}>Back</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function DepartureRow({ d, max, past, onDone }: { d: Departure; max: number; past: boolean; onDone: (m: string) => void }) {
  const [editSeats, setEditSeats] = useState(false);
  const [seats, setSeats] = useState(String(d.seats_total));
  const [closing, setClosing] = useState<ActiveBooking[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taken = d.seats_booked + d.seats_held;
  const n = Number(seats);
  const seatsValid = Number.isInteger(n) && n >= Math.max(1, taken) && n <= max;
  const label = `${formatDate(d.start_date)}`;

  async function run(fn: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      const r = (await fn()) as { warning?: string | null } | undefined;
      onDone(r?.warning ? `${message} ${r.warning}` : message);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.code === "active_bookings") setClosing((e.body.bookings as ActiveBooking[]) ?? []);
      else setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const saveSeats = () =>
    run(() => api(`/api/admin/departures/${d.id}/seats`, { method: "PATCH", body: JSON.stringify({ seats: n, expected: d.seats_total }) }), `${label}: seats changed from ${d.seats_total} to ${n}.`).then(
      (ok) => ok && setEditSeats(false),
    );
  const close = (force: boolean) =>
    run(() => api(`/api/admin/departures/${d.id}/close`, { method: "POST", body: JSON.stringify({ force }) }), `${label}: closed to new bookings.`).then(
      (ok) => ok && setClosing(null),
    );
  const reopen = () => run(() => api(`/api/admin/departures/${d.id}/reopen`, { method: "POST", body: "{}" }), `${label}: reopened.`);

  return (
    <>
      <tr className={cn("border-t border-stone-100 align-top max-sm:block max-sm:py-2", d.status !== "open" && "bg-stone-50 text-stone-500")}>
        <td className="px-5 py-3 max-sm:block max-sm:px-4 max-sm:py-1.5">
          <span className="font-medium text-stone-900">{formatDate(d.start_date)}</span>
          <span className="ml-1.5 text-stone-500">{weekday.format(new Date(`${d.start_date}T00:00:00Z`))}</span>
          {past && <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600">Past</span>}
        </td>
        <td data-label="Booked" className="px-3 py-3 text-right tabular-nums max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:px-4 max-sm:py-1.5 max-sm:text-left max-sm:before:text-xs max-sm:before:text-stone-500 max-sm:before:uppercase max-sm:before:content-[attr(data-label)]">{d.seats_booked}</td>
        <td data-label="Held" className="px-3 py-3 text-right tabular-nums max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:px-4 max-sm:py-1.5 max-sm:text-left max-sm:before:text-xs max-sm:before:text-stone-500 max-sm:before:uppercase max-sm:before:content-[attr(data-label)]">{d.seats_held}</td>
        <td data-label="Total seats" className="px-3 py-3 max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:px-4 max-sm:py-1.5 max-sm:text-left max-sm:before:text-xs max-sm:before:text-stone-500 max-sm:before:uppercase max-sm:before:content-[attr(data-label)] max-sm:flex-wrap">
          {editSeats ? (
            <form onSubmit={(e) => { e.preventDefault(); if (seatsValid) saveSeats(); }} className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`seats-${d.id}`}>Total seats</label>
              <input id={`seats-${d.id}`} type="number" min={Math.max(1, taken)} max={max} value={seats} onChange={(e) => setSeats(e.target.value)} className={cn(input, "w-20 tabular-nums")} autoFocus />
              <button type="submit" disabled={!seatsValid || busy || n === d.seats_total} className={btnDark}>Save</button>
              <button type="button" onClick={() => { setEditSeats(false); setSeats(String(d.seats_total)); }} className={btn}>Cancel</button>
              <span className="w-full text-xs text-stone-500">
                {taken > 0 ? `At least ${taken} (booked + held), ` : "From 1 "}up to {max}.
              </span>
            </form>
          ) : (
            <span className="tabular-nums">
              {d.seats_total}
              <span className="text-stone-500"> · {d.seats_total - taken} left</span>
            </span>
          )}
        </td>
        <td data-label="Status" className="px-3 py-3 max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:px-4 max-sm:py-1.5 max-sm:text-left max-sm:before:text-xs max-sm:before:text-stone-500 max-sm:before:uppercase max-sm:before:content-[attr(data-label)]">
          <span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", d.status === "open" ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-700")}>
              {d.status === "open" ? "Open" : d.status === "closed" ? "Closed" : "Cancelled"}
            </span>
            {d.active_bookings > 0 && <span className="ml-2 text-xs text-stone-500">{d.active_bookings} active booking{d.active_bookings === 1 ? "" : "s"}</span>}
          </span>
        </td>
        <td className="px-5 py-3 text-right whitespace-nowrap max-sm:block max-sm:px-4 max-sm:pt-2 max-sm:text-left">
          {d.status === "open" && !editSeats && (
            <>
              <button onClick={() => setEditSeats(true)} disabled={busy} className={btn}>Edit seats</button>{" "}
              <button onClick={() => close(false)} disabled={busy} className={btn}>Close</button>
            </>
          )}
          {d.status === "closed" && (
            <button onClick={reopen} disabled={busy} className={btn}>Reopen</button>
          )}
        </td>
      </tr>
      {(closing || error) && (
        <tr>
          <td colSpan={6} className="px-5 pb-4 max-sm:block max-sm:px-4">
            {error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
            {closing && (
              <div role="alertdialog" aria-labelledby={`close-${d.id}`} className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p id={`close-${d.id}`} className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" aria-hidden /> {label} has {closing.length} active booking{closing.length === 1 ? "" : "s"}
                </p>
                <p className="mt-1">
                  Closing stops new bookings only. These bookings stay as they are; contact the travellers yourself if the trip won&apos;t run.
                </p>
                <ul className="mt-2 space-y-0.5">
                  {closing.map((b) => (
                    <li key={b.ref} className="font-mono text-xs">
                      {b.ref} · {b.status} · {b.travellers} pax · <span className="font-sans">{b.lead_name}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => close(true)} disabled={busy} className={btnDark}>{busy ? "Closing…" : "Close anyway"}</button>
                  <button onClick={() => setClosing(null)} disabled={busy} className={btn}>Keep open</button>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function Warnings({ items }: { items: SeasonWarning[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {items.map((w) => (
        <li key={w.message} className={cn("flex gap-2 rounded px-3 py-2", w.level === "warning" ? "bg-amber-50 text-amber-950" : "bg-sky-50 text-sky-950")}>
          {w.level === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          <span>
            <strong className="font-medium">{w.level === "warning" ? "Season warning: " : "Note: "}</strong>
            {w.message}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AddDeparture({ tour, max, onDone }: { tour: Tour; max: number; onDone: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(String(max));
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const min = firstAllowedDate();
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && isBookableOnline(date);
  const n = Number(seats);
  const seatsValid = Number.isInteger(n) && n >= 1 && n <= max;
  const warnings = validDate ? seasonWarnings(tour.slug, date) : [];
  const needsAck = warnings.some((w) => w.level === "warning");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validDate || !seatsValid || (needsAck && !ack)) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/departures", { method: "POST", body: JSON.stringify({ tour: tour.slug, date, seats: n, acknowledgeSeason: ack }) });
      setOpen(false);
      setDate("");
      setAck(false);
      onDone(`${tour.name}: departure added on ${formatDate(date)} with ${n} seats.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="px-5 py-4">
        <button onClick={() => { setSeats(String(max)); setOpen(true); }} className={cn(btn, "inline-flex items-center gap-1.5")}>
          <Plus className="h-4 w-4" aria-hidden /> Add departure
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="m-5 mt-4 rounded border border-stone-200 bg-stone-50 p-4" aria-label={`Add a ${tour.name} departure`}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-xs text-stone-500">Start date</span>
          <input type="date" required min={min} value={date} onChange={(e) => { setDate(e.target.value); setAck(false); }} className={input} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-xs text-stone-500">Seats (1 to {max})</span>
          <input type="number" required min={1} max={max} value={seats} onChange={(e) => setSeats(e.target.value)} className={cn(input, "w-24 tabular-nums")} />
        </label>
        <button type="submit" disabled={busy || !validDate || !seatsValid || (needsAck && !ack)} className={btnDark}>{busy ? "Adding…" : "Add departure"}</button>
        <button type="button" onClick={() => setOpen(false)} className={btn}>Cancel</button>
      </div>
      {date && !validDate && <p className="mt-2 text-sm text-red-700">Pick a date at least 72 hours away (from {formatDate(min)}).</p>}
      <Warnings items={warnings} />
      {needsAck && (
        <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-stone-800">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-stone-900" />
          I understand this date is outside the usual season and still want to add it. (This is recorded in the change log.)
        </label>
      )}
      {error && <p role="alert" className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    </form>
  );
}

const ACTION: Record<string, string> = {
  departure_added: "Added departure",
  seats_changed: "Changed seats",
  departure_closed: "Closed departure",
  departure_reopened: "Reopened departure",
  price_changed: "Changed price",
};

function describe(e: AdminEvent, departures: Departure[]) {
  const parse = (s: string | null) => (s ? (JSON.parse(s) as Record<string, unknown>) : {});
  const oldV = parse(e.old_value);
  const newV = parse(e.new_value);
  const note = parse(e.note);
  let what: string;
  if (e.entity === "tour") what = getTour(e.entity_id)?.name ?? e.entity_id;
  else {
    const d = departures.find((x) => String(x.id) === e.entity_id);
    const tour = (note.tour ?? newV.tour ?? d?.tour) as string | undefined;
    const date = (note.date ?? newV.date ?? d?.start_date) as string | undefined;
    what = `${getTour(tour ?? "")?.name ?? tour ?? "?"} · ${date ? formatDate(date) : `#${e.entity_id}`}`;
  }
  const fmt = (v: Record<string, unknown>) =>
    v.price !== undefined ? formatPrice(Number(v.price), "PKR") : v.seats !== undefined ? `${v.seats} seats` : v.status !== undefined ? String(v.status) : "";
  const change = e.old_value ? `${fmt(oldV)} → ${fmt(newV)}` : fmt(newV);
  const extra: string[] = [];
  if (Array.isArray(note.activeBookings) && note.activeBookings.length) extra.push(`active bookings: ${note.activeBookings.join(", ")}`);
  if (Array.isArray(note.seasonWarningsAcknowledged) && note.seasonWarningsAcknowledged.length) {
    extra.push(`season warning acknowledged: ${note.seasonWarningsAcknowledged.join(" ")}`);
  }
  if (Array.isArray(note.seasonNotes) && note.seasonNotes.length) extra.push(`note: ${note.seasonNotes.join(" ")}`);
  return { what, change, extra: extra.join("; ") };
}

function ChangeLog({ events, departures }: { events: AdminEvent[]; departures: Departure[] }) {
  return (
    <section aria-labelledby="changelog" className="rounded-lg border border-stone-200 bg-white">
      <h2 id="changelog" className="border-b border-stone-100 px-5 py-4 text-xl font-semibold text-stone-900">Change log</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm max-sm:block sm:min-w-[44rem] [&_tbody]:max-sm:block">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase max-sm:hidden">
            <tr>
              <th className="px-5 py-2.5">When</th>
              <th className="px-3 py-2.5">Who</th>
              <th className="px-3 py-2.5">What</th>
              <th className="px-5 py-2.5">Change</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr className="max-sm:block"><td colSpan={4} className="px-5 py-6 text-center text-stone-500 max-sm:block">No changes yet.</td></tr>
            )}
            {events.map((e) => {
              const d = describe(e, departures);
              return (
                <tr key={e.id} className="border-t border-stone-100 align-top max-sm:block max-sm:px-4 max-sm:py-3">
                  <td className="px-5 py-2.5 whitespace-nowrap text-stone-500 max-sm:inline max-sm:p-0 max-sm:text-xs">{dt.format(new Date(`${e.created_at.replace(" ", "T")}Z`))}</td>
                  <td className="px-3 py-2.5 max-sm:inline max-sm:p-0 max-sm:pl-2 max-sm:text-xs max-sm:text-stone-500">{e.actor}</td>
                  <td className="px-3 py-2.5 max-sm:block max-sm:p-0 max-sm:pt-1">
                    {ACTION[e.action] ?? e.action}
                    <span className="block text-stone-500">{d.what}</span>
                  </td>
                  <td className="px-5 py-2.5 tabular-nums max-sm:block max-sm:p-0 max-sm:pt-1">
                    {d.change}
                    {d.extra && <span className="block text-xs text-stone-500">{d.extra}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-xs text-stone-500">Last 50 changes, Pakistan time.</p>
    </section>
  );
}
