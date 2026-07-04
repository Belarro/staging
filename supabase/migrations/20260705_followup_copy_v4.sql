-- Follow-up copy V4: text-only correction on top of V3.
-- Supersedes the copy seeded/updated by 20260704_followup_template_table.sql,
-- 20260705_followup_copy_v2.sql, and 20260705_followup_copy_v3.sql, for
-- re-engage stages 1 and 2 ONLY. Everything else (new-lead flow all 5
-- stages, re-engage stages 3-4, all stage counts/offsets/schedule) is
-- UNCHANGED from V3. See FOLLOWUP_COPY_V4.md for full source text and
-- rationale.
--
-- What changed from V3 (text only, no schema/schedule changes):
--   1. Re-engage stage 1 (EN + DE) was a sample-kit offer ("Would you like
--      a fresh sample kit?" / "Möchten Sie ein frisches Probierpaket?").
--      Too much ask, too soon, for a cold contact. Replaced with a
--      chef-page link + "growing right now" variety-count line, soft CTA
--      to look, no sample offer.
--   2. Re-engage stage 2 (EN + DE) was a repeat sample-kit push ("The
--      sample kit offer stands..."). Replaced with an offer to schedule a
--      visit bringing fresh samples to taste again, plus the chef-page
--      link (Ron confirmed: keep the link on stage 2 and onward, not just
--      stage 1).
--   3. Variety count: new-lead stage 3 and V3's other templates use "over
--      25 varieties" / "über 25 Sorten" as the standing figure. Stage 1's
--      new "growing right now" line reuses that same number (25) for
--      consistency, rather than inventing a different figure.
--   4. No em-dashes (—) or double-hyphens (--), consistent with V3's rule.
--      No "I owe you" / "I still owe you" phrasing. No sample-kit offer
--      language in these two stages (Ron rejected it for stages 1-2).
--
-- Run this in the Supabase SQL Editor. Not executed automatically.
--
-- NOTE on [Link]: same as V2/V3 — FOLLOWUP_COPY_V4.md writes the chef-page
-- URL as a "[Link]" placeholder in the source doc, but the app's
-- placeholder allow-list (frontend/src/app/api/follow-up-templates/route.ts
-- ALLOWED_PLACEHOLDERS, and follow-ups/route.ts assertNoUnknownPlaceholders)
-- only substitutes [Name] — any other bracket token ships to a real chef
-- unfilled. So here [Link] is resolved to the literal
-- https://belarro.com/for-chefs URL, matching every prior migration.
-- Every other word of the doc's copy is kept verbatim.

-- RE-ENGAGE FLOW — EN
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 hours)', body =
$$Hello [Name], Ron from Belarro, the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.
Something most chefs don't have: their own private grower. Someone who grows exactly what their kitchen needs, nothing generic. That's what we do.
Here's what we're growing right now, over 25 varieties, and we keep adding more: https://belarro.com/for-chefs
Take a look when you have a moment.
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v4'
WHERE flow = 'reengage' AND stage = 1 AND language = 'en';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 days)', body =
$$Hello [Name], Ron from Belarro.
Quick thought: everyone remembers vegetables tasting different twenty, thirty years ago. Ours still do, because we grow in real soil, not substrate, and it's on your plate the same morning it's cut.
Would you like to set up a time for me to bring fresh samples so you can taste it again? Full list here too: https://belarro.com/for-chefs
Ron from Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v4'
WHERE flow = 'reengage' AND stage = 2 AND language = 'en';

-- RE-ENGAGE FLOW — DE
UPDATE belarro_v4_followup_template SET title = 'Reopener (2 Stunden)', body =
$$Hallo [Name], Ron von Belarro, die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.
Etwas, das die meisten Köche nicht haben: einen eigenen privaten Anbauer. Jemanden, der genau das anbaut, was ihre Küche braucht, nichts Generisches. Das machen wir.
Hier sehen Sie, was wir gerade anbauen, über 25 Sorten, und es werden laufend mehr: https://belarro.com/for-chefs
Schauen Sie gerne rein, wenn Sie einen Moment Zeit haben.
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v4'
WHERE flow = 'reengage' AND stage = 1 AND language = 'de';

UPDATE belarro_v4_followup_template SET title = 'The Taste (2 Tage)', body =
$$Hallo [Name], Ron von Belarro.
Ein kurzer Gedanke: Jeder erinnert sich, dass Gemüse vor zwanzig, dreißig Jahren anders geschmeckt hat. Unseres schmeckt immer noch so, weil wir in echter Erde anbauen, nicht auf Substrat, und es am selben Morgen geschnitten auf Ihrem Teller landet.
Möchten Sie einen Termin vereinbaren, damit ich Ihnen frische Proben zum erneuten Probieren vorbeibringe? Die vollständige Liste finden Sie auch hier: https://belarro.com/for-chefs
Ron von Belarro$$,
updated_at = now(), updated_by = 'migration_20260705_v4'
WHERE flow = 'reengage' AND stage = 2 AND language = 'de';

-- ─── VERIFICATION (run manually after applying) ────────────────────────────
-- SELECT flow, count(*) FROM belarro_v4_followup_template GROUP BY flow;
-- Expect: new = 10, reengage = 8  (18 total, unchanged from V2/V3)
--
-- SELECT flow, stage, language, title, body FROM belarro_v4_followup_template
-- WHERE body LIKE '%—%' OR body LIKE '%--%' OR title LIKE '%—%' OR title LIKE '%--%';
-- Expect: 0 rows (no em-dashes or double-hyphens left in any template).
--
-- SELECT flow, stage, language, title, body FROM belarro_v4_followup_template
-- WHERE flow = 'reengage' AND stage IN (1,2);
-- Confirm the 4 rows above reflect the V4 text (no "sample kit" offer
-- language, chef-page link present in both).
