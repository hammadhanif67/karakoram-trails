"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Banknote, Check, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { depositFor, holdExpiresAt, ONLINE_CUTOFF_HOURS } from "@/lib/booking-rules";
import { cancellationPolicy, formatDate, formatPrice, getTour, whatsappLink } from "@/lib/content";
import { useLiveData } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { Turnstile, type TurnstileHandle } from "./turnstile";

const HOLD_HOURS = 48; // mirrors wrangler.toml HOLD_HOURS; the server's value is authoritative

type Fields = { name: string; email: string; phone: string; notes: string; acceptTerms: boolean };
type FieldErrors = Partial<Record<keyof Fields | "form", string>>;

const errorField: Record<string, keyof Fields> = {
  invalid_name: "name",
  invalid_email: "email",
  invalid_phone: "phone",
  invalid_notes: "notes",
  invalid_terms: "acceptTerms",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </main>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white/70 p-8 text-center">
        <h1 className="font-serif text-4xl text-ink">{title}</h1>
        <div className="mt-4 text-mist">{children}</div>
      </div>
    </Shell>
  );
}

export function CheckoutClient() {
  const params = useSearchParams();
  const departureId = Number(params.get("departure"));
  const live = useLiveData();
  const departure = live.departures.find((d) => d.id === departureId);
  const tour = departure ? getTour(departure.tour) : undefined;

  const [travellers, setTravellers] = useState(1);
  const [fields, setFields] = useState<Fields>({ name: "", email: "", phone: "", notes: "", acceptTerms: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);

  if (live.status === "loading") {
    return (
      <Notice title="Checking availability">
        <p>One moment…</p>
      </Notice>
    );
  }
  if (live.status === "unavailable") {
    return (
      <Notice title="Online booking is unavailable">
        <p>
          Please{" "}
          <a className="text-pine underline" href={whatsappLink("Assalam o Alaikum, I'd like to book a tour.")} target="_blank" rel="noopener noreferrer">
            contact us on WhatsApp
          </a>{" "}
          and we&apos;ll reserve your seats.
        </p>
      </Notice>
    );
  }
  if (!departure || !tour) {
    return (
      <Notice title="Departure not found">
        <p>
          This departure is no longer listed. <Link className="text-pine underline" href="/#departures">See upcoming departures</Link>.
        </p>
      </Notice>
    );
  }

  const dateLabel = formatDate(departure.date);
  if (!departure.bookable || departure.seatsLeft <= 0) {
    const full = departure.seatsLeft <= 0;
    return (
      <Notice title={full ? "This departure is full" : "Booking online has closed"}>
        <p>
          {full
            ? `${tour.name} on ${dateLabel} is fully booked.`
            : `${tour.name} on ${dateLabel} starts within ${ONLINE_CUTOFF_HOURS} hours, so it can't be booked online.`}{" "}
          <a
            className="text-pine underline"
            href={whatsappLink(`Assalam o Alaikum, I'm asking about ${tour.name} on ${dateLabel}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us on WhatsApp
          </a>
          .
        </p>
      </Notice>
    );
  }

  const maxTravellers = Math.min(12, departure.seatsLeft);
  const count = Math.min(travellers, maxTravellers);
  const price = live.prices[tour.slug];
  const total = price * count;
  const deposit = depositFor(total, live.depositPercent);
  const holdUntil = holdExpiresAt(departure.date, HOLD_HOURS);
  const holdLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(holdUntil);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: FieldErrors = {};
    if (fields.name.trim().length < 2) local.name = "Enter the lead traveller's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) local.email = "Enter a valid email address.";
    if (fields.phone.replace(/\D/g, "").length < 8) local.phone = "Enter a phone number with at least 8 digits.";
    if (!fields.acceptTerms) local.acceptTerms = "Please accept the booking conditions.";
    if (!token) local.form = "Please complete the security check.";
    setErrors(local);
    const first = (Object.keys(local) as (keyof FieldErrors)[]).find((k) => k !== "form");
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    if (local.form) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          departureId,
          travellers: count,
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          notes: fields.notes,
          paymentMethod: "bank_transfer",
          acceptTerms: fields.acceptTerms,
          turnstileToken: token,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const field = errorField[data.error as string];
        setErrors(field ? { [field]: data.message } : { form: data.message ?? "Something went wrong. Please try again." });
        return;
      }
      window.location.assign(data.statusUrl);
    } catch {
      setErrors({ form: "Network error. Check your connection and try again." });
    } finally {
      setSubmitting(false);
      turnstile.current?.reset(); // tokens are single-use
    }
  }

  const field = (invalid: boolean) =>
    cn(
      "mt-2 h-12 rounded-lg border bg-white px-4 text-base text-ink shadow-none placeholder:text-mist/60 focus-visible:border-pine focus-visible:ring-pine/15",
      invalid ? "border-red-600" : "border-line",
    );
  const err = (k: keyof FieldErrors) =>
    errors[k] ? (
      <p id={`e-${k}`} className="mt-1.5 text-sm text-red-700">
        {errors[k]}
      </p>
    ) : null;

  return (
    <Shell>
      <Link href={`/tours/${tour.slug}/`} className="inline-flex items-center gap-2 text-sm text-mist hover:text-pine">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {tour.name}
      </Link>
      <h1 className="mt-4 font-serif text-5xl leading-tight text-ink sm:text-6xl">Reserve your seats</h1>
      <p className="mt-3 text-mist">
        {tour.name} · {dateLabel} · {departure.seatsLeft} seat{departure.seatsLeft === 1 ? "" : "s"} left
      </p>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form noValidate onSubmit={submit} className="space-y-8 rounded-2xl border border-line bg-white/70 p-6 sm:p-8">
          <fieldset className="space-y-5">
            <legend className="font-serif text-2xl text-ink">Travellers</legend>
            <div className="flex h-12 max-w-xs items-center justify-between rounded-lg border border-line bg-white px-1.5" role="group" aria-label="Number of travellers">
              <button type="button" onClick={() => setTravellers(Math.max(1, count - 1))} disabled={count <= 1} aria-label="Fewer travellers" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-pine hover:bg-pine/10 disabled:cursor-not-allowed disabled:text-mist/40">
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <output aria-live="polite" className="font-medium text-ink tabular-nums">
                {count} {count === 1 ? "traveller" : "travellers"}
              </output>
              <button type="button" onClick={() => setTravellers(Math.min(maxTravellers, count + 1))} disabled={count >= maxTravellers} aria-label="More travellers" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-pine hover:bg-pine/10 disabled:cursor-not-allowed disabled:text-mist/40">
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </fieldset>

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-1 font-serif text-2xl text-ink sm:col-span-2">Lead traveller</legend>
            <div className="sm:col-span-2">
              <Label htmlFor="c-name" className="text-ink">Full name</Label>
              <Input id="c-name" autoComplete="name" value={fields.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} className={field(!!errors.name)} />
              {err("name")}
            </div>
            <div>
              <Label htmlFor="c-email" className="text-ink">Email</Label>
              <Input id="c-email" type="email" autoComplete="email" value={fields.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} className={field(!!errors.email)} />
              {err("email")}
            </div>
            <div>
              <Label htmlFor="c-phone" className="text-ink">Phone or WhatsApp</Label>
              <Input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 312 3456789" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "e-phone" : undefined} className={field(!!errors.phone)} />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-notes" className="text-ink">
                Notes <span className="font-normal text-mist">(optional)</span>
              </Label>
              <Textarea id="c-notes" rows={3} maxLength={500} value={fields.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Dietary needs, pickup point, travelling with children…" className="mt-2 min-h-24 resize-none rounded-lg border-line bg-white px-4 py-3 text-base text-ink shadow-none focus-visible:border-pine focus-visible:ring-pine/15" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-serif text-2xl text-ink">Payment</legend>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-pine bg-white p-4 ring-1 ring-pine">
              <input type="radio" name="payment" value="bank_transfer" checked readOnly className="sr-only" />
              <span aria-hidden className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pine text-cream">
                <Check className="h-3 w-3" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-medium text-ink">
                  <Banknote className="h-4 w-4 text-pine" aria-hidden /> Bank transfer or Raast
                </span>
                <span className="mt-1 block text-sm text-mist">
                  After you reserve, we show our account details. Transfer the deposit and upload the receipt.
                </span>
              </span>
            </label>
            <p className="mt-2 text-xs text-mist">JazzCash, Easypaisa and cards are coming soon.</p>
          </fieldset>

          <div className="space-y-4">
            <label htmlFor="c-acceptTerms" className="flex cursor-pointer items-start gap-3 text-sm text-ink">
              <input
                id="c-acceptTerms"
                type="checkbox"
                checked={fields.acceptTerms}
                onChange={(e) => set("acceptTerms", e.target.checked)}
                aria-invalid={!!errors.acceptTerms}
                aria-describedby={errors.acceptTerms ? "e-acceptTerms" : undefined}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--pine)]"
              />
              <span>
                I accept the booking conditions: a {live.depositPercent}% deposit confirms the seats, the balance is due 7 days before
                departure, and the{" "}
                <Link href="/terms/" target="_blank" className="text-pine underline underline-offset-2">
                  terms and booking conditions
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy/" target="_blank" className="text-pine underline underline-offset-2">
                  refund policy
                </Link>{" "}
                apply. In short:
              </span>
            </label>
            <ul aria-label="Cancellation policy" className="-mt-2 list-disc space-y-1 pl-12 text-sm text-mist">
              {cancellationPolicy.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {err("acceptTerms")}

            <Turnstile ref={turnstile} action="booking_create" onToken={setToken} />
            {errors.form && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                {errors.form}
              </p>
            )}
            <CtaButton type="submit" size="lg" tone="light" arrow className="w-full" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Reserving…" : `Reserve and pay ${formatPrice(deposit, "PKR")} deposit`}
            </CtaButton>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-mist">
              <Lock className="h-3.5 w-3.5" aria-hidden /> No payment is taken on this page.
            </p>
          </div>
        </form>

        <aside aria-label="Booking summary" className="h-fit rounded-2xl bg-night p-6 text-cream lg:sticky lg:top-28">
          <p className="text-xs tracking-[0.2em] text-cream/60 uppercase">Summary</p>
          <p className="mt-3 font-serif text-3xl">{tour.name}</p>
          <p className="text-sm text-cream/70">
            {dateLabel} · {tour.days} days
          </p>
          <dl className="mt-6 space-y-3 border-t border-cream/10 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cream/70">
                {formatPrice(price, "PKR")} × {count}
              </dt>
              <dd className="tabular-nums">{formatPrice(total, "PKR")}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-cream/10 pt-3 font-medium">
              <dt>Deposit due now ({live.depositPercent}%)</dt>
              <dd className="text-apricot tabular-nums">{formatPrice(deposit, "PKR")}</dd>
            </div>
            <div className="flex justify-between gap-4 text-cream/70">
              <dt>Balance, 7 days before departure</dt>
              <dd className="tabular-nums">{formatPrice(total - deposit, "PKR")}</dd>
            </div>
          </dl>
          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-cream/70">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden />
            Your seats are held until about {holdLabel}. Upload the transfer receipt before then; after that, unpaid seats are released.
          </p>
        </aside>
      </div>
    </Shell>
  );
}
