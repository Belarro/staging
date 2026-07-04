-- Follow-up message templates become database-backed and admin-editable.
-- Source of truth moves from hardcoded objects in
-- frontend/src/app/api/follow-ups/route.ts into this table.
-- See FOLLOWUP_SYSTEM_SPEC.md Part 3.

CREATE TABLE IF NOT EXISTS belarro_v4_followup_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow TEXT NOT NULL CHECK (flow IN ('new', 'reengage')),
  stage INT NOT NULL CHECK (stage BETWEEN 1 AND 5),
  language TEXT NOT NULL CHECK (language IN ('en', 'de')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT,
  UNIQUE (flow, stage, language)
);

-- Seed the 20 templates (5 stages x 2 flows x 2 languages).
-- CHEF_PAGE placeholder below is the literal URL used in route.ts.
-- [Name] is the only substitution placeholder — enforced by app-level
-- validation, not by this migration.

INSERT INTO belarro_v4_followup_template (flow, stage, language, title, body) VALUES

-- ─── NEW LEAD FLOW — EN ───────────────────────────────────────────────
('new', 1, 'en', 'The Link (2 hours)',
$$Hello [Name],

Thank you for your time today; it was a pleasure meeting you.

Here is the link for our varieties and pricing:

https://belarro.com/for-chefs

I would love to hear what you think. Just a reminder: no delivery fees, no minimum order.

Enjoy the rest of your service.
Ron from Belarro$$),

('new', 2, 'en', 'The Taste (2 days)',
$$Hello [Name],

Ron from Belarro. I hope you had the chance to taste the samples and see how they work with your dishes.

We only grow what you order, no old stock, zero waste. We harvest the morning of delivery, and our greens last up to 10 days in the fridge.

Let me know what caught your eye and I will get it into the next grow cycle.

Ron from Belarro$$),

('new', 3, 'en', 'The Facts (5 days)',
$$Hello [Name],

Ron from Belarro. Wanted to follow up and see how you found our greens.

We grow over 25 varieties, more variety than most suppliers, more options for your plates. Orders are recurring: order once, receive fresh every Tuesday. You can always change, add or cancel.

Here is the full list:

https://belarro.com/for-chefs

Ron from Belarro$$),

('new', 4, 'en', 'The Easy Yes (2 weeks)',
$$Hello [Name],

Ron from Belarro. Haven't heard back, just wanted to check in.

We are local. No imports, faster, more consistent product, just fresh greens with less emissions.

No minimums, no delivery fees. Just let me know when you are ready.

Ron from Belarro$$),

('new', 5, 'en', 'The Open Door (1 month)',
$$Hello [Name],

Ron from Belarro. No worries if the timing wasn't right.

Whenever you need fresh microgreens, we are one message away. No minimums, free delivery, harvested the morning we bring them to you.

Our varieties and pricing are always here:

https://belarro.com/for-chefs

Wishing you a great season.
Ron from Belarro$$),

-- ─── NEW LEAD FLOW — DE ───────────────────────────────────────────────
('new', 1, 'de', 'The Link (2 Stunden)',
$$Hallo [Name],

vielen Dank für Ihre Zeit heute, es war eine Freude Sie kennenzulernen.

Hier ist der Link zu unseren Sorten und Preisen:

https://belarro.com/for-chefs

Ich würde mich freuen zu hören, was Sie denken. Zur Erinnerung: keine Lieferkosten, keine Mindestbestellung.

Genießen Sie den Rest Ihres Abends.
Ron von Belarro$$),

('new', 2, 'de', 'The Taste (2 Tage)',
$$Hallo [Name],

Ron von Belarro. Ich hoffe, Sie hatten die Gelegenheit, die Proben zu probieren und zu sehen, wie sie zu Ihren Gerichten passen.

Wir wachsen nur, was Sie bestellen, kein alter Bestand, kein Abfall. Wir ernten am Morgen der Lieferung und unsere Microgreens bleiben bis zu 10 Tage frisch im Kühlschrank.

Lassen Sie mich wissen, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.

Ron von Belarro$$),

('new', 3, 'de', 'The Facts (5 Tage)',
$$Hallo [Name],

Ron von Belarro. Ich wollte nachfragen, wie Ihnen unsere Microgreens gefallen haben.

Wir bauen über 25 Sorten an, mehr Auswahl als die meisten Lieferanten, mehr Möglichkeiten für Ihre Teller. Bestellungen sind wiederkehrend: einmal bestellen, jeden Dienstag frisch erhalten. Sie können jederzeit ändern, hinzufügen oder stornieren.

Hier ist die vollständige Liste:

https://belarro.com/for-chefs

Ron von Belarro$$),

('new', 4, 'de', 'The Easy Yes (2 Wochen)',
$$Hallo [Name],

Ron von Belarro. Ich habe noch nichts gehört und wollte kurz nachfragen.

Wir sind lokal. Keine Importe, schnelleres und konsistenteres Produkt, einfach frische Microgreens mit weniger Emissionen.

Keine Mindestbestellung, keine Lieferkosten. Sagen Sie mir einfach, wann Sie bereit sind.

Ron von Belarro$$),

