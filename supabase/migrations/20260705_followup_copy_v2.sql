-- Follow-up copy V2: new positioning ("private grower" + "taste like
-- vegetables used to taste" as lead angles, consistency/controlled
-- environment as secondary support) + re-engage flow cut from 5 to 4 stages.
-- Supersedes the copy seeded by 20260704_followup_template_table.sql.
-- See FOLLOWUP_COPY_V2.md for full source text and rationale.
--
-- Net effect: 20 old templates -> 18 new templates.
--   new-lead:  5 stages x 2 languages = 10 rows (unchanged count, new copy)
--   re-engage: 4 stages x 2 languages = 8 rows (was 5 stages/10 rows —
--              the old stage-4 "Easy Yes" (14-day) row is deleted outright,
--              old stage-5 "Open Door" is renumbered down to stage 4)
--
-- Run this in the Supabase SQL Editor. Not executed automatically.
--
-- NOTE on [Link]: FOLLOWUP_COPY_V2.md writes the chef-page URL as a "[Link]"
-- placeholder in the source doc, but the app's placeholder allow-list
-- (frontend/src/app/api/follow-up-templates/route.ts ALLOWED_PLACEHOLDERS,
-- and route.ts assertNoUnknownPlaceholders) only substitutes [Name] — any
-- other bracket token ships to a real chef unfilled (the exact "[Restaurant]"
-- bug class this system was built to prevent). So here [Link] is resolved to
-- the literal https://belarro.com/for-chefs URL, matching how every prior
-- seeded template already embedded that same link directly in the body.
-- Every other word of the doc's copy is kept verbatim.

-- ─── STEP 1 — Drop the re-engage 14-day stage entirely ─────────────────────
-- Old re-engage stage 4 ("The Easy Yes", 14 days) has no equivalent in V2 —
-- the re-engage flow is cut from 5 stages to 4 (2h/2d/5d/30d).
DELETE FROM belarro_v4_followup_template
WHERE flow = 'reengage' AND stage = 4;

-- ─── STEP 2 — Renumber old re-engage stage 5 down to stage 4 ───────────────
-- Old stage 5 ("The Open Door", 30 days) becomes the new stage 4 (still
-- 30 days, still the last message, textually identical to new-lead stage 5).
-- Do this before inserting new stage-4 content below so the UNIQUE
-- (flow, stage, language) constraint has no collision.
UPDATE belarro_v4_followup_template
SET stage = 4
WHERE flow = 'reengage' AND stage = 5;

-- ─── STEP 3 — Replace all body/title text with V2 copy ────────────────────

-- NEW LEAD FLOW — EN
UPDATE belarro_v4_followup_template SET title = 'The Link (2 hours)', body =
$$Hello [Name],
Thank you for your time today — it was a pleasure meeting you.
Here's our chef page with all varieties and pricing: https://belarro.com/for-chefs
Everything is grown to order, for your kitchen specifically — no minimum, no delivery fees.
Enjoy the rest of your service.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 1 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 days)', body =
$$Hello [Name], Ron from Belarro.
Did the samples make it onto a plate? I'm curious what you noticed — most chefs say it tastes like vegetables used to taste, twenty or thirty years back. That's not nostalgia, that's soil. Ours is grown in real soil, harvested the morning it reaches you.
Tell me what caught your eye and I'll seed it into the next grow cycle for you.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 2 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Model (5 days)', body =
$$Hello [Name], Ron from Belarro.
Something most kitchens don't have: a private grower. We only grow what a chef asks for — seeded for your kitchen specifically, on a schedule timed to your Tuesday delivery. When your menu changes, we reseed.
Full list: https://belarro.com/for-chefs
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 3 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Consistency (14 days)', body =
$$Hello [Name], Ron from Belarro.
One more thing worth knowing: we grow indoors, controlled environment. Same quality in January as in July — snow or sun doesn't touch it. That's not something an import or an outdoor farm can promise.
The sample offer stands whenever you want to try it.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 4 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 days)', body =
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right — last message from me.
Whenever garnish becomes a topic, we're one message away: your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 5 AND language = 'en';

