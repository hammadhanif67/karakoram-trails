/**
 * Everything that makes this site "Karakoram Trails": name, logo, colours, contact details, booking rules,
 * feature flags and default SEO text. To rebrand, edit this file (see "How to rebrand" in README.md).
 *
 * Not in here: tours, destinations, FAQ and legal texts (content, in src/lib/content.ts); deployment
 * settings (wrangler.toml, .env.production); secrets such as bank details (Cloudflare, .dev.vars).
 *
 * Plain data only: the Pages Functions (server/) import it too, so no browser or Node APIs here.
 */

const name = "Karakoram Trails";

export type SiteConfig = {
  name: string;
  /** Default public address. NEXT_PUBLIC_SITE_URL (build) and PUBLIC_SITE_URL (wrangler.toml) override it per deployment. */
  url: string;
  logo: {
    /** "mountain" for the built-in mountain mark, or the path of your own SVG in /public, e.g. "/logo.svg". */
    mark: "mountain" | `/${string}`;
  };
  /**
   * Brand colours as #rrggbb. They become CSS variables (--night, --pine-deep, ...) on every page and Tailwind
   * colours (bg-night, text-apricot-deep, ...), and the customer emails use them too. Ratios are WCAG
   * contrast with today's values; check them again if you change a colour.
   */
  colors: {
    /** Dark sections, the navbar, hero scrims and the browser theme colour. Cream text on it: 15.18:1. */
    night: string;
    pine: string;
    pineDeep: string;
    /** Accent for buttons, icons and fills. Not for small text on light backgrounds (2.53:1 on cream). */
    apricot: string;
    /** Text on apricot buttons: 6.52:1. */
    apricotInk: string;
    /** Apricot text on light backgrounds: 5.37:1 on cream, 4.96:1 on sand, 6.04:1 on white. */
    apricotDeep: string;
    /** Apricot text on dark backgrounds: 5.43:1 on pine-deep, 7.60:1 on night (also over the hero scrims). */
    apricotBright: string;
    cream: string;
    /** Body text: 15.54:1 on cream. */
    ink: string;
    /** Secondary text: 5.78:1 on cream, 5.34:1 on sand, 6.51:1 on white. */
    mist: string;
    /** Borders and dividers. */
    line: string;
    /** Alternate light section background. */
    sand: string;
    /** Season strips: "best" months on light and on dark backgrounds, and closed months on light. */
    seasonBest: string;
    seasonBestOnDark: string;
    seasonClosed: string;
    /** WhatsApp buttons (white text: 5.04:1, hover 6.67:1). */
    whatsapp: string;
    whatsappHover: string;
    danger: string;
    /** Highlight in the primary button's moving border. */
    shine: string;
  };
  contact: {
    phoneDisplay: string;
    /** Digits only, with the country code: used for wa.me links and tel: links. */
    whatsapp: string;
    email: string;
    office: string;
    hours: string;
  };
  /** Profile URLs. Empty ones are not shown anywhere. */
  social: { instagram: string; facebook: string; youtube: string; tiktok: string };
  payments: {
    /** How the deposit is paid (checkout). */
    methods: string;
    /** Labels on the booking page. The values are secrets: BANK_NAME, BANK_ACCOUNT_TITLE, BANK_IBAN, RAAST_ID. */
    labels: { bankName: string; accountTitle: string; iban: string; raastId: string };
  };
  booking: {
    /**
     * Largest group on a departure and in one booking (admin, checkout, every "max 12" text). The database
     * also caps one booking at 12 travellers (migrations/0001_init.sql), so going above 12 needs a migration.
     */
    maxGroupSize: number;
    /** Share of the price paid to reserve seats. */
    depositPercent: number;
    /** Unpaid seats are held this long, or until the online cutoff if that comes first. */
    holdHours: number;
    /** The balance is due this many days before departure. */
    balanceDueDays: number;
    /** Online booking closes this many hours before departure; after that, WhatsApp only. */
    onlineCutoffHours: number;
  };
  features: {
    /** Off until there are real reviews from real travellers; the "Our promises" block shows instead. */
    showTestimonials: boolean;
  };
  seo: {
    /** Home page title (other pages use "Page | name"). */
    title: string;
    /** Home page description. */
    description: string;
    /** Social-preview photo for pages without their own (a key of src/lib/images.generated.json). */
    defaultImage: string;
    locale: string;
  };
};

export const site: SiteConfig = {
  name,
  url: "https://karakoram-trails.pages.dev",
  logo: { mark: "mountain" },
  colors: {
    night: "#0f1e22",
    pine: "#1e4d4a",
    pineDeep: "#173b39",
    apricot: "#d08a3c",
    apricotInk: "#1a1206",
    apricotDeep: "#92531a",
    apricotBright: "#e0a059",
    cream: "#f6f1e7",
    ink: "#1c1917",
    mist: "#5f5e57",
    line: "#e2d9c8",
    sand: "#efe8da",
    seasonBest: "#4f8a63",
    seasonBestOnDark: "#6fae84",
    seasonClosed: "#d6ccb9",
    whatsapp: "#1b7f45",
    whatsappHover: "#146a38",
    danger: "#b91c1c",
    shine: "#fff6e6",
  },
  contact: {
    phoneDisplay: "+92 328 1933287",
    whatsapp: "923281933287",
    email: "adalhammad556@gmail.com",
    office: "Aliabad, Hunza, Gilgit-Baltistan",
    hours: "Replies within a few hours, 9 am to 10 pm PKT", // PLACEHOLDER: your real reply hours
  },
  social: { instagram: "", facebook: "", youtube: "", tiktok: "" },
  payments: {
    methods: "Bank transfer or Raast",
    labels: { bankName: "Bank", accountTitle: "Account title", iban: "IBAN", raastId: "Raast ID" },
  },
  booking: {
    maxGroupSize: 12,
    depositPercent: 30,
    holdHours: 48,
    balanceDueDays: 7,
    onlineCutoffHours: 72,
  },
  features: {
    showTestimonials: false,
  },
  seo: {
    title: `${name} | Tours to Hunza, Skardu and Fairy Meadows`,
    description:
      "Small-group road journeys through Gilgit-Baltistan, planned day by day, with honest drive times and a local team on the ground.",
    defaultImage: "hero-passu-cones",
    locale: "en_GB",
  },
};
