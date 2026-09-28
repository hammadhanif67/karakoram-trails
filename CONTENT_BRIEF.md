# Karakoram Trails: Content & Structure Brief v2

Hand this file to Claude Code (put it in the repo root). It replaces the placeholder content with factual, place-accurate content, adds travel durations everywhere, and lists structural upgrades. Design, colours and fonts stay the same.

## 0. Ground rules

1. No invented reviews, traveller counts, years in business or ratings. Stats must be facts that are true for anyone who runs these tours (see section 2).
2. All drive and hike times are approximate and must be labelled "approx." on the site. Roads in Gilgit-Baltistan change with weather and landslides.
3. Keep existing tour slugs (`hunza-escape`, `skardu-lakes`, `grand-karakoram`) so URLs and D1 rows stay valid.
4. Prices and departures live in D1 (single source of truth). Any change here means: update `content.ts` + a D1 migration/update, and the seed check must pass.
5. Every photo must show the actual place named in its caption, with a free licence (see section 9).

## 1. Hero

- Headline stays. Rotating words: `Hunza`, `Skardu`, `Fairy Meadows`, `Khunjerab`.
- Sub-line: "Small-group road journeys through Gilgit-Baltistan, planned day by day, with honest drive times and a local team on the ground."
- "Next departure" strip: pulled from D1 (already live).

## 2. Stats strip (facts only, replaces 12+ years / 4,800 travellers / 4.9 rating)

| Number | Label |
|---|---|
| 3 | Signature routes |
| 12 | Travellers max per group |
| 4,693 m | Highest point: Khunjerab Pass |
| 8,126 m | Nanga Parbat, seen from Fairy Meadows |

The number-ticker animation can stay (final values must be in the static HTML, as already fixed).

## 3. Destinations (one card each + a new destination page each)

Each card shows: altitude, best time, "getting there" duration, 3 highlights, and a 12-month season strip (green = best, amber = possible, grey = closed/not advised).

### Hunza Valley
- Altitude: Karimabad approx. 2,500 m
- Best time: April (blossom), May–Sept (summer), late Oct–early Nov (autumn colours)
- Season strip: Jan grey · Feb grey · Mar amber · Apr green · May green · Jun green · Jul green · Aug green · Sep green · Oct green · Nov amber · Dec grey
- Getting there: Islamabad → Karimabad by road approx. 18–20 h over 2 days (overnight in Chilas or Naran)
- Highlights: Baltit and Altit forts above Karimabad; Attabad Lake, formed by a 2010 landslide; Passu Cones and the Hussaini suspension bridge; sunrise over Rakaposhi and Ultar from Eagle's Nest (Duikar)

### Skardu
- Altitude: Skardu town approx. 2,230 m
- Best time: May–Oct (Deosai only mid-June–Sept)
- Season strip: Jan grey · Feb grey · Mar grey · Apr amber · May green · Jun green · Jul green · Aug green · Sep green · Oct green · Nov amber · Dec grey
- Getting there: road approx. 20–22 h over 2 days via the KKH and Jaglot–Skardu road; flights from Islamabad approx. 1 h (weather-dependent, often cancelled)
- Highlights: Lower Kachura (Shangrila) and Upper Kachura lakes; the cold desert at Sarfaranga/Katpana; Shigar Fort; Deosai Plains, one of the highest plateaus in the world (approx. 4,100 m average)

### Fairy Meadows
- Altitude: approx. 3,300 m
- Best time: mid-June–Sept
- Season strip: Jan grey · Feb grey · Mar grey · Apr grey · May amber · Jun green · Jul green · Aug green · Sep green · Oct amber · Nov grey · Dec grey
- Getting there: road to Raikot Bridge on the KKH, then local jeep approx. 1.5–2 h to Tatto/Jhel, then a hike of approx. 2.5–4 h (ponies available)
- Highlights: face-on views of Nanga Parbat (8,126 m); the hike to Beyal Camp and the Nanga Parbat viewpoint (approx. 3–4 h each way); night skies with almost no light pollution

## 4. Tours

For each tour page: overview, quick facts row, day-by-day itinerary (each day shows drive/hike time, overnight place and approx. altitude), route map, included/excluded, "good to know", departures from D1.

Sample prices below are a starting point. The operator sets real prices; update D1 and `content.ts` together.

### 4.1 Hunza Escape (`hunza-escape`)
- Quick facts: 5 days / 4 nights · Islamabad to Islamabad · Easy · Max altitude 4,693 m (Khunjerab) · Max 12 travellers · Sample price PKR 42,000 per person
- Route note: All-season route is the Karakoram Highway both ways. Mid-June to early October the outbound leg can go via Naran and Babusar Pass (4,173 m) instead; Babusar is usually closed by snow outside that window.
- Overview: "Five days on the Karakoram Highway into the heart of Hunza: two forts, a turquoise lake, the Passu Cones and the China border at Khunjerab."

