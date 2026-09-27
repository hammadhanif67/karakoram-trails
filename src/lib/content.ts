// Site copy and data. Facts follow CONTENT_BRIEF.md: no invented reviews, counts or ratings, and every
// drive/hike time is approximate. Prices and departures also live in D1 (the source of truth);
// change both together and run `npm run db:check:local` / `db:check:remote`.
// PLACEHOLDERS still to confirm before launch are marked "PLACEHOLDER".
import type { ImageName } from "./images";

export const brand = {
  name: "Karakoram Trails",
  phoneDisplay: "+92 328 1933287",
  whatsapp: "923281933287", // digits only with country code; used for wa.me links and tel:
  email: "adalhammad556@gmail.com",
  office: "Aliabad, Hunza, Gilgit-Baltistan",
  hours: "Replies within a few hours, 9 am to 10 pm PKT", // PLACEHOLDER: your real reply hours
};

/**
 * Largest group on any departure: used by the admin (seats per departure), the checkout (travellers per
 * booking) and every "max 12 travellers" text. The database also caps one booking at 12 travellers
 * (bookings.travellers CHECK), so raising this above 12 needs a migration as well.
 */
export const maxGroupSize = 12;

// Feature flags (move to site.config.ts in the config phase).
export const features = {
  // Off until there are real reviews from real travellers; the "Our promises" block shows instead.
  showTestimonials: false,
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${brand.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/* ------------------------------------------------------------------ images */

// Photos, their sizes and placeholders live in src/lib/images.ts (generated manifest).
export type { ImageName };

/* ---------------------------------------------------------------- currency */

export type Currency = "PKR" | "USD";
export const USD_RATE = 280; // PLACEHOLDER: PKR per 1 USD, update before launch

export function formatPrice(pkr: number, currency: Currency) {
  if (currency === "USD") return `US$${Math.round(pkr / USD_RATE).toLocaleString("en-US")}`;
  return `PKR ${pkr.toLocaleString("en-US")}`;
}

/* ----------------------------------------------------------------- seasons */

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** g = best, a = possible, x = closed or not advised. One letter per month, Jan to Dec. */
export type SeasonCode = "g" | "a" | "x";
export const seasonLabel: Record<SeasonCode, string> = { g: "Best", a: "Possible", x: "Closed or not advised" };
const season = (codes: string) => {
  if (!/^[gax]{12}$/.test(codes)) throw new Error(`Season needs 12 months of g/a/x: ${codes}`);
  return codes.split("") as SeasonCode[];
};

export const seasonNotes = [
  { name: "Spring", when: "Late Mar to Apr", text: "Apricot and cherry blossom in Hunza; high passes still closed." },
  { name: "Summer", when: "May to Sep", text: "Everything open; Deosai flowers in July and August; busiest season." },
  { name: "Autumn", when: "Oct to early Nov", text: "Golden poplars in Hunza; cold nights; Babusar closing." },
  { name: "Winter", when: "Dec to Feb", text: "Snow and short days; most tours paused; Hunza still reachable via the KKH." },
];

/* ---------------------------------------------------- season rules (admin) */

// Approximate opening windows ("MM-DD", inclusive). Edit here; the admin's "Season warning" when adding
// a departure and the server's check both read these.
export const seasonWindows = {
  babusar: { name: "Babusar Pass", from: "06-20", to: "10-31" },
  deosai: { name: "Deosai Plains", from: "06-15", to: "09-30" },
  khunjerab: { name: "Khunjerab Pass", from: "04-01", to: "11-30" },
} as const;
type WindowName = keyof typeof seasonWindows;

type SeasonRule =
  /** The pass/plain visited on `day` (1-based) must be inside its window. */
  | { kind: "window"; day: number; window: WindowName; level: "warning" | "info"; note?: string }
  /** No listed day may fall in a month the destination's season strip marks closed or not advised. */
  | { kind: "strip"; days: number[]; destination: "hunza" | "skardu" | "fairy-meadows" };

export const tourSeasonRules: Record<string, SeasonRule[]> = {
  "hunza-escape": [
    { kind: "window", day: 3, window: "khunjerab", level: "info", note: "Day 3 ends at Passu and Sost." },
    { kind: "strip", days: [2, 3, 4], destination: "hunza" },
  ],
  "skardu-lakes": [
    { kind: "window", day: 4, window: "deosai", level: "info", note: "This departure runs the Shigar and Khaplu version of Day 4." },
    { kind: "strip", days: [2, 3, 4, 5], destination: "skardu" },
  ],
  "grand-karakoram": [
    { kind: "window", day: 2, window: "babusar", level: "warning" },
    { kind: "strip", days: [2, 3, 4], destination: "fairy-meadows" },
    { kind: "window", day: 5, window: "khunjerab", level: "warning" },
    { kind: "window", day: 7, window: "deosai", level: "warning" },
  ],
};

export type SeasonWarning = { level: "warning" | "info"; message: string };

const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const md = (mmdd: string) => {
  const [m, d] = mmdd.split("-").map(Number);
  return `${d} ${months[m - 1]}`;
};

/** Season warnings for a departure of `tourSlug` starting on `date` (YYYY-MM-DD). */
export function seasonWarnings(tourSlug: string, date: string): SeasonWarning[] {
  const out: SeasonWarning[] = [];
  for (const rule of tourSeasonRules[tourSlug] ?? []) {
    if (rule.kind === "window") {
      const w = seasonWindows[rule.window];
      const day = addDays(date, rule.day - 1);
      const mmdd = day.slice(5);
      if (mmdd >= w.from && mmdd <= w.to) continue;
      out.push({
        level: rule.level,
        message: `${w.name} is usually closed on Day ${rule.day} (${formatDate(day)}); open roughly ${md(w.from)} to ${md(w.to)}.${rule.note ? ` ${rule.note}` : ""}`,
      });
    } else {
      const dest = destinations.find((d) => d.slug === rule.destination);
      if (!dest) continue;
      const closed = rule.days.map((n) => addDays(date, n - 1)).filter((day) => dest.season[Number(day.slice(5, 7)) - 1] === "x");
      if (closed.length) {
        out.push({
          level: "warning",
          message: `${dest.title} is marked closed or not advised in ${[...new Set(closed.map((d) => months[Number(d.slice(5, 7)) - 1]))].join(" and ")} (Day ${rule.days
            .filter((n) => closed.includes(addDays(date, n - 1)))
            .join(", ")}).`,
        });
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------ destinations */

export const destinations = [
  {
    slug: "hunza",
    title: "Hunza Valley",
    region: "Gilgit-Baltistan",
    altitude: "2,438 m",
    altitudeNote: "Karimabad",
    image: "dest-hunza",
    alt: "A rider on a golden poplar-lined road in Hunza in autumn",
    blurb: "Old forts above Karimabad, a turquoise lake and the Passu Cones, all along the Karakoram Highway.",
    best: "Apr to early Nov",
    bestDetail: "April (blossom), May to September (summer), late October to early November (autumn colours)",
    season: season("xxagggggggax"),
    gettingThere: "Approx. 18–20 h by road from Islamabad, over 2 days",
    gettingThereDetail: "Islamabad to Karimabad by road, approx. 18–20 h over 2 days, with a night in Chilas or Naran.",
    highlights: [
      "Baltit and Altit forts above Karimabad",
      "Attabad Lake, formed by a 2010 landslide",
      "Passu Cones and the Hussaini suspension bridge",
      "Sunrise over Rakaposhi and Ultar from Eagle's Nest (Duikar)",
    ],
  },
  {
    slug: "skardu",
    title: "Skardu",
    region: "Baltistan",
    altitude: "approx. 2,230 m",
    altitudeNote: "Skardu town",
    image: "dest-skardu",
    alt: "Sand dunes of the Katpana cold desert beneath snowy peaks in Skardu",
    blurb: "Mirror-still lakes, a cold desert and Deosai, one of the highest plateaus in the world.",
    best: "May to Oct",
    bestDetail: "May to October; Deosai only mid-June to September",
    season: season("xxxaggggggax"),
    gettingThere: "Approx. 20–22 h by road over 2 days, or approx. 1 h by air",
    gettingThereDetail:
      "By road approx. 20–22 h over 2 days via the KKH and the Jaglot–Skardu road. Flights from Islamabad take approx. 1 h but depend on the weather and are often cancelled.",
    highlights: [
      "Lower Kachura (Shangrila) and Upper Kachura lakes",
      "The cold desert at Sarfaranga and Katpana",
      "Shigar Fort",
      "Deosai Plains, approx. 4,100 m on average",
    ],
  },
  {
    slug: "fairy-meadows",
    title: "Fairy Meadows",
    region: "Diamer",
    altitude: "approx. 3,300 m",
    altitudeNote: "The meadows",
    image: "dest-fairy-meadows",
    alt: "Sunrise lighting the snowy face of Nanga Parbat, the peak above Fairy Meadows",
    blurb: "Alpine meadows facing Nanga Parbat, reached by a mountain jeep track and a hike.",
    best: "Mid-Jun to Sep",
    bestDetail: "Mid-June to September",
    season: season("xxxxaggggaxx"),
    gettingThere: "Road to Raikot Bridge, approx. 1.5–2 h by jeep, then a 2.5–4 h hike",
    gettingThereDetail:
      "Road to Raikot Bridge on the KKH, then a local jeep for approx. 1.5–2 h to Tatto or Jhel, then a hike of approx. 2.5–4 h (ponies available).",
    highlights: [
      "Face-on views of Nanga Parbat (8,126 m)",
      "The hike to Beyal Camp and the Nanga Parbat viewpoint (approx. 3–4 h each way)",
      "Night skies with almost no light pollution",
    ],
  },
] satisfies { image: ImageName; season: SeasonCode[]; [k: string]: unknown }[];

/* --------------------------------------------------------------- route map */

// The Grand Karakoram loop in travel order. Coordinates are approximate (lat, lon) and only used to lay
// out the map; `label` says where the name sits relative to the pin so neighbouring names never overlap.
export const routeStops: { name: string; note: string; lat: number; lon: number; label: "right" | "left" | "above" | "above-left" | "below" }[] = [
  { name: "Islamabad", note: "Capital", lat: 33.68, lon: 73.05, label: "right" },
  { name: "Naran", note: "Kaghan Valley", lat: 34.91, lon: 73.65, label: "left" },
  { name: "Fairy Meadows", note: "Nanga Parbat", lat: 35.39, lon: 74.58, label: "above-left" },
  { name: "Hunza", note: "Karimabad", lat: 36.32, lon: 74.67, label: "above" },
  { name: "Skardu", note: "Baltistan", lat: 35.3, lon: 75.63, label: "below" },
];

/* ------------------------------------------------------------------- tours */

type ItineraryDay = {
  title: string;
  text: string;
  /** Approximate drive/hike time, shown with "approx." */
  time: string;
  /** Overnight place; omitted on the last day (home). */
  stay?: string;
  /** Approximate altitude of the overnight place. */
  altitude?: string;
};

export type Tour = {
  slug: string;
  name: string;
  days: number;
  nights: number;
  pricePKR: number; // also in D1 (tours.price_pkr)
  route: string;
  tagline: string;
  overview: string;
  image: ImageName;
  alt: string;
  featured?: boolean;
  difficulty: "Easy" | "Moderate" | "Active";
  difficultyNote?: string;
  maxAltitude: string;
  groupSize: string;
  season: string;
  startEnd: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  /** Tour-specific route and season notes, shown above the shared "Good to know" list. */
  notes: string[];
};

// Budget group tours: the same inclusions and exclusions for every route.
const included = [
  "Shared coaster or van with driver",
  "Fuel and tolls",
  "Standard hotels on 3–4 person sharing",
  "Breakfast and dinner",
  "Tour leader",
  "Jeep transfers where listed in the itinerary",
];

const excluded = [
  "Lunch",
  "Fort, park and museum tickets",
  "Ponies and porters",
  "Personal expenses",
  "Travel insurance",
  "Anything not listed as included",
];

export const goodToKnow = [
  "Long drive days are normal in the north. Times shown are approximate and depend on weather, roadworks and landslides.",
  "Mobile coverage is patchy; SCOM and Zong work best in Gilgit-Baltistan.",
  "Carry cash; ATMs exist in Gilgit, Karimabad and Skardu but can run empty.",
];

const khunjerabNote =
  "Khunjerab Pass is open roughly April to November (border season 1 April to 30 November). From December to March, Day 3 ends at Passu and Sost.";

export const tours: Tour[] = [
  {
    slug: "hunza-escape",
    name: "Hunza Escape",
    days: 5,
    nights: 4,
    pricePKR: 18000,
    route: "Islamabad · Chilas · Hunza · Khunjerab",
    tagline: "Two forts, a turquoise lake and the China border in five days.",
    overview:
      "Five days on the Karakoram Highway into the heart of Hunza: two forts, a turquoise lake, the Passu Cones and the China border at Khunjerab.",
    image: "tour-hunza-escape",
    alt: "Boats on the turquoise water of Attabad Lake between steep mountains",
    difficulty: "Easy",
    maxAltitude: "4,693 m (Khunjerab)",
    groupSize: `Max ${maxGroupSize} travellers`,
    season: "Apr to early Nov",
    startEnd: "Islamabad → Islamabad",
    highlights: [
      "Baltit and Altit forts",
      "Attabad Lake and the Hussaini bridge",
      "Khunjerab Pass at 4,693 m",
      "The Passu Cones",
      "Sunrise at Eagle's Nest",
    ],
    itinerary: [
      { title: "Islamabad to Chilas", text: "North on the Karakoram Highway via Besham, following the Indus to Chilas.", time: "11–13 h drive", stay: "Chilas", altitude: "~1,250 m" },
      { title: "Chilas to Karimabad", text: "Stops at the Nanga Parbat viewpoint at Raikot and the Rakaposhi viewpoint on the way into Hunza.", time: "5–6 h drive", stay: "Karimabad", altitude: "~2,438 m" },
      { title: "Attabad, Passu and Khunjerab", text: "Attabad Lake, the Hussaini suspension bridge and the Passu Cones, then up to the Khunjerab Pass (4,693 m) on the China border and back.", time: "7–8 h with stops", stay: "Karimabad", altitude: "~2,438 m" },
      { title: "Eagle's Nest and the forts", text: "Sunrise at Eagle's Nest, Baltit and Altit forts, then the drive down to Chilas.", time: "5–6 h drive", stay: "Chilas", altitude: "~1,250 m" },
      { title: "Chilas to Islamabad", text: "Back down the Karakoram Highway to Islamabad.", time: "11–13 h drive" },
    ],
    included,
    excluded,
    notes: [
      "Route: the Karakoram Highway both ways runs in every season. From roughly late June to October the outbound leg can go via Naran and Babusar Pass (4,173 m) instead; Babusar's season varies with snowfall.",
      khunjerabNote,
    ],
  },
  {
    slug: "grand-karakoram",
    name: "Grand Karakoram",
    days: 9,
    nights: 8,
    pricePKR: 30000,
    route: "Naran · Fairy Meadows · Hunza · Skardu",
    tagline: "Fairy Meadows, Hunza and Skardu in one summer loop.",
    overview: "Fairy Meadows, Hunza and Skardu in one journey: the classic summer circuit of the north.",
    image: "tour-grand-karakoram",
    alt: "The jagged Passu Cones against a clear blue sky in upper Hunza",
    featured: true,
    difficulty: "Moderate",
    difficultyNote: "includes a 2.5–4 h hike",
    maxAltitude: "4,693 m (Khunjerab)",
    groupSize: `Max ${maxGroupSize} travellers`,
    season: "Mid-Jun to Sep only",
    startEnd: "Islamabad → Islamabad",
    highlights: [
      "Fairy Meadows under Nanga Parbat",
      "Babusar and Khunjerab passes",
      "Deosai Plains and Sheosar Lake",
      "Hike to Beyal Camp",
      "Hunza and Skardu in one trip",
    ],
    itinerary: [
      { title: "Islamabad to Naran", text: "Up the Kaghan Valley to Naran.", time: "6–7 h drive", stay: "Naran", altitude: "~2,400 m" },
      { title: "Babusar Pass to Fairy Meadows", text: "Over Babusar Pass (4,173 m) to Raikot Bridge on the KKH, a local jeep up the mountain track, then the hike to Fairy Meadows.", time: "5 h drive + 1.5–2 h jeep + 2.5–4 h hike", stay: "Fairy Meadows", altitude: "~3,300 m" },
      { title: "Beyal Camp and the Nanga Parbat viewpoint", text: "A day hike to Beyal Camp and the Nanga Parbat viewpoint, and back to the meadows.", time: "6–8 h round trip", stay: "Fairy Meadows", altitude: "~3,300 m" },
      { title: "Fairy Meadows to Karimabad", text: "Hike down, jeep back to Raikot Bridge, then drive up the Karakoram Highway to Karimabad.", time: "3 h hike and jeep + 3–4 h drive", stay: "Karimabad", altitude: "~2,438 m" },
      { title: "Attabad, Passu and Khunjerab", text: "Attabad Lake, the Passu Cones and the Khunjerab Pass (4,693 m) on the China border.", time: "7–8 h with stops", stay: "Karimabad", altitude: "~2,438 m" },
      { title: "Karimabad to Skardu", text: "Via Gilgit and the Indus gorge road to Skardu.", time: "7–8 h drive", stay: "Skardu", altitude: "~2,230 m" },
      { title: "Deosai Plains", text: "Deosai Plains and Sheosar Lake.", time: "6–8 h round trip", stay: "Skardu", altitude: "~2,230 m" },
      { title: "Kachura lakes, then Chilas", text: "Shangrila (Lower Kachura) and Upper Kachura in the morning, then the drive to Chilas.", time: "1 h + 6–7 h drive", stay: "Chilas", altitude: "~1,250 m" },
      { title: "Chilas to Islamabad", text: "Down the Karakoram Highway to Islamabad.", time: "11–13 h drive" },
    ],
    included,
    excluded,
    notes: [
      "Summer only: the route needs Babusar Pass (open roughly late June to October, varies with snowfall) and Deosai (mid-June to September).",
      "The Fairy Meadows hike is approx. 2.5–4 h each way; ponies are available at extra cost.",
    ],
  },
  {
    slug: "skardu-lakes",
    name: "Skardu Lakes",
    days: 6,
    nights: 5,
    pricePKR: 24000,
    route: "Islamabad · Chilas · Skardu · Deosai",
    tagline: "Lakes, a cold desert and the high plains of Baltistan.",
    overview:
      "The lakes, deserts and high plains of Baltistan, reached by one of the most dramatic river gorges in Pakistan.",
    image: "tour-skardu-lakes",
    alt: "Red-roofed Shangrila resort reflected in a still lake below mountains in Skardu",
    difficulty: "Easy",
    maxAltitude: "approx. 4,100 m (Deosai, in season)",
    groupSize: `Max ${maxGroupSize} travellers`,
    season: "May to Oct",
    startEnd: "Islamabad → Islamabad",
    highlights: [
      "Shangrila and Upper Kachura lakes",
      "Sarfaranga cold desert",
      "Deosai Plains in season, or Shigar and Khaplu",
      "The Indus gorge road",
    ],
    itinerary: [
      { title: "Islamabad to Chilas", text: "North on the Karakoram Highway along the Indus to Chilas.", time: "11–13 h drive", stay: "Chilas", altitude: "~1,250 m" },
      { title: "Chilas to Skardu", text: "Via Jaglot and the Indus gorge road to Skardu.", time: "6–7 h drive", stay: "Skardu", altitude: "~2,230 m" },
      { title: "Kachura lakes and Sarfaranga", text: "Lower Kachura (Shangrila), Upper Kachura and the Sarfaranga cold desert.", time: "Half to full day", stay: "Skardu", altitude: "~2,230 m" },
      { title: "Deosai, or Shigar and Khaplu", text: "Mid-June to September: Deosai Plains and Sheosar Lake. Other months: Shigar Fort and Khaplu instead.", time: "6–8 h round trip", stay: "Skardu", altitude: "~2,230 m" },
      { title: "Skardu to Chilas", text: "Back through the Indus gorge to Chilas.", time: "6–7 h drive", stay: "Chilas", altitude: "~1,250 m" },
      { title: "Chilas to Islamabad", text: "Down the Karakoram Highway to Islamabad.", time: "11–13 h drive" },
    ],
    included,
    excluded,
    notes: [
      "Deosai is usually open mid-June to September. Outside that window, Day 4 goes to Shigar Fort and Khaplu instead (the May departure runs this version).",
    ],
  },
];

export const getTour = (slug: string) => tours.find((t) => t.slug === slug);

/* -------------------------------------------------------------- departures */

// Static fallback only; D1 is the source of truth (migration 0004 matches these rows).
export const departures = [
  { tour: "hunza-escape", date: "2026-10-10", seatsLeft: 12, seats: 12 },
  { tour: "hunza-escape", date: "2026-10-24", seatsLeft: 12, seats: 12 },
  { tour: "skardu-lakes", date: "2027-05-15", seatsLeft: 12, seats: 12 },
  { tour: "grand-karakoram", date: "2027-06-26", seatsLeft: 12, seats: 12 },
  { tour: "grand-karakoram", date: "2027-08-07", seatsLeft: 12, seats: 12 },
];

// UTC so the build machine and the visitor's browser always print the same date.
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

/* ------------------------------------------------------------------ why us */

export const whyUs = {
  image: "why-altit-fort" as ImageName,
  alt: "Hunza Valley and snowy peaks seen through a window of Altit Fort",
  statement: "We plan every day around the mountains: honest drive times, small groups and a route that changes with the season.",
  points: [
    { title: "A team on the ground in Gilgit-Baltistan", text: "We check the roads and the weather every morning and change the plan when the mountains say so." },
    { title: "Safety before schedule", text: "If a road is blocked or the weather turns, the tour leader re-routes or adjusts the day. We never push on just to keep a timetable." },
    { title: "Clear about the price", text: "Every tour lists exactly what is and is not included, so the price you see is the price you can plan around." },
  ],
  // Facts only (CONTENT_BRIEF section 2).
  stats: [
    { value: 3, start: 0, suffix: "", label: "Signature routes" },
    { value: maxGroupSize, start: 0, suffix: "", label: "Travellers max per group" },
    { value: 4693, start: 3000, suffix: "m", label: "Highest point: Khunjerab Pass" },
    { value: 8126, start: 6000, suffix: "m", label: "Nanga Parbat, seen from Fairy Meadows" },
  ],
};

/* ---------------------------------------------------------------- promises */

// Shown instead of testimonials while features.showTestimonials is false.
export const promises = [
  { title: "Honest drive times", text: "Every itinerary day shows its approximate drive or hike time." },
  { title: "Small groups", text: `${maxGroupSize} travellers maximum on every departure.` },
  { title: "Simple booking", text: "A 30% deposit holds your seats; the balance is paid before departure." },
  { title: "A real person on WhatsApp", text: "Before, during and after the trip." },
];

/* ------------------------------------------------------------ how it works */

export const steps = [
  { title: "Tell us your plan", text: "Pick a tour and a date, or describe your trip on WhatsApp. Dates, group size, pace." },
  { title: "Book your seats", text: "Book online or on WhatsApp. A 30% deposit by bank transfer or Raast holds your seats." },
  { title: "Travel north", text: "Pay the balance before departure. We handle transport, stays and the day-by-day plan." },
];

/* ------------------------------------------------------------- testimonials */

// Hidden (features.showTestimonials = false). Only add real reviews from real customers here.
export const testimonials: { name: string; from: string; trip: string; text: string }[] = [];

/* ------------------------------------------------------------------ gallery */

export const gallery: { image: ImageName; alt: string }[] = [
  { image: "gallery-deosai", alt: "Green plains of Deosai, the Land of Giants, under a big sky" },
  { image: "gallery-kaghan-lake", alt: "Snowy peaks reflected in a still lake in Kaghan Valley" },
  { image: "gallery-rakaposhi", alt: "Snow-capped Rakaposhi rising behind brown ridges in Hunza" },
  { image: "gallery-karimabad-night", alt: "Karimabad village lit up at night under the stars" },
  { image: "gallery-khunjerab", alt: "Yaks grazing below snowy mountains at Khunjerab" },
  { image: "gallery-fairy-meadows-cabins", alt: "Old log cabins among pine trees at Fairy Meadows" },
];

/* ------------------------------------------------------------ legal pages */

// Booking rules quoted on /terms. Keep in step with wrangler.toml [vars] (DEPOSIT_PERCENT, HOLD_HOURS)
// and ONLINE_CUTOFF_HOURS in src/lib/booking-rules.ts.
export const bookingTerms = {
  depositPercent: 30,
  holdHours: 48,
  balanceDueDays: 7,
  maxGroup: maxGroupSize,
};

// Terms, privacy and refund pages. Set draft: true to show a "Draft" banner on all three.
export const legalMeta = { draft: false, updated: "27 Sep 2026" };

/* ------------------------------------------------------ cancellation policy */

// Part of the booking conditions accepted at checkout. When this changes, bump TERMS_VERSION in server/bookings.ts.
export const cancellationPolicy = [
  "21 days or more before departure: full refund of the deposit.",
  "8 to 20 days before departure: 50% of the deposit refunded.",
  "7 days or less before departure: the deposit is not refundable.",
  "If we cancel, or weather or a road closure stops the trip: a full refund or a free change of date, your choice.",
];

/* ---------------------------------------------------------------------- faq */

// `tour: true` also shows the question on every tour page.
export const faqs: { q: string; a: string; tour?: boolean }[] = [
  { q: "When is the best time to visit the north?", a: "May to October for most routes. Hunza is at its best in April (blossom) and from late October to early November (autumn colours). Deosai and Fairy Meadows are open roughly mid-June to September. See the \"When to go\" chart for each destination." },
  { q: "How fit do I need to be?", a: "Hunza Escape and Skardu Lakes are easy and suit most people, though some drive days are long. The Grand Karakoram includes a hike of approx. 2.5–4 h each way to Fairy Meadows; ponies are available.", tour: true },
  { q: "Will I get altitude sickness?", a: "Most nights are below 2,600 m, which most people handle fine. Khunjerab (4,693 m) and Deosai (~4,100 m) are short visits. Drink water, go slowly, and tell your tour leader about headaches or dizziness.", tour: true },
  { q: "Can children and older travellers join?", a: "Hunza Escape and Skardu Lakes are easy and suit most ages. Grand Karakoram includes a 2.5–4 h hike to Fairy Meadows at altitude; ponies are available." },
  { q: "How do I book and pay?", a: "Book online from any tour page or send us a WhatsApp message. A 30% deposit by bank transfer or Raast holds your seats, and the balance is paid before departure." },
  { q: "What is your cancellation policy?", a: cancellationPolicy.join(" ") },
  { q: "What if a road is blocked?", a: "Landslides happen. The tour leader re-routes or adjusts the plan; safety comes before the schedule.", tour: true },
  { q: "What should I pack?", a: "Layers, a warm jacket even in summer, sturdy shoes, sunscreen, sunglasses, a power bank and a small personal medical kit.", tour: true },
  { q: "Do foreigners need permits?", a: "Hunza, Skardu and Fairy Meadows generally need only a valid Pakistan visa. Carry your passport; there are checkposts on the KKH. Rules can change, so confirm before travel." },
  { q: "Is the food suitable for vegetarians?", a: "Yes, local dal, vegetables and rice are available everywhere. Tell us your needs when booking." },
  { q: "Can I book a private or custom trip?", a: "Yes. Any tour can run privately on your dates, and we can build a custom route for families, couples or groups." },
];
