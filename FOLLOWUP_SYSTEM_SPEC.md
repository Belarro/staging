# Follow-Up System — Fix + Upgrade Spec
**For: Builder agent. Owner sign-off: Ron. July 2026.**

Source of truth for message copy from now on: this spec + the DB-backed template table it creates (Part 3). `SPRINT_1_BUILD.md` and `UNIFIED_SCHEMA.md` are stale on this topic — do not follow their day-schedule; follow this doc.

---

## PART 1 — Lock the timing schedule (bug fix, no new feature)

**Canonical schedule, confirmed by Ron, applies everywhere:**

| Stage | New-lead flow | Re-engage flow |
|---|---|---|
| 1 | 2 hours after visit | 2 hours after visit (same as new — re-engage is NOT "day 0 = right now, no urgency") |
| 2 | Day 2 | Day 2 |
| 3 | Day 5 | Day 5 |
| 4 | Day 14 | Day 14 |
| 5 | Day 30 | Day 30 |

Both flows are now 5 stages on the identical 0(2h)/2/5/14/30 cadence. The current re-engage flow's 4-stage schedule (0/5/14/30, skipping day 2) is replaced — see Part 2.

**Current state:** `frontend/src/app/api/follow-ups/route.ts` POST handler (lines 259-270) already implements 0(2h)/2/5/14/30 correctly for the **new-lead** flow. Leave that array untouched.

**Fix required:**
1. In the same POST handler, replace the `old` stages array (lines 259-263, currently 4 stages at 0/5/14/30) with 5 stages at the same offsets as the new-lead array: `2h, 2d, 5d, 14d, 30d`.
2. `supabase/migrations/20260622_leads_followup_system.sql` — find the DB trigger's interval list and confirm/update it to `2 hours, 2 days, 5 days, 14 days, 30 days` (5 rows, not a different set).
3. `frontend/src/app/api/locations/seed-followups/route.ts` — `OLD_LEAD_DAYS` constant currently `60` here vs `30` in `route.ts`. Set both to `30` (visits older than 30 days get the re-engage flow, everything more recent gets new-lead flow). One constant, one value, everywhere.
4. `SPRINT_1_BUILD.md` and `UNIFIED_SCHEMA.md` — update the written schedule references from 0/3/7/14/30 to 0(2h)/2/5/14/30 so docs stop contradicting shipped code.

**Verification:** create a test lead, confirm 5 `belarro_v4_follow_up` rows are created with `due_date` at now+2h, now+2d, now+5d, now+14d, now+30d. Repeat for a lead backdated 45 days (re-engage path) — same 5 offsets, just measured from now (send time), not from the old visit date.

---

## PART 2 — Fix `[Restaurant]` bug + replace weak re-engage copy

**Bug:** `REENGAGE_EN[1]` / `REENGAGE_DE[1]` templates in `route.ts` (lines 62, 81) contain a literal `[Restaurant]` placeholder that `buildMessage()` never substitutes (only `[Name]` is replaced, line 105/108). Any re-engage send today ships the literal text "[Restaurant]" to a real chef.

**Fix:** replace the entire `REENGAGE_EN` and `REENGAGE_DE` objects with the copy below. This also fixes the structural weakness Ron flagged: 2 of the 4 old re-engage stages just repeated new-lead copy verbatim, and stage 1 offered two competing CTAs ("price list OR samples") instead of one. New copy is purpose-built for cold contacts, one CTA per message, and stage 4 correctly reuses `NEW_EN[5]`/`NEW_DE[5]` ("The Open Door") since that closing message works for either flow.

