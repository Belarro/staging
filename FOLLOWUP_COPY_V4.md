# Follow-Up Copy V4 — Re-Engage Stage 1 & 2 Restructure
**July 5, 2026. Confirmed with Ron. Supersedes V3 for re-engage stages 1-2 only. Everything else (new-lead flow, re-engage stages 3-4, stage counts, offsets) unchanged from V3.**

## What changed

**Re-engage Stage 1** — was a sample-kit offer. Wrong: too much ask, too soon, for a cold contact. New version: chef-page link + growing/variety-count line, soft CTA to look, no sample offer.

**Re-engage Stage 2** — was a repeat sample-kit push. New version: asks if they'd like to schedule a visit for fresh samples to taste again. Keep the chef-page link here too (Ron confirmed: keep the link on stage 2 and onward, not just stage 1).

Stage 3 and Stage 4 (Proof+Link, Open Door) are unchanged from V3.

---

## RE-ENGAGE FLOW — Stage 1 — 2 hours — "Reopener" (revised)

**EN:**
> Hello [Name], Ron from Belarro, the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.
> Something most chefs don't have: their own private grower. Someone who grows exactly what their kitchen needs, nothing generic. That's what we do.
> Here's what we're growing right now, and we keep adding more varieties: [Link]
> Take a look when you have a moment.
> Ron from Belarro

**DE:**
> Hallo [Name], Ron von Belarro, die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.
> Etwas, das die meisten Köche nicht haben: einen eigenen privaten Anbauer. Jemanden, der genau das anbaut, was ihre Küche braucht, nichts Generisches. Das machen wir.
> Hier sehen Sie, was wir gerade anbauen, und es werden laufend mehr Sorten: [Link]
> Schauen Sie gerne rein, wenn Sie einen Moment Zeit haben.
> Ron von Belarro

*(Note for Builder: the variety count in the doc's placeholder text, e.g. "25+ varieties," is intentionally not hardcoded as a number here since it changes over time. Follow whatever pattern the existing templates use for the variety count, likely a static number that gets manually updated occasionally, consistent with how other stages reference "25+ varieties" today. If the current DB text elsewhere says a specific number, use that same number here for consistency.)*

## RE-ENGAGE FLOW — Stage 2 — 2 days — "The Taste" (revised)

**EN:**
> Hello [Name], Ron from Belarro.
> Quick thought: everyone remembers vegetables tasting different twenty, thirty years ago. Ours still do, because we grow in real soil, not substrate, and it's on your plate the same morning it's cut.
> Would you like to set up a time for me to bring fresh samples so you can taste it again? Full list here too: [Link]
> Ron from Belarro

**DE:**
> Hallo [Name], Ron von Belarro.
> Ein kurzer Gedanke: Jeder erinnert sich, dass Gemüse vor zwanzig, dreißig Jahren anders geschmeckt hat. Unseres schmeckt immer noch so, weil wir in echter Erde anbauen, nicht auf Substrat, und es am selben Morgen geschnitten auf Ihrem Teller landet.
> Möchten Sie einen Termin vereinbaren, damit ich Ihnen frische Proben zum erneuten Probieren vorbeibringe? Die vollständige Liste finden Sie auch hier: [Link]
> Ron von Belarro

---

## Implementation notes for Builder

1. Only re-engage stages 1 and 2 change (both languages). Re-engage stages 3-4 and the entire new-lead flow (stages 1-5) stay exactly as in V3 — do not touch those rows.
2. Write a new migration `20260705_followup_copy_v4.sql` with UPDATE statements for exactly 4 rows: flow='reengage', stage=1, language='en'; flow='reengage', stage=1, language='de'; flow='reengage', stage=2, language='en'; flow='reengage', stage=2, language='de'. Same pattern as V3's migration. Do not execute, owner runs manually.
3. `[Link]` still resolves to `https://belarro.com/for-chefs`, same as before.
4. Check what variety-count number is currently used elsewhere in the templates (e.g. new-lead stage 3 says "over 25 varieties") and use the same number in stage 1's "growing right now" line for consistency, rather than inventing a different number.
5. No em-dashes, no double-hyphens, no "I owe you" phrasing, consistent with V3's rules.
