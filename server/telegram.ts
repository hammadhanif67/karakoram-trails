// Admin alerts to a Telegram chat through a bot (https://core.telegram.org/bots/api#sendmessage).
// The bot token is part of the API URL, so it is never logged; errors report only the HTTP status.
import type { EmailBooking } from "./email-templates";
import type { Env } from "./env";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
const pkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export const telegramConfigured = (env: Env) => !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

/** Message text for the admin chat, or null when this event type doesn't alert the admin. */
export function telegramText(b: EmailBooking, env: Env): string | null {
  const title = b.type === "created" ? "🆕 New booking" : b.type === "receipt_uploaded" ? "🧾 Receipt uploaded, please verify" : null;
  if (!title) return null;
  const site = (env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return [
    `<b>${title}: ${esc(b.ref)}</b>`,
    `${esc(b.tour_name)} · ${esc(day(b.start_date))} · ${b.travellers} pax`,
    `${esc(b.lead_name)} · ${esc(b.phone)} · ${esc(b.email)}`,
    `Deposit ${pkr(b.deposit_pkr)} of ${pkr(b.total_pkr)}`,
    ...(b.notes ? [`Notes: ${esc(b.notes)}`] : []),
    ...(site ? [`${site}/admin/`] : []),
  ].join("\n");
}

export async function sendTelegram(env: Env, text: string) {
  const base = (env.TELEGRAM_API_BASE || "https://api.telegram.org").replace(/\/$/, "");
  const r = await fetch(`${base}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`telegram HTTP ${r.status}`);
}