-- NEW LEAD FLOW — DE
UPDATE belarro_v4_followup_template SET title = 'The Link (2 Stunden)', body =
$$Hallo [Name],
vielen Dank für Ihre Zeit heute — es war eine Freude, Sie kennenzulernen.
Hier ist unsere Speisekarte für Köche mit allen Sorten und Preisen: https://belarro.com/for-chefs
Alles wächst auf Bestellung, gezielt für Ihre Küche — keine Mindestbestellung, keine Lieferkosten.
Genießen Sie den Rest Ihres Service.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 1 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Haben die Proben es schon auf einen Teller geschafft? Mich interessiert, was Ihnen aufgefallen ist — die meisten Köche sagen, es schmeckt wie Gemüse vor zwanzig, dreißig Jahren. Das ist keine Nostalgie, das ist Erde. Unsere wachsen in echter Erde und werden am Morgen der Lieferung geerntet.
Sagen Sie mir, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 2 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Model (5 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Etwas, das die meisten Küchen nicht haben: einen privaten Anbauer. Wir bauen nur an, was ein Koch bestellt — gezielt für Ihre Küche gesät, im Takt Ihrer Dienstags-Lieferung. Wenn sich Ihre Karte ändert, säen wir neu.
Vollständige Liste: https://belarro.com/for-chefs
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 3 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Consistency (14 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Noch etwas Wissenswertes: Wir bauen drinnen an, in einer kontrollierten Umgebung. Gleiche Qualität im Januar wie im Juli — Schnee oder Sonne ändern nichts daran. Das kann ein Import oder eine Freilandfarm nicht versprechen.
Das Probierangebot steht, wann immer Sie es probieren möchten.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 4 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat — letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird: wir sind eine Nachricht entfernt — Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'new' AND stage = 5 AND language = 'de';

-- RE-ENGAGE FLOW — EN (4 stages: 2h/2d/5d/30d)
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 hours)', body =
$$Hello [Name], Ron from Belarro — the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.
Something most chefs don't have: their own private grower — someone who grows exactly what their kitchen needs, nothing generic. That's what we do.
I still owe you a proper sample kit — free, no strings. Should I bring one by next Tuesday?
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 1 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 days)', body =
$$Hello [Name], Ron from Belarro.
Quick thought: everyone remembers vegetables tasting different twenty, thirty years ago. Ours still do — because we grow in real soil, not substrate, and it's on your plate the same morning it's cut.
The sample kit offer stands — one word and it's on Tuesday's route.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 2 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'Proof + Link (5 days)', body =
$$Hello [Name], Ron from Belarro.
If you're curious what we're growing right now — all varieties and pricing: https://belarro.com/for-chefs
Grown to order, delivered every Tuesday, same quality whether it's snowing or sun outside — controlled environment, always consistent.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 3 AND language = 'en';

-- Re-engage stage 4 (30 days) = identical text to new-lead stage 5 ("The
-- Open Door"). Kept as a separate row (not a shared FK) because the schema's
-- UNIQUE(flow, stage, language) key is per-flow — if either is edited later,
-- update both rows to keep them in sync (see comment in
-- frontend/src/app/api/follow-up-templates/route.ts and FOLLOWUP_COPY_V2.md
-- implementation note 6).
UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 days)', body =
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right — last message from me.
Whenever garnish becomes a topic, we're one message away: your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 4 AND language = 'en';

-- RE-ENGAGE FLOW — DE (4 stages: 2h/2d/5d/30d)
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 Stunden)', body =
$$Hallo [Name], Ron von Belarro — die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.
Etwas, das die meisten Köche nicht haben: einen eigenen privaten Anbauer — jemanden, der genau das anbaut, was ihre Küche braucht, nichts Generisches. Das machen wir.
Ich schulde Ihnen noch ein richtiges Probierpaket — kostenlos, ohne Verpflichtung. Soll ich Ihnen nächsten Dienstag eins vorbeibringen?
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 1 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Ein kurzer Gedanke: Jeder erinnert sich, dass Gemüse vor zwanzig, dreißig Jahren anders geschmeckt hat. Unseres schmeckt immer noch so — weil wir in echter Erde anbauen, nicht auf Substrat, und es am selben Morgen geschnitten auf Ihrem Teller landet.
Das Probierpaket-Angebot steht — ein Wort genügt und es ist auf der Dienstags-Route.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 2 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'Proof + Link (5 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Falls Sie neugierig sind, was wir gerade anbauen — hier die vollständige Liste mit Preisen: https://belarro.com/for-chefs
Auf Bestellung angebaut, jeden Dienstag geliefert, gleiche Qualität ob Schnee oder Sonne draußen — kontrollierte Umgebung, immer konsistent.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 3 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat — letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird: wir sind eine Nachricht entfernt — Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705'
WHERE flow = 'reengage' AND stage = 4 AND language = 'de';

