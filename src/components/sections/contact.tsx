"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  User,
} from "lucide-react";
import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import { brand, formatPrice, tours, whatsappLink } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useLiveData } from "@/lib/live-data";
import { cn } from "@/lib/utils";

type Fields = { name: string; phone: string; tour: string; travellers: number; month: string; message: string };
type Errors = Partial<Record<"name" | "phone" | "month", string>>;

const CUSTOM = "Custom trip";
const MAX_TRAVELLERS = 12;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const empty: Fields = { name: "", phone: "", tour: tours[1].name, travellers: 2, month: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[+\d][\d\s-]{7,}$/.test(f.phone.trim())) e.phone = "Enter a phone number with at least 8 digits.";
  if (!f.month) e.month = "Choose when you'd like to travel.";
  return e;
}

const fieldClass = (invalid: boolean) =>
  cn(
    "mt-2 h-12 rounded-lg border bg-white pl-11 text-base text-ink shadow-none placeholder:text-mist/60 focus-visible:border-pine focus-visible:ring-pine/15",
    invalid ? "border-red-600" : "border-line",
  );

function FieldIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return <Icon aria-hidden className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-mist" />;
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-700">
      {children}
    </p>
  );
}

/**
 * Static-host friendly enquiry form: there is no server, so a valid submission opens WhatsApp with the
 * enquiry pre-filled for the traveller to send, and the card switches to a confirmation state.
 */
