"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Clock, Copy, FileUp, Hourglass, MessageCircle, XCircle } from "lucide-react";
import { CtaButton } from "@/components/ui/cta-button";
import { formatDate, formatPrice, whatsappLink } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Turnstile, type TurnstileHandle } from "./turnstile";

type Status = "pending_payment" | "verifying" | "confirmed" | "cancelled";
type Booking = {
  ref: string;
  status: Status;
  tour: string;
  tourSlug: string;
  date: string;
  travellers: number;
  leadName: string;
  totalPkr: number;
  depositPercent: number;
  depositPkr: number;
  holdExpiresAt: string | null;
};
type Payment = { amountPkr: number; reference: string; bankName: string; accountTitle: string; iban: string; raastId: string | null };

const MAX_BYTES = 5 * 1024 * 1024;

/** Pre-filled WhatsApp message with the booking details (never the private link or token). */
function bookingMessage(b: Booking) {
  const next =
    b.status === "pending_payment"
      ? "I'll transfer the deposit and upload the receipt."
      : b.status === "verifying"
        ? "I've transferred the deposit and uploaded the receipt."
        : b.status === "confirmed"
          ? "My booking is confirmed; sharing the details for the trip."
          : "My booking shows as cancelled. Can you help?";
  return [
    `Assalam o Alaikum Karakoram Trails, here is my booking.`,
    `Booking: ${b.ref}`,
    `Tour: ${b.tour}, ${formatDate(b.date)}`,
    `Travellers: ${b.travellers}`,
    `Lead traveller: ${b.leadName}`,
    `Deposit: ${formatPrice(b.depositPkr, "PKR")} of ${formatPrice(b.totalPkr, "PKR")}`,
    next,
  ].join("\n");
}
const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <div className="min-w-0">
        <dt className="text-xs tracking-[0.15em] text-mist uppercase">{label}</dt>
        <dd className="mt-0.5 font-medium break-all text-ink">{value}</dd>
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 text-xs text-pine hover:bg-pine/5"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const steps: { key: Status | "reserved"; label: string }[] = [
  { key: "reserved", label: "Reserved" },
  { key: "verifying", label: "Receipt uploaded" },
  { key: "confirmed", label: "Confirmed" },
];