-- ─── STEP 4 — Safety net: insert any row that didn't already exist ─────────
-- If the prior migration was never run (fresh DB) or a row was previously
-- deleted, the UPDATE WHERE clauses above are no-ops for missing rows. This
-- INSERT ... ON CONFLICT DO NOTHING guarantees all 18 V2 rows exist even on
-- a DB that never had the old 20 seeded. Safe to run either way.
INSERT INTO belarro_v4_followup_template (flow, stage, language, title, body) VALUES
('new', 1, 'en', 'The Link (2 hours)',
$$Hello [Name],
Thank you for your time today — it was a pleasure meeting you.
Here's our chef page with all varieties and pricing: https://belarro.com/for-chefs
Everything is grown to order, for your kitchen specifically — no minimum, no delivery fees.
Enjoy the rest of your service.
Ron from Belarro$$),
('new', 2, 'en', 'The Taste (2 days)',
$$Hello [Name], Ron from Belarro.
Did the samples make it onto a plate? I'm curious what you noticed — most chefs say it tastes like vegetables used to taste, twenty or thirty years back. That's not nostalgia, that's soil. Ours is grown in real soil, harvested the morning it reaches you.
Tell me what caught your eye and I'll seed it into the next grow cycle for you.
Ron from Belarro$$),
('new', 3, 'en', 'The Model (5 days)',
$$Hello [Name], Ron from Belarro.
Something most kitchens don't have: a private grower. We only grow what a chef asks for — seeded for your kitchen specifically, on a schedule timed to your Tuesday delivery. When your menu changes, we reseed.
Full list: https://belarro.com/for-chefs
Ron from Belarro$$),
('new', 4, 'en', 'The Consistency (14 days)',
$$Hello [Name], Ron from Belarro.
One more thing worth knowing: we grow indoors, controlled environment. Same quality in January as in July — snow or sun doesn't touch it. That's not something an import or an outdoor farm can promise.
The sample offer stands whenever you want to try it.
Ron from Belarro$$),
('new', 5, 'en', 'The Open Door (30 days)',
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right — last message from me.
Whenever garnish becomes a topic, we're one message away: your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$),
('new', 1, 'de', 'The Link (2 Stunden)',
$$Hallo [Name],
vielen Dank für Ihre Zeit heute — es war eine Freude, Sie kennenzulernen.
Hier ist unsere Speisekarte für Köche mit allen Sorten und Preisen: https://belarro.com/for-chefs
Alles wächst auf Bestellung, gezielt für Ihre Küche — keine Mindestbestellung, keine Lieferkosten.
Genießen Sie den Rest Ihres Service.
Ron von Belarro$$),
('new', 2, 'de', 'The Taste (2 Tage)',
$$Hallo [Name], Ron von Belarro.
Haben die Proben es schon auf einen Teller geschafft? Mich interessiert, was Ihnen aufgefallen ist — die meisten Köche sagen, es schmeckt wie Gemüse vor zwanzig, dreißig Jahren. Das ist keine Nostalgie, das ist Erde. Unsere wachsen in echter Erde und werden am Morgen der Lieferung geerntet.
Sagen Sie mir, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.
Ron von Belarro$$),
('new', 3, 'de', 'The Model (5 Tage)',
$$Hallo [Name], Ron von Belarro.
Etwas, das die meisten Küchen nicht haben: einen privaten Anbauer. Wir bauen nur an, was ein Koch bestellt — gezielt für Ihre Küche gesät, im Takt Ihrer Dienstags-Lieferung. Wenn sich Ihre Karte ändert, säen wir neu.
Vollständige Liste: https://belarro.com/for-chefs
Ron von Belarro$$),
('new', 4, 'de', 'The Consistency (14 Tage)',
$$Hallo [Name], Ron von Belarro.
Noch etwas Wissenswertes: Wir bauen drinnen an, in einer kontrollierten Umgebung. Gleiche Qualität im Januar wie im Juli — Schnee oder Sonne ändern nichts daran. Das kann ein Import oder eine Freilandfarm nicht versprechen.
Das Probierangebot steht, wann immer Sie es probieren möchten.
Ron von Belarro$$),
('new', 5, 'de', 'The Open Door (30 Tage)',
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat — letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird: wir sind eine Nachricht entfernt — Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$),
('reengage', 1, 'en', 'Reopener (2 hours)',
$$Hello [Name], Ron from Belarro — the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.
Something most chefs don't have: their own private grower — someone who grows exactly what their kitchen needs, nothing generic. That's what we do.
I still owe you a proper sample kit — free, no strings. Should I bring one by next Tuesday?
Ron from Belarro$$),
('reengage', 2, 'en', 'The Taste (2 days)',
$$Hello [Name], Ron from Belarro.
Quick thought: everyone remembers vegetables tasting different twenty, thirty years ago. Ours still do — because we grow in real soil, not substrate, and it's on your plate the same morning it's cut.
The sample kit offer stands — one word and it's on Tuesday's route.
Ron from Belarro$$),
('reengage', 3, 'en', 'Proof + Link (5 days)',
$$Hello [Name], Ron from Belarro.
If you're curious what we're growing right now — all varieties and pricing: https://belarro.com/for-chefs
Grown to order, delivered every Tuesday, same quality whether it's snowing or sun outside — controlled environment, always consistent.
Ron from Belarro$$),
('reengage', 4, 'en', 'The Open Door (30 days)',
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right — last message from me.
Whenever garnish becomes a topic, we're one message away: your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$),
('reengage', 1, 'de', 'Reopener (2 Stunden)',
$$Hallo [Name], Ron von Belarro — die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.
Etwas, das die meisten Köche nicht haben: einen eigenen privaten Anbauer — jemanden, der genau das anbaut, was ihre Küche braucht, nichts Generisches. Das machen wir.
Ich schulde Ihnen noch ein richtiges Probierpaket — kostenlos, ohne Verpflichtung. Soll ich Ihnen nächsten Dienstag eins vorbeibringen?
Ron von Belarro$$),
('reengage', 2, 'de', 'The Taste (2 Tage)',
$$Hallo [Name], Ron von Belarro.
Ein kurzer Gedanke: Jeder erinnert sich, dass Gemüse vor zwanzig, dreißig Jahren anders geschmeckt hat. Unseres schmeckt immer noch so — weil wir in echter Erde anbauen, nicht auf Substrat, und es am selben Morgen geschnitten auf Ihrem Teller landet.
Das Probierpaket-Angebot steht — ein Wort genügt und es ist auf der Dienstags-Route.
Ron von Belarro$$),
('reengage', 3, 'de', 'Proof + Link (5 Tage)',
$$Hallo [Name], Ron von Belarro.
Falls Sie neugierig sind, was wir gerade anbauen — hier die vollständige Liste mit Preisen: https://belarro.com/for-chefs
Auf Bestellung angebaut, jeden Dienstag geliefert, gleiche Qualität ob Schnee oder Sonne draußen — kontrollierte Umgebung, immer konsistent.
Ron von Belarro$$),
('reengage', 4, 'de', 'The Open Door (30 Tage)',
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat — letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird: wir sind eine Nachricht entfernt — Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$)

ON CONFLICT (flow, stage, language) DO NOTHING;

-- ─── VERIFICATION (run manually after applying) ────────────────────────────
-- SELECT flow, count(*) FROM belarro_v4_followup_template GROUP BY flow;
-- Expect: new = 10, reengage = 8  (18 total)