| Day | Plan | Drive/hike (approx.) | Overnight |
|---|---|---|---|
| 1 | Islamabad → Besham → Chilas along the Indus | 11–13 h | Chilas (~1,250 m) |
| 2 | Chilas → Nanga Parbat viewpoint at Raikot → Rakaposhi viewpoint → Karimabad | 5–6 h | Karimabad (~2,500 m) |
| 3 | Attabad Lake → Hussaini bridge → Passu Cones → Khunjerab Pass → back | 7–8 h with stops | Karimabad |
| 4 | Sunrise at Eagle's Nest, Baltit and Altit forts → drive to Chilas | 5–6 h | Chilas |
| 5 | Chilas → Islamabad | 11–13 h | Home |

### 4.2 Skardu Lakes (`skardu-lakes`)
- Quick facts: 6 days / 5 nights · Islamabad to Islamabad · Easy · Max altitude approx. 4,100 m (Deosai, in season) · Max 12 travellers · Sample price PKR 52,000 per person
- Overview: "The lakes, deserts and high plains of Baltistan, reached by one of the most dramatic river gorges in Pakistan."

| Day | Plan | Drive/hike (approx.) | Overnight |
|---|---|---|---|
| 1 | Islamabad → Chilas via KKH | 11–13 h | Chilas |
| 2 | Chilas → Jaglot → Skardu along the Indus gorge | 6–7 h | Skardu (~2,230 m) |
| 3 | Lower Kachura (Shangrila), Upper Kachura, Sarfaranga cold desert | half/full day | Skardu |
| 4 | Mid-June–Sept: Deosai Plains and Sheosar Lake. Other months: Shigar Fort or Khaplu (not both: they are in different directions) | 6–8 h round trip | Skardu |
| 5 | Skardu → Chilas | 6–7 h | Chilas |
| 6 | Chilas → Islamabad | 11–13 h | Home |

### 4.3 Grand Karakoram (`grand-karakoram`)
- Quick facts: 9 days / 8 nights · Islamabad to Islamabad · Moderate (includes a 2.5–4 h hike) · Max altitude 4,693 m · Max 12 travellers · Summer only (mid-June–Sept) · Sample price PKR 89,000 per person
- Overview: "Fairy Meadows, Hunza and Skardu in one journey: the classic summer circuit of the north."

| Day | Plan | Drive/hike (approx.) | Overnight |
|---|---|---|---|
| 1 | Islamabad → Naran | 6–7 h | Naran (~2,400 m) |
| 2 | Naran → Babusar Pass (4,173 m) → Raikot Bridge → jeep → hike to Fairy Meadows | 5 h drive + 1.5–2 h jeep + 2.5–4 h hike | Fairy Meadows (~3,300 m) |
| 3 | Hike to Beyal Camp and Nanga Parbat viewpoint | 6–8 h round trip | Fairy Meadows |
| 4 | Hike down, jeep to Raikot → Karimabad | 3 h hike/jeep + 3–4 h drive | Karimabad |
| 5 | Attabad Lake, Passu, Khunjerab Pass | 7–8 h with stops | Karimabad |
| 6 | Karimabad → Gilgit → Skardu | 7–8 h | Skardu |
| 7 | Deosai Plains and Sheosar Lake | 6–8 h round trip | Skardu |
| 8 | Shangrila and Upper Kachura → Chilas | 1 h + 6–7 h | Chilas |
| 9 | Chilas → Islamabad | 11–13 h | Home |

### Included / excluded (all tours)
- Included: private transport with driver, fuel and tolls; hotel stays on twin/triple sharing; breakfast and dinner; tour leader; jeep transfers where listed.
- Excluded: lunch; fort, park and museum tickets; ponies and porters; personal expenses; travel insurance; anything not listed as included.

### Good to know (all tours)
- Long drive days are normal in the north. Times shown are approximate and depend on weather, roadworks and landslides.
- Mobile coverage is patchy; SCOM and Zong work best in Gilgit-Baltistan.
- Carry cash; ATMs exist in Gilgit, Karimabad and Skardu but can run empty.

## 5. Departures (D1)

- Remove all fake "seats booked": every departure starts with all 12 seats free.
- Hunza Escape: keep 10 Oct 2026 and 24 Oct 2026 (KKH route; 24 Oct lands in autumn-colour season).
- Skardu Lakes: 15 May 2027 (runs the Shigar Fort or Khaplu version of Day 4, since Deosai is closed in May).
- Grand Karakoram: move to 26 Jun 2027 and 7 Aug 2027 (Babusar and Deosai reliably open).

## 6. "When to go" section (new, home page)

