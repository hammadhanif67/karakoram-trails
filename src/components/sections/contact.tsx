"use client";

import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brand, tours, whatsappLink } from "@/lib/content";
import { cn } from "@/lib/utils";

type Fields = { name: string; phone: string; tour: string; travellers: string; month: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const empty: Fields = { name: "", phone: "", tour: tours[1].name, travellers: "2", month: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[+\d][\d\s-]{7,}$/.test(f.phone.trim())) e.phone = "Enter a phone number with at least 8 digits.";
  if (!f.month) e.month = "Choose when you'd like to travel.";
  return e;
}

/**
 * Static-host friendly enquiry form: there is no server, so a valid submission opens WhatsApp
 * with the enquiry pre-filled for the traveller to send.
 */
export function Contact() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const text = [
      `Assalam o Alaikum ${brand.name}, I'd like to plan a trip.`,
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Tour: ${fields.tour}`,
      `Travellers: ${fields.travellers}`,
      `Month: ${fields.month}`,
      fields.message && `Notes: ${fields.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(text), "_blank", "noopener");
    setSent(true);
  };

  // shadcn Input/Textarea sized up for touch; native <select> keeps the phone's own picker.
  const input = "mt-2 h-12 rounded-xl bg-white px-4 text-base text-ink shadow-none placeholder:text-mist/70 focus-visible:border-pine focus-visible:ring-pine/20";
  const select =
    "mt-2 h-12 w-full rounded-xl border bg-white px-4 text-base text-ink transition-colors focus:border-pine focus:outline-none";
  const label = "text-sm font-medium text-ink";

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-night py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_28rem_at_0%_0%,rgba(30,77,74,0.45),transparent_70%)]" />

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Contact"
            title={
              <>
                Let&apos;s plan your <em className="text-apricot">northern journey</em>
              </>
            }
            intro="Tell us when and how many. We'll reply on WhatsApp within a few hours with a day-by-day plan and final price."
          />
          <Reveal delay={0.15}>
            <ul className="mt-10 space-y-5 text-cream/90">
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pine">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <a href={`tel:+${brand.whatsapp}`} className="hover:text-apricot">
                  {brand.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pine">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <a href={`mailto:${brand.email}`} className="hover:text-apricot">
                  {brand.email}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pine">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                {brand.office}
              </li>
            </ul>
            <CtaButton
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              shine
              icon={<MessageCircle className="h-4 w-4" aria-hidden />}
              className="mt-10"
            >
              Chat on WhatsApp
            </CtaButton>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <form noValidate onSubmit={onSubmit} className="rounded-3xl bg-cream p-6 shadow-2xl sm:p-9" aria-describedby="form-note">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="" className={label}>
                  Full name
                </Label>
                <Input
                  id="f-name"
                  autoComplete="name"
                  value={fields.name}
                  onChange={set("name")}
                  placeholder="Ayesha Khan"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "e-name" : undefined}
                  className={cn(input, errors.name ? "border-red-600" : "border-line")}
                />
                {errors.name && <p id="e-name" className="mt-1.5 text-sm text-red-700">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="" className={label}>
                  Phone or WhatsApp
                </Label>
                <Input
                  id="f-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.phone}
                  onChange={set("phone")}
                  placeholder="+92 312 3456789"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "e-phone" : undefined}
                  className={cn(input, errors.phone ? "border-red-600" : "border-line")}
                />
                {errors.phone && <p id="e-phone" className="mt-1.5 text-sm text-red-700">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="" className={label}>
                  Tour
                </Label>
                <select id="f-tour" value={fields.tour} onChange={set("tour")} className={cn(select, "border-line")}>
                  {tours.map((t) => (
                    <option key={t.slug}>{t.name}</option>
                  ))}
                  <option>Custom trip</option>
                </select>
              </div>

              <div>
                <Label htmlFor="" className={label}>
                  Travellers
                </Label>
                <select id="f-travellers" value={fields.travellers} onChange={set("travellers")} className={cn(select, "border-line")}>
                  {["1", "2", "3", "4", "5", "6", "7-12"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="" className={label}>
                  Travel month
                </Label>
                <select
                  id="f-month"
                  value={fields.month}
                  onChange={set("month")}
                  aria-invalid={!!errors.month}
                  aria-describedby={errors.month ? "e-month" : undefined}
                  className={cn(select, errors.month ? "border-red-600" : "border-line", !fields.month && "text-mist")}
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
                {errors.month && <p id="e-month" className="mt-1.5 text-sm text-red-700">{errors.month}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="" className={label}>
                  Anything else? <span className="font-normal text-mist">(optional)</span>
                </Label>
                <Textarea
                  id="f-message"
                  rows={3}
                  value={fields.message}
                  onChange={set("message")}
                  placeholder="Travelling with elderly parents, prefer a slower pace."
                  className={cn(input, "h-auto min-h-24 resize-none border-line py-3")}
                />
              </div>
            </div>

            <CtaButton
              type="submit"
              size="lg"
              tone="light"
              icon={<Send className="h-4 w-4" aria-hidden />}
              className="mt-7 w-full"
            >
              Send on WhatsApp
            </CtaButton>
            <p id="form-note" className="mt-3 text-center text-xs text-mist" role="status">
              {sent ? "WhatsApp opened with your enquiry. Press send there and we'll reply soon." : "Opens WhatsApp with your details filled in."}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
