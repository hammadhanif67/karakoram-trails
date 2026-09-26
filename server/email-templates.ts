// Customer emails (stage 4). Plain, readable HTML plus a text version; every value is escaped.
// Admin alerts go to Telegram instead (server/telegram.ts).
import type { EmailMessage } from "./email/provider";
import type { Env } from "./env";

export type EmailBooking = {
  ref: string;
  access_token: string;
  status: string;
  travellers: number;
  lead_name: string;
  email: string;
  phone: string;
  notes: string | null;
  total_pkr: number;
  deposit_pkr: number;
  deposit_percent: number;
  payment_method: string;
  hold_expires_at: string | null;
  start_date: string;
  tour_name: string;
  type: string;
  data: string | null;
};

type Message = EmailMessage;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export const formatPkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" }).format(new Date(iso)) + " PKT";

function layout(title: string, paragraphs: string[], cta?: { label: string; href: string }) {
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#d08a3c;margin:0 0 8px">Karakoram Trails</p>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 20px">${esc(title)}</h1>
${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${p}</p>`).join("\n")}
${cta ? `<p style="margin:24px 0"><a href="${esc(cta.href)}" style="background:#d08a3c;color:#1a1206;text-decoration:none;padding:12px 20px;border-radius:4px;font-size:14px;letter-spacing:1px;text-transform:uppercase">${esc(cta.label)}</a></p>` : ""}
<p style="font-size:12px;color:#5f5e57;margin-top:32px">This link gives access to your booking. Please don't forward this email.</p>
</div></body></html>`;
  const text = [title, "", ...paragraphs.map((p) => p.replace(/<[^>]+>/g, "")), ...(cta ? ["", `${cta.label}: ${cta.href}`] : [])].join("\n");
  return { html, text };
}

/** Customer emails for one event. Empty when this event sends none. */
export function emailFor(b: EmailBooking, env: Env): Message[] {
  const site = (env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const statusUrl = `${site}/booking/?ref=${encodeURIComponent(b.ref)}&t=${encodeURIComponent(b.access_token)}`;
  const trip = `<strong>${esc(b.tour_name)}</strong>, ${esc(day(b.start_date))}, ${b.travellers} traveller${b.travellers === 1 ? "" : "s"}`;
  const out: Message[] = [];
  switch (b.type) {
    case "created": {
      if (site) {
        const m = layout(
          `Seats reserved: ${b.ref}`,
          [
            `Assalam o Alaikum ${esc(b.lead_name)}, thank you for booking ${trip}.`,
            `To confirm, transfer the ${b.deposit_percent}% deposit of <strong>${formatPkr(b.deposit_pkr)}</strong> and upload the receipt${
              b.hold_expires_at ? ` before <strong>${esc(when(b.hold_expires_at))}</strong>` : ""
            }. After that, unpaid seats are released.`,
            `Our bank details and the upload form are on your booking page. Write <strong>${esc(b.ref)}</strong> in the transfer description.`,
          ],
          { label: "Pay and upload receipt", href: statusUrl },
        );
        out.push({ to: b.email, subject: `Your seats are reserved (${b.ref})`, ...m });
      }
      break;
    }
    case "confirmed": {
      if (site) {
        const m = layout(
          `You're booked: ${b.ref}`,
          [
            `Assalam o Alaikum ${esc(b.lead_name)}, we've received your deposit. ${trip} is confirmed.`,
            `The balance of <strong>${formatPkr(b.total_pkr - b.deposit_pkr)}</strong> is due 7 days before departure. We'll be in touch on WhatsApp with pickup details.`,
          ],
          { label: "View booking", href: statusUrl },
        );
        out.push({ to: b.email, subject: `Booking confirmed (${b.ref})`, ...m });
      }
      break;
    }
    case "cancelled":
    case "hold_expired": {
      if (site) {
        const expired = b.type === "hold_expired";
        const m = layout(
          `Booking cancelled: ${b.ref}`,
          [
            `Assalam o Alaikum ${esc(b.lead_name)}, your booking for ${trip} has been cancelled${expired ? " because we didn't receive a payment receipt in time" : ""}.`,
            `If this is a mistake or you'd like new dates, just reply on WhatsApp and we'll help.`,
          ],
          { label: "View booking", href: statusUrl },
        );
        out.push({ to: b.email, subject: `Booking cancelled (${b.ref})`, ...m });
      }
      break;
    }
  }
  return out;
}
