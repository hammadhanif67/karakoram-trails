"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, FileText, RefreshCw, Search, XCircle } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/content";
import { cn } from "@/lib/utils";

type Status = "pending_payment" | "verifying" | "confirmed" | "cancelled";
type Row = {
  ref: string;
  status: Status;
  travellers: number;
  lead_name: string;
  email: string;
  phone: string;
  notes: string | null;
  total_pkr: number;
  deposit_pkr: number;
  hold_expires_at: string | null;
  created_at: string;
  start_date: string;
  tour_name: string;
  seats_total: number;
  seats_booked: number;
  seats_held: number;
  receipt_payment_id: number | null;
};
type Event = { type: string; actor: string; data: string | null; created_at: string; webhook_sent: number; email_sent: number; attempts: number; last_error: string | null };

const LABEL: Record<Status, string> = { pending_payment: "Awaiting payment", verifying: "Check receipt", confirmed: "Confirmed", cancelled: "Cancelled" };
const TONE: Record<Status, string> = {
  pending_payment: "bg-amber-100 text-amber-900",
  verifying: "bg-sky-100 text-sky-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-stone-200 text-stone-700",
};
const dt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });
const utc = (s: string) => new Date(s.includes("T") ? s : `${s.replace(" ", "T")}Z`);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `Request failed (${res.status})`);
  return data as T;
}

const sent = (v: number) => (v === 1 ? "sent" : v === 2 ? "n/a" : "pending");