function Timeline({ status }: { status: Status }) {
  const reached = status === "confirmed" ? 3 : status === "verifying" ? 2 : 1;
  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm">
      {steps.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border", i < reached ? "border-pine bg-pine text-cream" : "border-line text-mist")}>
            {i < reached ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
          </span>
          <span className={i < reached ? "text-ink" : "text-mist"}>{s.label}</span>
          {i < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-line sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

export function BookingStatusClient() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const token = params.get("t") ?? "";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);

  const q = `?t=${encodeURIComponent(token)}`;
  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(ref)}${q}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Booking not found.");
      setBooking(data);
      if (data.status === "pending_payment" || data.status === "verifying") {
        const p = await fetch(`/api/bookings/${encodeURIComponent(ref)}/payment${q}`, { cache: "no-store" });
        const pd = await p.json();
        setPayment(p.ok ? pd : null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking not found.");
    }
  }, [ref, q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the booking once the query string is known
    if (ref && token) load();
    else setError("This link is incomplete. Use the link from your booking confirmation.");
  }, [ref, token, load]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError(null);
    if (!file) return setUploadError("Choose your receipt (JPG, PNG or PDF).");
    if (file.size > MAX_BYTES) return setUploadError("Receipt must be 5 MB or smaller.");
    if (!captcha) return setUploadError("Please complete the security check.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("receipt", file);
      fd.set("turnstileToken", captcha);
      const res = await fetch(`/api/bookings/${encodeURIComponent(ref)}/receipt${q}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Upload failed. Please try again.");
      setBooking(data);
      setFile(null);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      turnstile.current?.reset();
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white/70 p-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-mist" aria-hidden />
        <h1 className="mt-4 font-serif text-3xl text-ink">We couldn&apos;t open this booking</h1>
        <p className="mt-3 text-mist">{error}</p>
        <CtaButton href={whatsappLink(`Assalam o Alaikum, I need help with booking ${ref}.`)} target="_blank" rel="noopener noreferrer" variant="outline" tone="light" className="mt-6">
          Contact us on WhatsApp
        </CtaButton>
      </div>
    );
  }
  if (!booking) return <p className="text-center text-mist" role="status">Loading your booking…</p>;

  const b = booking;
  const balance = b.totalPkr - b.depositPkr;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <div>
          <p className="text-xs tracking-[0.2em] text-apricot uppercase">Booking {b.ref}</p>
          <h1 className="mt-2 font-serif text-5xl leading-tight text-ink">
            {b.status === "pending_payment" && "Seats reserved"}
            {b.status === "verifying" && "Receipt received"}
            {b.status === "confirmed" && "You're booked"}
            {b.status === "cancelled" && "Booking cancelled"}
          </h1>
          {b.status !== "cancelled" && <div className="mt-5"><Timeline status={b.status} /></div>}
          {b.status !== "cancelled" && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CtaButton
                href={whatsappLink(bookingMessage(b))}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                tone="light"
                icon={<MessageCircle className="h-4 w-4" aria-hidden />}
              >
                Send booking to us
              </CtaButton>
              <span className="text-xs text-mist">Opens WhatsApp with your booking details (not your private link).</span>
            </div>
          )}
        </div>

        {b.status === "pending_payment" && (
          <>
            <p className="flex items-start gap-3 rounded-xl bg-apricot/15 p-4 text-sm text-ink">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-apricot" aria-hidden />
              <span>
                Transfer the deposit of <strong>{formatPrice(b.depositPkr, "PKR")}</strong> and upload the receipt before{" "}
                <strong>{b.holdExpiresAt ? dateTime.format(new Date(b.holdExpiresAt)) : "the hold ends"}</strong>. After that, unpaid seats
                are released. Save this page: its link is your access to the booking.
              </span>
            </p>

            <section aria-labelledby="pay" className="rounded-2xl border border-line bg-white/70 p-6">
              <h2 id="pay" className="font-serif text-2xl text-ink">1. Transfer the deposit</h2>
              {payment ? (
                <dl className="mt-4">
                  <CopyRow label="Amount (PKR)" value={String(payment.amountPkr)} />
                  <CopyRow label="Reference / description" value={payment.reference} />
                  <CopyRow label="Bank" value={payment.bankName} />
                  <CopyRow label="Account title" value={payment.accountTitle} />
                  <CopyRow label="IBAN" value={payment.iban} />
                  {payment.raastId && <CopyRow label="Raast ID" value={payment.raastId} />}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-mist">
                  Payment details aren&apos;t available right now.{" "}
                  <a className="text-pine underline" href={whatsappLink(`Assalam o Alaikum, please send payment details for ${b.ref}.`)} target="_blank" rel="noopener noreferrer">
                    Ask us on WhatsApp
                  </a>
                  .
                </p>
              )}
            </section>

            <section aria-labelledby="receipt" className="rounded-2xl border border-line bg-white/70 p-6">
              <h2 id="receipt" className="font-serif text-2xl text-ink">2. Upload the receipt</h2>
              <form onSubmit={upload} noValidate className="mt-4 space-y-4">
                <label htmlFor="r-file" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-pine/40 bg-white px-4 py-8 text-center hover:border-pine">
                  <FileUp className="h-7 w-7 text-pine" aria-hidden />
                  <span className="font-medium text-ink">{file ? file.name : "Choose a screenshot or PDF"}</span>
                  <span className="text-xs text-mist">JPG, PNG or PDF, up to 5 MB</span>
                  <input id="r-file" type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <Turnstile ref={turnstile} action="receipt_upload" onToken={setCaptcha} />
                {uploadError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{uploadError}</p>}
                <CtaButton type="submit" tone="light" icon={<FileUp className="h-4 w-4" aria-hidden />} className="w-full" disabled={uploading} aria-busy={uploading}>
                  {uploading ? "Uploading…" : "Upload receipt"}
                </CtaButton>
              </form>
            </section>
          </>
        )}

        {b.status === "verifying" && (
          <p className="flex items-start gap-3 rounded-xl bg-pine/10 p-4 text-ink">
            <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-pine" aria-hidden />
            We&apos;re checking your transfer, usually within a few hours. Your seats stay held while we check. We&apos;ll email you once it&apos;s confirmed.
          </p>
        )}
        {b.status === "confirmed" && (
          <p className="flex items-start gap-3 rounded-xl bg-pine/10 p-4 text-ink">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-pine" aria-hidden />
            Your deposit is confirmed. The balance of {formatPrice(balance, "PKR")} is due 7 days before departure.
          </p>
        )}
        {b.status === "cancelled" && (
          <div className="rounded-xl border border-line bg-white/70 p-5 text-ink">
            <p>This booking was cancelled, usually because the seat hold ended before a receipt was uploaded.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CtaButton href={`/tours/${b.tourSlug}/`} tone="light" arrow>Book again</CtaButton>
              <CtaButton href={whatsappLink(`Assalam o Alaikum, my booking ${b.ref} was cancelled. Can you help?`)} target="_blank" rel="noopener noreferrer" variant="outline" tone="light" icon={<MessageCircle className="h-4 w-4" aria-hidden />}>
                WhatsApp us
              </CtaButton>
            </div>
          </div>
        )}
      </div>

      <aside aria-label="Booking summary" className="h-fit rounded-2xl bg-night p-6 text-cream lg:sticky lg:top-28">
        <p className="text-xs tracking-[0.2em] text-cream/60 uppercase">Summary</p>
        <p className="mt-3 font-serif text-3xl">{b.tour}</p>
        <p className="text-sm text-cream/70">
          {formatDate(b.date)} · {b.travellers} {b.travellers === 1 ? "traveller" : "travellers"}
        </p>
        <p className="mt-1 text-sm text-cream/70">Lead: {b.leadName}</p>
        <dl className="mt-6 space-y-3 border-t border-cream/10 pt-5 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-cream/70">Total</dt><dd className="tabular-nums">{formatPrice(b.totalPkr, "PKR")}</dd></div>
          <div className="flex justify-between gap-4 font-medium"><dt>Deposit ({b.depositPercent}%)</dt><dd className="text-apricot tabular-nums">{formatPrice(b.depositPkr, "PKR")}</dd></div>
          <div className="flex justify-between gap-4 text-cream/70"><dt>Balance</dt><dd className="tabular-nums">{formatPrice(balance, "PKR")}</dd></div>
        </dl>
        <Link href={`/tours/${b.tourSlug}/`} className="mt-6 inline-block text-sm text-apricot underline underline-offset-4">Tour details</Link>
      </aside>
    </div>
  );
}