export function Contact() {
  const { currency } = useCurrency();
  const { prices } = useLiveData();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);

  const update = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const text = [
      `Assalam o Alaikum ${brand.name}, I'd like to plan a trip.`,
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Tour: ${fields.tour}`,
      `Travellers: ${fields.travellers === MAX_TRAVELLERS ? `${MAX_TRAVELLERS}+` : fields.travellers}`,
      `Month: ${fields.month}`,
      fields.message && `Notes: ${fields.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    const link = whatsappLink(text);
    window.open(link, "_blank", "noopener");
    setSentLink(link);
  };

  const tourOptions = [
    ...tours.map((t) => ({ value: t.name, meta: `${t.days} days · from ${formatPrice(prices[t.slug], currency)}` })),
    { value: CUSTOM, meta: "Your dates, your route" },
  ];

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-night py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_28rem_at_0%_0%,rgba(30,77,74,0.45),transparent_70%)]" />

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Contact"
            title={
              <>
                Let&apos;s plan your <em className="text-apricot">northern journey</em>
              </>
            }
            intro="Tell us when and how many. We'll reply on WhatsApp with a day-by-day plan and a final price."
          />
          <Reveal delay={0.15}>
            <ul className="mt-10 divide-y divide-cream/10 border-y border-cream/10 text-cream/90">
              <li>
                <a href={`tel:+${brand.whatsapp}`} className="flex items-center gap-4 py-4 transition-colors hover:text-apricot">
                  <Phone className="h-5 w-5 text-apricot" aria-hidden />
                  {brand.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-4 py-4 break-all transition-colors hover:text-apricot">
                  <Mail className="h-5 w-5 shrink-0 text-apricot" aria-hidden />
                  {brand.email}
                </a>
              </li>
              <li className="flex items-center gap-4 py-4">
                <MapPin className="h-5 w-5 text-apricot" aria-hidden />
                {brand.office}
              </li>
              <li className="flex items-center gap-4 py-4">
                <Clock className="h-5 w-5 text-apricot" aria-hidden />
                {brand.hours}
              </li>
            </ul>
            <CtaButton
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon={<MessageCircle className="h-4 w-4" aria-hidden />}
              className="mt-10"
            >
              Chat on WhatsApp
            </CtaButton>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl bg-cream shadow-2xl shadow-night/40">
            <div className="border-b border-line bg-sand px-6 py-5 sm:px-9">
              <p className="font-serif text-2xl font-medium text-ink">Trip enquiry</p>
              <p className="mt-1 text-sm text-mist">Takes about a minute. No payment, no obligation.</p>
            </div>

            {sentLink ? (
              <div className="px-6 py-14 text-center sm:px-9" role="status">
                <CheckCircle2 className="mx-auto h-14 w-14 text-pine" aria-hidden />
                <p className="mt-5 font-serif text-3xl text-ink">WhatsApp is ready</p>
                <p className="mx-auto mt-3 max-w-sm text-mist">
                  Your enquiry is filled in. Press send in WhatsApp and we&apos;ll reply with a day-by-day plan.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <CtaButton href={sentLink} target="_blank" rel="noopener noreferrer" tone="light" icon={<MessageCircle className="h-4 w-4" aria-hidden />}>
                    Open WhatsApp again
                  </CtaButton>
                  <CtaButton
                    variant="outline"
                    tone="light"
                    onClick={() => {
                      setSentLink(null);
                      setFields(empty);
                    }}
                  >
                    New enquiry
                  </CtaButton>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="space-y-6 px-6 py-7 sm:px-9 sm:py-8">
                {/* Tour: radio cards */}
                <fieldset>
                  <legend className="text-sm font-medium text-ink">Which trip?</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {tourOptions.map((o) => {
                      const checked = fields.tour === o.value;
                      return (
                        <label
                          key={o.value}
                          className={cn(
                            "relative flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-apricot",
                            checked ? "border-pine ring-1 ring-pine" : "border-line hover:border-pine/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="tour"
                            value={o.value}
                            checked={checked}
                            onChange={() => update("tour", o.value)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              checked ? "border-pine bg-pine text-cream" : "border-mist/40",
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          <span>
                            <span className="block font-medium text-ink">{o.value}</span>
                            <span className="mt-0.5 block text-xs text-mist">{o.meta}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="f-name" className="text-ink">
                      Full name
                    </Label>
                    <div className="relative">
                      <Input
                        id="f-name"
                        autoComplete="name"
                        value={fields.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Ayesha Khan"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "e-name" : undefined}
                        className={fieldClass(!!errors.name)}
                      />
                      <FieldIcon icon={User} />
                    </div>
                    <ErrorText id="e-name">{errors.name}</ErrorText>
                  </div>

                  <div>
                    <Label htmlFor="f-phone" className="text-ink">
                      Phone or WhatsApp
                    </Label>
                    <div className="relative">
                      <Input
                        id="f-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={fields.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+92 312 3456789"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "e-phone" : undefined}
                        className={fieldClass(!!errors.phone)}
                      />
                      <FieldIcon icon={Phone} />
                    </div>
                    <ErrorText id="e-phone">{errors.phone}</ErrorText>
                  </div>

                  <div>
                    <Label htmlFor="f-month" className="text-ink">
                      Travel month
                    </Label>
                    <div className="relative">
                      <select
                        id="f-month"
                        value={fields.month}
                        onChange={(e) => update("month", e.target.value)}
                        aria-invalid={!!errors.month}
                        aria-describedby={errors.month ? "e-month" : undefined}
                        className={cn(
                          "mt-2 h-12 w-full cursor-pointer rounded-lg border bg-white pr-4 pl-11 text-base transition-colors focus:border-pine focus:outline-none",
                          errors.month ? "border-red-600" : "border-line",
                          fields.month ? "text-ink" : "text-mist",
                        )}
                      >
                        <option value="" disabled>
                          Choose a month
                        </option>
                        {months.map((m) => (
                          <option key={m} className="text-ink">
                            {m}
                          </option>
                        ))}
                        <option className="text-ink">Flexible</option>
                      </select>
                      <FieldIcon icon={CalendarDays} />
                    </div>
                    <ErrorText id="e-month">{errors.month}</ErrorText>
                  </div>

                  <div>
                    <p id="l-travellers" className="text-sm font-medium text-ink">
                      Travellers
                    </p>
                    <div className="mt-2 flex h-12 items-center justify-between rounded-lg border border-line bg-white px-1.5" role="group" aria-labelledby="l-travellers">
                      <button
                        type="button"
                        onClick={() => update("travellers", Math.max(1, fields.travellers - 1))}
                        disabled={fields.travellers <= 1}
                        aria-label="Fewer travellers"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-pine transition-colors hover:bg-pine/10 disabled:cursor-not-allowed disabled:text-mist/40 disabled:hover:bg-transparent"
                      >
                        <Minus className="h-4 w-4" aria-hidden />
                      </button>
                      <output aria-live="polite" className="font-medium text-ink tabular-nums">
                        {fields.travellers === MAX_TRAVELLERS ? `${MAX_TRAVELLERS}+` : fields.travellers}{" "}
                        {fields.travellers === 1 ? "person" : "people"}
                      </output>
                      <button
                        type="button"
                        onClick={() => update("travellers", Math.min(MAX_TRAVELLERS, fields.travellers + 1))}
                        disabled={fields.travellers >= MAX_TRAVELLERS}
                        aria-label="More travellers"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-pine transition-colors hover:bg-pine/10 disabled:cursor-not-allowed disabled:text-mist/40 disabled:hover:bg-transparent"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="f-message" className="text-ink">
                      Anything we should know? <span className="font-normal text-mist">(optional)</span>
                    </Label>
                    <Textarea
                      id="f-message"
                      rows={3}
                      value={fields.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Travelling with elderly parents, prefer a slower pace."
                      className="mt-2 min-h-24 resize-none rounded-lg border-line bg-white px-4 py-3 text-base text-ink shadow-none placeholder:text-mist/60 focus-visible:border-pine focus-visible:ring-pine/15"
                    />
                  </div>
                </div>

                <div>
                  <CtaButton type="submit" size="lg" tone="light" icon={<Send className="h-4 w-4" aria-hidden />} className="w-full">
                    Send enquiry on WhatsApp
                  </CtaButton>
                  <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-mist">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    We only use your details to reply to this enquiry.
                  </p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