```
const REENGAGE_EN: Record<number, { title: string; template: string }> = {
  1: {
    title: 'Re-Engage (2 hours)',
    template: `Hello [Name],\n\nRon from Belarro — the microgreens farm in Prenzlauer Berg. I visited your kitchen a while back.\n\nA lot has grown since: 25+ varieties, fixed Tuesday deliveries to Berlin kitchens, 10-day shelf life.\n\nI still owe you a proper sample kit — free, no strings. Should I bring one by next Tuesday?\n\nRon from Belarro`,
  },
  2: {
    title: 'The Fact (2 days)',
    template: `Hello [Name],\n\nRon from Belarro. A number most chefs don't know: imported microgreens arrive 3-4 days old with 5-6 days of shelf life left. Ours are harvested the morning of delivery and last up to 10 days.\n\nThe sample kit offer stands — one word and it's on Tuesday's route.\n\nRon from Belarro`,
  },
  3: {
    title: 'Proof + Link (5 days)',
    template: `Hello [Name],\n\nRon from Belarro. If you're curious what we're growing right now, here's the full list with pricing:\n\n${CHEF_PAGE}\n\nTuesday is delivery day. A sample kit costs you nothing but five minutes of curiosity.\n\nRon from Belarro`,
  },
  4: {
    title: 'The Easy Yes (2 weeks)',
    template: NEW_EN[4].template,
  },
  5: {
    title: 'The Open Door (1 month)',
    template: NEW_EN[5].template,
  },
};