A 12-month grid with the three destinations as rows, using the season strips from section 3, plus four one-line season notes:
- Spring (late Mar–Apr): apricot and cherry blossom in Hunza; high passes still closed.
- Summer (May–Sept): everything open; Deosai flowers in July–Aug; busiest season.
- Autumn (Oct–early Nov): golden poplars in Hunza; cold nights; Babusar closing.
- Winter (Dec–Feb): snow and short days; most tours paused; Hunza still reachable via KKH.

## 7. Testimonials

Hide the section behind a config flag (`showTestimonials: false`) until real reviews exist. Replace it with a "How a trip works" or "Our promises" block:
- Honest drive times on every itinerary day.
- Small groups, 12 travellers maximum.
- 30% deposit to book, balance before departure.
- A real person on WhatsApp before, during and after the trip.

## 8. FAQ additions

1. Will I get altitude sickness? Most nights are below 2,600 m, which most people handle fine. Khunjerab (4,693 m) and Deosai (~4,100 m) are short visits. Drink water, go slowly, and tell your tour leader about headaches or dizziness.
2. Can children and older travellers join? Hunza Escape and Skardu Lakes are easy and suit most ages. Grand Karakoram includes a 2.5–4 h hike to Fairy Meadows at altitude; ponies are available.
3. Do foreigners need permits? Hunza, Skardu and Fairy Meadows generally need only a valid Pakistan visa. Carry your passport; there are checkposts on the KKH. Rules can change, so confirm before travel.
4. What should I pack? Layers, a warm jacket even in summer, sturdy shoes, sunscreen, sunglasses, a power bank and a small personal medical kit.
5. What if a road is blocked? Landslides happen. The tour leader re-routes or adjusts the plan; safety comes before the schedule.
6. Is the food suitable for vegetarians? Yes, local dal, vegetables and rice are available everywhere. Tell us your needs when booking.

## 9. Images: shot list and rules

Rules for Claude Code:
- Sources: Unsplash, Pexels or Wikimedia Commons only. Check each licence. Wikimedia CC BY / CC BY-SA images need a visible credit.
- Verify that each photo actually shows the named place (title, description, location). If unsure, skip it.
- Download, convert to AVIF/WebP in the existing responsive sizes, add blur placeholders. Never hotlink.
- Keep a `public/images/CREDITS.md` with file, source URL, author and licence, and a small credits line in the footer.
- Alt text describes the actual scene and place.

Shots needed:
- Hero: Passu Cones or Rakaposhi at golden hour (wide)
- Hunza: Baltit Fort with Karimabad; Attabad Lake; Hussaini bridge; autumn poplars
- Skardu: Lower Kachura (Shangrila); Sarfaranga cold desert; Deosai plains; Shigar Fort
- Fairy Meadows: Nanga Parbat from the meadows; the jeep road
- Khunjerab Pass gate
- Karakoram Highway along the Indus (for the route map / "how it works")

## 10. Motion (animation) plan

1. Check `package.json` first: Magic UI components usually already use the `motion` package (formerly Framer Motion, imported from `motion/react`). Install it only if missing.
2. Wrap the app in `MotionConfig reducedMotion="user"` and use `LazyMotion` with `m.*` components to keep the bundle small.
3. Use motion for:
   - Section reveal on scroll (fade and rise, staggered cards).
   - Itinerary days as expandable rows with smooth height animation.
   - Destination season strips filling month by month when they scroll into view.
   - Gallery lightbox with shared-layout zoom from thumbnail to full view.
   - PKR/USD toggle with a sliding pill.
4. Nothing important may depend on animation: content must be visible in static HTML and with reduced motion.

## 11. Structural upgrades (in priority order)

1. **Admin: manage departures and prices.** Add/edit/close departures, change seat totals and tour prices from `/admin`, without using the terminal. D1 remains the source of truth; the static `content.ts` values become only a no-JS fallback, and the seed check is replaced by an admin-side warning when they differ.
2. **Destination pages:** `/destinations/hunza`, `/destinations/skardu`, `/destinations/fairy-meadows` with the section 3 content, season strip, travel-time table and the tours that visit them. Link destination cards to these pages.
3. **Itinerary UI:** day-by-day rows with drive time, overnight place and altitude; a small altitude profile chart per tour (inline SVG).
4. **Travel-times table** on each tour and destination page (the "approx." times above).
5. **Brand config file:** move business name, logo, colours, phone, WhatsApp, email, address, social links and feature flags (`showTestimonials`, etc.) into one `site.config.ts`, so the whole site can be rebranded from one file.
6. **SEO:** JSON-LD `TravelAgency` in the layout, `TouristTrip` + `Offer` on tour pages; canonical and `og:url` on every page; destination pages in the sitemap.
7. **Downloadable itinerary:** a print-friendly version of each tour page (print CSS), so visitors can save it as PDF from the browser.
8. **Later:** Meta Pixel + CAPI and GA4 events (view tour, start checkout, booking created), custom domain, email confirmations, JazzCash/Easypaisa/card providers.
