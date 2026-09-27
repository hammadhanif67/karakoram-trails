-- Content v2 (CONTENT_BRIEF.md): new budget prices, no fake "seats booked", Grand Karakoram moved to
-- dates when Babusar Pass and Deosai are reliably open. content.ts holds the same values as a fallback.
--
-- Guarded: a departure that has an active booking (pending_payment, verifying or confirmed) is left
-- untouched, so real customers never lose seats or see their date move. The seed check
-- (npm run db:check:*) then reports any row that could not be changed.

-- Prices (per person). Existing bookings keep the total frozen at booking time.
UPDATE tours SET price_pkr = 18000 WHERE slug = 'hunza-escape';
UPDATE tours SET price_pkr = 24000 WHERE slug = 'skardu-lakes';
UPDATE tours SET price_pkr = 30000 WHERE slug = 'grand-karakoram';

-- Every departure starts with all seats free (seats_booked held seed placeholders, not real bookings).
UPDATE departures SET seats_booked = 0
 WHERE NOT EXISTS (
   SELECT 1 FROM bookings b
    WHERE b.departure_id = departures.id AND b.status IN ('pending_payment', 'verifying', 'confirmed')
 );

-- Grand Karakoram: 12 Jun -> 26 Jun 2027 and 10 Jul -> 7 Aug 2027.
UPDATE departures SET start_date = '2027-06-26'
 WHERE start_date = '2027-06-12'
   AND tour_id = (SELECT id FROM tours WHERE slug = 'grand-karakoram')
   AND NOT EXISTS (
     SELECT 1 FROM bookings b
      WHERE b.departure_id = departures.id AND b.status IN ('pending_payment', 'verifying', 'confirmed')
   );
UPDATE departures SET start_date = '2027-08-07'
 WHERE start_date = '2027-07-10'
   AND tour_id = (SELECT id FROM tours WHERE slug = 'grand-karakoram')
   AND NOT EXISTS (
     SELECT 1 FROM bookings b
      WHERE b.departure_id = departures.id AND b.status IN ('pending_payment', 'verifying', 'confirmed')
   );