const REENGAGE_DE: Record<number, { title: string; template: string }> = {
  1: {
    title: 'Re-Engage (2 Stunden)',
    template: `Hallo [Name],\n\nRon von Belarro - die Microgreens-Farm in Prenzlauer Berg. Ich war vor einer Weile bei Ihnen in der Küche.\n\nSeitdem hat sich viel getan: 25+ Sorten, feste Dienstags-Lieferung an Berliner Küchen, 10 Tage Haltbarkeit.\n\nIch schulde Ihnen noch ein richtiges Probierpaket - kostenlos, ohne Verpflichtung. Soll ich Ihnen nächsten Dienstag eins vorbeibringen?\n\nRon von Belarro`,
  },
  2: {
    title: 'The Fact (2 Tage)',
    template: `Hallo [Name],\n\nRon von Belarro. Ein Fakt, den viele Köche nicht kennen: importierte Microgreens sind bei Ankunft 3-4 Tage alt und haben noch 5-6 Tage Haltbarkeit. Unsere werden am Liefermorgen geerntet und halten bis zu 10 Tage.\n\nDas Probierpaket-Angebot steht - ein Wort genügt und es ist auf der Dienstags-Route.\n\nRon von Belarro`,
  },
  3: {
    title: 'Proof + Link (5 Tage)',
    template: `Hallo [Name],\n\nRon von Belarro. Falls Sie neugierig sind, was wir gerade anbauen - hier ist die vollständige Liste mit Preisen:\n\n${CHEF_PAGE}\n\nDienstag ist Liefertag. Ein Probierpaket kostet Sie nichts außer fünf Minuten Neugier.\n\nRon von Belarro`,
  },
  4: {
    title: 'The Easy Yes (2 Wochen)',
    template: NEW_DE[4].template,
  },
  5: {
    title: 'The Open Door (1 Monat)',
    template: NEW_DE[5].template,
  },
};
```

**Note:** re-engage now has 5 stages (was 4) to match Part 1's schedule. Update every place that hardcodes `total_stages: flow === 'reengage' ? 4 : 5` (GET handler, lines 174 and 214) to `5` unconditionally, since both flows are now 5 stages.

---

## PART 3 — Make templates database-backed and editable in admin (source of truth)

**Goal (Ron's request):** one screen in admin where the actual message copy lives, is editable without a code deploy, and is unambiguously "what's really being sent" — replacing the hardcoded `NEW_EN`/`NEW_DE`/`REENGAGE_EN`/`REENGAGE_DE` objects in `route.ts` as the source of truth.

### 3.1 — New table

```sql
CREATE TABLE belarro_v4_followup_template (
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
```

Seed it with the 20 templates (5 stages x 2 flows x 2 languages) from Part 1 + Part 2 above — this migration IS the one-time transfer of the hardcoded copy into the DB.

### 3.2 — Placeholder validation (prevents the `[Restaurant]` bug class from recurring)

On save (admin PUT) and on read (GET for sending), validate that the only bracket placeholders present are from an allow-list: `[Name]`. If a template contains any other `[Bracketed]` token, reject the save with a clear error ("Unknown placeholder [X] — only [Name] is supported") rather than allowing it to ship unfilled. If a future placeholder like restaurant name is wanted, it must be added to both the allow-list AND `buildMessage()`'s substitution logic in the same change — never one without the other.

### 3.3 — `route.ts` reads from DB, not hardcoded objects

Replace `NEW_EN`/`NEW_DE`/`REENGAGE_EN`/`REENGAGE_DE` constants with a query to `belarro_v4_followup_template` filtered by `flow`/`stage`/`language`. Cache in-memory per request if needed for performance; no need for heavier caching at current volume (~150 msgs/week).

### 3.4 — Admin screen: Template Editor tab

New tab in `frontend/src/app/admin/follow-ups/page.tsx` (or a new route `/admin/follow-ups/templates`):
- List all 20 templates grouped by flow (New Lead / Re-Engage) then stage, each showing language toggle (EN/DE).
- Each template: title (editable text), body (editable textarea, monospace, showing `\n` as real line breaks), a live preview with `[Name]` replaced by a sample name ("Maria").
- Save button per template, validates against 3.2, shows success/error inline.
- Show `updated_at` / `updated_by` so Ron can see if something changed recently.

### 3.5 — Admin screen: Today's Queue tab (the daily-send routine)

This is the answer to "WhatsApp isn't automatic and I'm on zero budget" — no per-message cost, but turns the daily job into one screen instead of hunting through a list.

- Query: all `belarro_v4_follow_up` rows where `due_date <= now()` AND `status = 'pending'`, joined to location, sorted by `due_date` ascending.
- One row per due message: restaurant name, contact name, stage title (e.g. "The Taste (2 days)"), channel icon (WhatsApp or Email based on `isLandline()`), a "Send WhatsApp" button (opens `wa.me` link exactly as today) or "Send Email" button (existing Gmail API flow, unchanged).
- After click, existing "did you send it?" confirm-modal marks the row done — keep this exactly as-is, it already works.
- Sort/group by urgency: overdue (red) at top, due today (normal) below.
- This becomes Ron's literal daily routine: open this tab each morning, click down the list top to bottom, done.

**Do not build:** any paid WhatsApp Business API integration, any SMS channel, any auto-send-without-a-click. Explicitly out of scope per zero budget — noted here so no agent adds it unprompted later.

---

## ACCEPTANCE CHECKLIST

- [ ] New-lead flow: 5 stages at 2h/2d/5d/14d/30d (already correct — verify only)
- [ ] Re-engage flow: 5 stages at 2h/2d/5d/14d/30d (was 4 stages at 0/5/14/30 — fixed)
- [ ] `OLD_LEAD_DAYS` = 30 consistently in `route.ts` and `seed-followups/route.ts`
- [ ] DB trigger migration intervals match 2h/2d/5d/14d/30d
- [ ] `[Restaurant]` placeholder removed from all templates (no unsubstituted brackets ship, ever)
- [ ] `total_stages` hardcoded `4`/`5` split removed — both flows report 5
- [ ] `SPRINT_1_BUILD.md` / `UNIFIED_SCHEMA.md` schedule text corrected to match shipped code
- [ ] `belarro_v4_followup_template` table created and seeded with all 20 templates
- [ ] `route.ts` reads templates from DB, hardcoded objects removed
- [ ] Admin Template Editor tab: view/edit all 20 templates, placeholder validation on save
- [ ] Admin Today's Queue tab: due messages listed, one-click WhatsApp/Email send, overdue highlighted
- [ ] End-to-end test: create a lead, confirm correct 5 due_dates; edit a template in admin, confirm the queue reflects the new text; click send, confirm existing confirm-modal + status update still works