('new', 5, 'de', 'The Open Door (1 Monat)',
$$Hallo [Name],

Ron von Belarro. Kein Problem, wenn der Zeitpunkt nicht gepasst hat.

Wann immer Sie frische Microgreens benötigen, wir sind eine Nachricht entfernt. Keine Mindestbestellung, kostenlose Lieferung, geerntet am Morgen der Lieferung.

Unsere Sorten und Preise finden Sie hier:

https://belarro.com/for-chefs

Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$),

-- ─── RE-ENGAGE FLOW — EN ──────────────────────────────────────────────
('reengage', 1, 'en', 'Re-Engage (2 hours)',
$$Hello [Name],

Ron from Belarro — the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.

A lot has grown since: 25+ varieties, fixed Tuesday deliveries to Berlin kitchens, 10-day shelf life.

I still owe you a proper sample kit — free, no strings. Should I bring one by next Tuesday?

Ron from Belarro$$),

('reengage', 2, 'en', 'The Fact (2 days)',
$$Hello [Name],

Ron from Belarro. A number most chefs don't know: imported microgreens arrive 3-4 days old with 5-6 days of shelf life left. Ours are harvested the morning of delivery and last up to 10 days.

The sample kit offer stands — one word and it's on Tuesday's route.

Ron from Belarro$$),

('reengage', 3, 'en', 'Proof + Link (5 days)',
$$Hello [Name],

Ron from Belarro. If you're curious what we're growing right now, here's the full list with pricing:

https://belarro.com/for-chefs

Tuesday is delivery day. A sample kit costs you nothing but five minutes of curiosity.

Ron from Belarro$$),

('reengage', 4, 'en', 'The Easy Yes (2 weeks)',
$$Hello [Name],

Ron from Belarro. Haven't heard back, just wanted to check in.

We are local. No imports, faster, more consistent product, just fresh greens with less emissions.

No minimums, no delivery fees. Just let me know when you are ready.

Ron from Belarro$$),

('reengage', 5, 'en', 'The Open Door (1 month)',
$$Hello [Name],

Ron from Belarro. No worries if the timing wasn't right.

Whenever you need fresh microgreens, we are one message away. No minimums, free delivery, harvested the morning we bring them to you.

Our varieties and pricing are always here:

https://belarro.com/for-chefs

Wishing you a great season.
Ron from Belarro$$),

-- ─── RE-ENGAGE FLOW — DE ──────────────────────────────────────────────
('reengage', 1, 'de', 'Re-Engage (2 Stunden)',
$$Hallo [Name],

Ron von Belarro - die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.

Seitdem hat sich viel getan: 25+ Sorten, feste Dienstags-Lieferung an Berliner Küchen, 10 Tage Haltbarkeit.

Ich schulde Ihnen noch ein richtiges Probierpaket - kostenlos, ohne Verpflichtung. Soll ich Ihnen nächsten Dienstag eins vorbeibringen?

Ron von Belarro$$),

('reengage', 2, 'de', 'The Fact (2 Tage)',
$$Hallo [Name],

Ron von Belarro. Ein Fakt, den viele Köche nicht kennen: importierte Microgreens sind bei Ankunft 3-4 Tage alt und haben noch 5-6 Tage Haltbarkeit. Unsere werden am Liefermorgen geerntet und halten bis zu 10 Tage.

Das Probierpaket-Angebot steht - ein Wort genügt und es ist auf der Dienstags-Route.

Ron von Belarro$$),

('reengage', 3, 'de', 'Proof + Link (5 Tage)',
$$Hallo [Name],

Ron von Belarro. Falls Sie neugierig sind, was wir gerade anbauen - hier ist die vollständige Liste mit Preisen:

https://belarro.com/for-chefs

Dienstag ist Liefertag. Ein Probierpaket kostet Sie nichts außer fünf Minuten Neugier.

Ron von Belarro$$),

('reengage', 4, 'de', 'The Easy Yes (2 Wochen)',
$$Hallo [Name],

Ron von Belarro. Ich habe noch nichts gehört und wollte kurz nachfragen.

Wir sind lokal. Keine Importe, schnelleres und konsistenteres Produkt, einfach frische Microgreens mit weniger Emissionen.

Keine Mindestbestellung, keine Lieferkosten. Sagen Sie mir einfach, wann Sie bereit sind.

Ron von Belarro$$),

('reengage', 5, 'de', 'The Open Door (1 Monat)',
$$Hallo [Name],

Ron von Belarro. Kein Problem, wenn der Zeitpunkt nicht gepasst hat.

Wann immer Sie frische Microgreens benötigen, wir sind eine Nachricht entfernt. Keine Mindestbestellung, kostenlose Lieferung, geerntet am Morgen der Lieferung.

Unsere Sorten und Preise finden Sie hier:

https://belarro.com/for-chefs

Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$)

ON CONFLICT (flow, stage, language) DO NOTHING;
