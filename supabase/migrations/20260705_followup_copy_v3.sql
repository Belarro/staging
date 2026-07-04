-- Follow-up copy V3: text-only correction on top of V2.
-- Supersedes the copy seeded/updated by 20260704_followup_template_table.sql
-- and 20260705_followup_copy_v2.sql. Stage counts and offsets are UNCHANGED
-- from V2 (new-lead: 5 stages at 2h/2d/5d/14d/30d; re-engage: 4 stages at
-- 2h/2d/5d/30d). See FOLLOWUP_COPY_V3.md for full source text and rationale.
--
-- What changed from V2 (text only, no schema/schedule changes):
--   1. No em-dashes (—) or punctuation double-hyphens (--) anywhere in any
--      of the 18 chef-facing templates (both languages). Replaced with
--      commas/periods, or the sentence restructured.
--   2. Re-engage stage 1 (EN + DE) had "I still owe you a proper sample kit"
--      / "Ich schulde Ihnen noch ein richtiges Probierpaket" — wrong, because
--      Ron already gives samples in person at every visit, nothing is owed.
--      Reworded to offer a *fresh* kit instead ("Would you like a fresh
--      sample kit?" / "Möchten Sie ein frisches Probierpaket?").
--
-- Run this in the Supabase SQL Editor. Not executed automatically.
--
-- NOTE on [Link]: same as V2 — FOLLOWUP_COPY_V3.md writes the chef-page URL
-- as a "[Link]" placeholder in the source doc, but the app's placeholder
-- allow-list (frontend/src/app/api/follow-up-templates/route.ts
-- ALLOWED_PLACEHOLDERS, and follow-ups/route.ts assertNoUnknownPlaceholders)
-- only substitutes [Name] — any other bracket token ships to a real chef
-- unfilled. So here [Link] is resolved to the literal
-- https://belarro.com/for-chefs URL, matching every prior migration.
-- Every other word of the doc's copy is kept verbatim.

-- NEW LEAD FLOW — EN
UPDATE belarro_v4_followup_template SET title = 'The Link (2 hours)', body =
$$Hello [Name],
Thank you for your time today. It was a pleasure meeting you.
Here's our chef page with all varieties and pricing: https://belarro.com/for-chefs
Everything is grown to order, for your kitchen specifically. No minimum, no delivery fees.
Enjoy the rest of your service.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 1 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 days)', body =
$$Hello [Name], Ron from Belarro.
Did the samples make it onto a plate? I'm curious what you noticed. Most chefs say it tastes like vegetables used to taste, twenty or thirty years back. That's not nostalgia, that's soil. Ours is grown in real soil, harvested the morning it reaches you.
Tell me what caught your eye and I'll seed it into the next grow cycle for you.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 2 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Model (5 days)', body =
$$Hello [Name], Ron from Belarro.
Something most kitchens don't have: a private grower. We only grow what a chef asks for, seeded for your kitchen specifically, on a schedule timed to your Tuesday delivery. When your menu changes, we reseed.
Full list: https://belarro.com/for-chefs
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 3 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Consistency (14 days)', body =
$$Hello [Name], Ron from Belarro.
One more thing worth knowing: we grow indoors, in a controlled environment. Same quality in January as in July. Snow or sun doesn't touch it. That's not something an import or an outdoor farm can promise.
The sample offer stands whenever you want to try it.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 4 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 days)', body =
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right. Last message from me.
Whenever garnish becomes a topic, we're one message away. Your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 5 AND language = 'en';