function Detail({ row, onDone }: { row: Row; onDone: () => void }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ events: Event[] }>(`/api/admin/bookings/${row.ref}/events`).then((d) => setEvents(d.events), (e) => setError(e.message));
  }, [row.ref]);

  async function act(kind: "confirm" | "cancel") {
    const question =
      kind === "confirm"
        ? `Confirm ${row.ref}? Only do this after the deposit of ${formatPrice(row.deposit_pkr, "PKR")} is in the bank account.`
        : `Cancel ${row.ref}? Its ${row.travellers} seat(s) will be released.`;
    const text = window.prompt(`${question}\n\nOptional ${kind === "confirm" ? "note" : "reason"}:`, "");
    if (text === null) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/bookings/${row.ref}/${kind}`, { method: "POST", body: JSON.stringify(kind === "confirm" ? { note: text } : { reason: text }) });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 bg-stone-50 p-5 lg:grid-cols-2">
      <div className="space-y-2 text-sm">
        <p><span className="text-stone-500">Lead:</span> {row.lead_name}</p>
        <p>
          <span className="text-stone-500">Contact:</span>{" "}
          <a className="underline" href={`mailto:${row.email}`}>{row.email}</a> ·{" "}
          <a className="underline" href={`https://wa.me/${row.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{row.phone}</a>
        </p>
        {row.notes && <p><span className="text-stone-500">Notes:</span> {row.notes}</p>}
        <p><span className="text-stone-500">Total:</span> {formatPrice(row.total_pkr, "PKR")} · <span className="text-stone-500">deposit</span> {formatPrice(row.deposit_pkr, "PKR")}</p>
        <p>
          <span className="text-stone-500">Departure seats:</span> {row.seats_booked} booked, {row.seats_held} held, {row.seats_total - row.seats_booked - row.seats_held} free of {row.seats_total}
        </p>
        {row.hold_expires_at && <p><span className="text-stone-500">Hold ends:</span> {dt.format(utc(row.hold_expires_at))} PKT</p>}
        {row.receipt_payment_id && (
          <a className="inline-flex items-center gap-1.5 font-medium text-sky-800 underline" href={`/api/admin/payments/${row.receipt_payment_id}/receipt`} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4" aria-hidden /> View receipt <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        <div className="flex flex-wrap gap-3 pt-3">
          {(row.status === "verifying" || row.status === "pending_payment") && (
            <button disabled={busy} onClick={() => act("confirm")} className="inline-flex cursor-pointer items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Confirm payment
            </button>
          )}
          {row.status !== "cancelled" && (
            <button disabled={busy} onClick={() => act("cancel")} className="inline-flex cursor-pointer items-center gap-2 rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50">
              <XCircle className="h-4 w-4" aria-hidden /> Cancel booking
            </button>
          )}
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
      <div>
        <p className="text-xs font-medium tracking-widest text-stone-500 uppercase">History</p>
        {!events ? (
          <p className="mt-2 text-sm text-stone-500">Loading…</p>
        ) : (
          <ol className="mt-2 space-y-2 text-sm">
            {events.map((e, i) => {
              const data = e.data ? (JSON.parse(e.data) as Record<string, unknown>) : null;
              return (
                <li key={i} className="rounded border border-stone-200 bg-white p-2">
                  <p className="font-medium">{e.type.replace(/_/g, " ")} <span className="font-normal text-stone-500">· {e.actor}{data?.by ? ` (${String(data.by)})` : ""} · {dt.format(utc(e.created_at))}</span></p>
                  {(data?.note || data?.reason) ? <p className="text-stone-600">“{String(data.note ?? data.reason)}”</p> : null}
                  <p className="text-xs text-stone-500">
                    n8n: {sent(e.webhook_sent)} · email: {sent(e.email_sent)}
                    {e.last_error ? <span className="text-red-700"> · {e.last_error}</span> : null}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

export function AdminClient() {
  const [me, setMe] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Partial<Record<Status, number>>>({});
  const [status, setStatus] = useState<Status | "">("verifying");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const d = await api<{ bookings: Row[]; counts: Partial<Record<Status, number>> }>(`/api/admin/bookings?${params}`);
      setRows(d.bookings);
      setCounts(d.counts);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    api<{ email: string }>("/api/admin/me").then((d) => setMe(d.email), (e) => setError(e.message));
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on filter change
    load();
  }, [load]);

  async function retry() {
    try {
      const r = await api<{ processed: number; sent: number; failed: number }>("/api/admin/notifications/retry", { method: "POST", body: "{}" });
      setNotice(`Notifications: ${r.sent} sent, ${r.failed} failed, ${r.processed} processed.`);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }

  const tabs: { key: Status | ""; label: string }[] = [
    { key: "verifying", label: "Check receipt" },
    { key: "pending_payment", label: "Awaiting payment" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "", label: "All" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-stone-500 uppercase">Karakoram Trails</p>
          <h1 className="text-3xl font-semibold text-stone-900">Bookings</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          {me && <span>Signed in as {me}</span>}
          <button onClick={retry} className="cursor-pointer rounded border border-stone-300 px-3 py-1.5 hover:bg-stone-100">Retry notifications</button>
          <button onClick={load} aria-label="Refresh" className="cursor-pointer rounded border border-stone-300 p-1.5 hover:bg-stone-100">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
          </button>
        </div>
      </header>
      {notice && <p className="mt-3 rounded bg-stone-100 px-3 py-2 text-sm">{notice}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setStatus(t.key)}
            className={cn("cursor-pointer rounded-full px-4 py-1.5 text-sm", status === t.key ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-100")}
          >
            {t.label}
            {t.key && counts[t.key] ? <span className="ml-1.5 opacity-70">{counts[t.key]}</span> : null}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="ml-auto flex items-center gap-2">
          <label htmlFor="q" className="sr-only">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ref, name, email, phone" className="h-9 w-64 rounded border border-stone-300 bg-white pr-3 pl-8 text-sm" />
          </div>
        </form>
      </div>

      {error && <p role="alert" className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3 text-right">Pax</th>
              <th className="px-4 py-3 text-right">Deposit</th>
              <th className="px-4 py-3">Booked</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-500">{loading ? "Loading…" : "No bookings here."}</td></tr>
            )}
            {rows.map((r) => (
              <FragmentRow key={r.ref} row={r} open={open === r.ref} onToggle={() => setOpen(open === r.ref ? null : r.ref)} onDone={() => { setOpen(null); load(); }} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone-500">Times are Pakistan time. Showing up to 200 bookings.</p>
    </div>
  );
}

function FragmentRow({ row, open, onToggle, onDone }: { row: Row; open: boolean; onToggle: () => void; onDone: () => void }) {
  return (
    <>
      <tr onClick={onToggle} className={cn("cursor-pointer border-t border-stone-100 hover:bg-stone-50", open && "bg-stone-50")} aria-expanded={open}>
        <td className="px-4 py-3 font-mono font-medium">{row.ref}</td>
        <td className="px-4 py-3"><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[row.status])}>{LABEL[row.status]}</span></td>
        <td className="px-4 py-3">{row.tour_name}<span className="text-stone-500"> · {formatDate(row.start_date)}</span></td>
        <td className="px-4 py-3">{row.lead_name}</td>
        <td className="px-4 py-3 text-right tabular-nums">{row.travellers}</td>
        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(row.deposit_pkr, "PKR")}</td>
        <td className="px-4 py-3 text-stone-500">{dt.format(utc(row.created_at))}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="p-0"><Detail row={row} onDone={onDone} /></td>
        </tr>
      )}
    </>
  );
}
