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