-- NEW LEAD FLOW — DE
UPDATE belarro_v4_followup_template SET title = 'The Link (2 Stunden)', body =
$$Hallo [Name],
vielen Dank für Ihre Zeit heute. Es war eine Freude, Sie kennenzulernen.
Hier ist unsere Speisekarte für Köche mit allen Sorten und Preisen: https://belarro.com/for-chefs
Alles wächst auf Bestellung, gezielt für Ihre Küche. Keine Mindestbestellung, keine Lieferkosten.
Genießen Sie den Rest Ihres Service.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 1 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Haben die Proben es schon auf einen Teller geschafft? Mich interessiert, was Ihnen aufgefallen ist. Die meisten Köche sagen, es schmeckt wie Gemüse vor zwanzig, dreißig Jahren. Das ist keine Nostalgie, das ist Erde. Unsere wachsen in echter Erde und werden am Morgen der Lieferung geerntet.
Sagen Sie mir, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 2 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Model (5 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Etwas, das die meisten Küchen nicht haben: einen privaten Anbauer. Wir bauen nur an, was ein Koch bestellt, gezielt für Ihre Küche gesät, im Takt Ihrer Dienstags-Lieferung. Wenn sich Ihre Karte ändert, säen wir neu.
Vollständige Liste: https://belarro.com/for-chefs
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 3 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Consistency (14 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Noch etwas Wissenswertes: Wir bauen drinnen an, in einer kontrollierten Umgebung. Gleiche Qualität im Januar wie im Juli. Schnee oder Sonne ändern nichts daran. Das kann ein Import oder eine Freilandfarm nicht versprechen.
Das Probierangebot steht, wann immer Sie es probieren möchten.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 4 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat. Letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird, wir sind eine Nachricht entfernt. Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'new' AND stage = 5 AND language = 'de';

-- RE-ENGAGE FLOW — EN (4 stages: 2h/2d/5d/30d)
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 hours)', body =
$$Hello [Name], Ron from Belarro, the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.
Something most chefs don't have: their own private grower. Someone who grows exactly what their kitchen needs, nothing generic. That's what we do.
Would you like a fresh sample kit? Free, no strings. I can bring one by next Tuesday.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 1 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 days)', body =
$$Hello [Name], Ron from Belarro.
Quick thought: everyone remembers vegetables tasting different twenty, thirty years ago. Ours still do, because we grow in real soil, not substrate, and it's on your plate the same morning it's cut.
The sample kit offer stands. One word and it's on Tuesday's route.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 2 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'Proof + Link (5 days)', body =
$$Hello [Name], Ron from Belarro.
If you're curious what we're growing right now, all varieties and pricing: https://belarro.com/for-chefs
Grown to order, delivered every Tuesday, same quality whether it's snowing or sunny outside. Controlled environment, always consistent.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 3 AND language = 'en';

-- Re-engage stage 4 (30 days) = identical text to new-lead stage 5 ("The
-- Open Door"). Kept as a separate row (not a shared FK) because the schema's
-- UNIQUE(flow, stage, language) key is per-flow — if either is edited later,
-- update both rows to keep them in sync (same note as V2 migration).
UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 days)', body =
$$Hello [Name], Ron from Belarro.
No worries if the timing wasn't right. Last message from me.
Whenever garnish becomes a topic, we're one message away. Your own private grower, 8 km from your kitchen, harvested the morning we deliver.
Varieties and pricing are always here: https://belarro.com/for-chefs
Wishing you a great season.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 4 AND language = 'en';

-- RE-ENGAGE FLOW — DE (4 stages: 2h/2d/5d/30d)
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 Stunden)', body =
$$Hallo [Name], Ron von Belarro, die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.
Etwas, das die meisten Köche nicht haben: einen eigenen privaten Anbauer. Jemanden, der genau das anbaut, was ihre Küche braucht, nichts Generisches. Das machen wir.
Möchten Sie ein frisches Probierpaket? Kostenlos, ohne Verpflichtung. Ich kann Ihnen nächsten Dienstag eins vorbeibringen.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 1 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Ein kurzer Gedanke: Jeder erinnert sich, dass Gemüse vor zwanzig, dreißig Jahren anders geschmeckt hat. Unseres schmeckt immer noch so, weil wir in echter Erde anbauen, nicht auf Substrat, und es am selben Morgen geschnitten auf Ihrem Teller landet.
Das Probierpaket-Angebot steht. Ein Wort genügt und es ist auf der Dienstags-Route.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 2 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'Proof + Link (5 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Falls Sie neugierig sind, was wir gerade anbauen, hier die vollständige Liste mit Preisen: https://belarro.com/for-chefs
Auf Bestellung angebaut, jeden Dienstag geliefert, gleiche Qualität ob Schnee oder Sonne draußen. Kontrollierte Umgebung, immer konsistent.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 3 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Open Door (30 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Kein Problem, wenn der Zeitpunkt nicht gepasst hat. Letzte Nachricht von mir.
Wann immer Garnitur zum Thema wird, wir sind eine Nachricht entfernt. Ihr eigener privater Anbauer, 8 km von Ihrer Küche entfernt, am Morgen der Lieferung geerntet.
Sorten und Preise finden Sie immer hier: https://belarro.com/for-chefs
Wir wünschen Ihnen eine großartige Saison.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v3'
WHERE flow = 'reengage' AND stage = 4 AND language = 'de';

-- ─── VERIFICATION (run manually after applying) ────────────────────────────
-- SELECT flow, count(*) FROM belarro_v4_followup_template GROUP BY flow;
-- Expect: new = 10, reengage = 8  (18 total, unchanged from V2)
--
-- SELECT flow, stage, language, title, body FROM belarro_v4_followup_template
-- WHERE body LIKE '%—%' OR body LIKE '%--%' OR title LIKE '%—%' OR title LIKE '%--%';
-- Expect: 0 rows (no em-dashes or double-hyphens left in any template).
