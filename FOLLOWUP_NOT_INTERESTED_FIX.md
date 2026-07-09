# Fix: "Not Interested" doesn't stop follow-ups
**July 10, 2026. Bug found by Ron: marked Bamnat (Korean restaurant) as not interested during a visit, follow-ups kept showing it as due.**

## Root cause (confirmed by reading the code)

Two different fields exist on a `locations` row:
- `interest_level` — display-only label (`high`/`medium`/`low`/`Closed Deal`). Shown as a colored badge in admin. **Never checked by any follow-up stop logic.**
- `pipeline_stage` — the field `STOPPED_STAGES` actually checks (`active`, `snoozed`, `closed_won`, `closed_lost`, `converted`) to decide whether to keep generating/showing follow-ups.

When a visit is logged as "not interested" (in the separate mobile visit-logging app, not this admin repo), it writes something to `interest_level` or a similar field, but nothing sets `pipeline_stage` to a stop-value. Result: the follow-up sequence keeps running for a lead the owner already talked to and got a no from.

## What Ron wants (confirmed, not a guess)

NOT a permanent "closed lost, never touch again." He wants:
- Follow-up sequence pauses (no more auto messages)
- Lead stays visible in a "Not Interested" bucket in the admin (separate from active leads)
- He can manually re-approach later (e.g. next season) — this is what the existing Seasonal List concept in the sales playbook already covers, just needs the lead to be reachable from that bucket

## Fix

1. Add a new `pipeline_stage` value: `not_interested` (distinct from `closed_lost`, which implies a harder/final no — e.g. explicitly asked to never be contacted again). Add `not_interested` to `STOPPED_STAGES` in both `frontend/src/app/api/follow-ups/route.ts` and `frontend/src/app/api/follow-ups/today/route.ts` (both currently define their own copy of this set — keep them in sync, or better, factor into one shared constant if low-risk to do so).

2. Find where the mobile visit-logging app syncs a visit outcome into this backend (likely `frontend/src/app/api/sync-prospect/route.ts`, given it already writes `interest_level` from a payload field `payload.interestLevel`). Check whether that same payload/endpoint has a place to also send a "not interested" flag, and if so, map it to write `pipeline_stage: 'not_interested'` on the location, not just `interest_level`. If the mobile app doesn't currently send enough information to distinguish "not interested" from other outcomes, flag this back to Ron — it may need a small change on the mobile app side too (separate codebase, out of scope for this repo, just needs to be surfaced).

3. Admin UI (`frontend/src/app/admin/follow-ups/page.tsx`): all visits already live under the existing **Visits** tab (confirmed — it lists every location with `pipeline_stage` and `interest_level` shown, sourced from `/api/visits`). This is the correct single place for "every visit, including not interested" — do not create a separate page. Just add a filter/segment control on the Visits tab: "All / Not Interested / Active / etc." driven by `pipeline_stage`, so Ron can instantly see everyone marked not_interested in one place. Each row in that filtered view gets a "Re-approach" button that clears `pipeline_stage` back to null/prospect and re-seeds follow-ups, for when Ron wants to try again later (ties into the Seasonal List concept from the sales playbook).

4. Retroactive fix for Bamnat specifically: once the field mapping is sorted, Ron (or Builder via a one-off script/manual DB update) sets Bamnat's `pipeline_stage` to `not_interested` directly so it stops showing today, without waiting for the mobile app to be updated.

## Part 2 — Add "Total Places Visited" to the dashboard

Ron wants a count on the main dashboard of how many places have been visited total.

**Data source:** the `locations` table already holds every visit (confirmed — this is the same table backing the Visits tab). "Visited" = any row with a non-null `timestamp` (the visit date field used everywhere else in this codebase, e.g. `visits/route.ts` line 23, `today/route.ts`).

**Backend (`frontend/src/app/api/dashboard/route.ts`):**
1. Fetch `locations` count where `timestamp` is not null (and `archived != 'YES'`, consistent with how other queries in this file already exclude archived rows) — a lightweight count query, not a full row fetch, e.g. `select=id&timestamp=not.is.null&archived=neq.YES` with a count-only request if the Supabase REST helper supports `Prefer: count=exact`, otherwise fetch ids and take `.length`.
2. Add `total_visits: <count>` to the existing `overview` object in the JSON response (alongside `total_crops`, `active_customers`, etc. — same object, not a new top-level section).
3. Optional but useful given Part 1: also break it down by `pipeline_stage` if cheap to compute from the same query (e.g. `not_interested_count`) — nice-to-have, skip if it adds real complexity.

**Frontend (`frontend/src/app/admin/page.tsx`):**
1. Add `total_visits: number` to the `DashboardData.overview` TypeScript interface.
2. Add a stat tile/card for it in the dashboard's overview section, near the existing customer/order counts — match the existing visual style of that section exactly (same card component/classes used for `active_customers` etc., don't introduce a new card style). Label: "Places Visited" or "Total Visits."

## Not in scope here

The mobile visit-logging app itself is a separate codebase — this fix only covers the belarro-v4 admin/backend side (stop logic + admin UI). If the sync payload genuinely has no way to carry a "not interested" signal today, that's a finding to report back, not something to silently work around.
