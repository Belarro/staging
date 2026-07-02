# Rollback Plan: Unified Customer Database

**Effective Period:** July 2 — August 2, 2026 (30 days)  
**Decision Point:** August 2, 2026 (archive `locations` table)

## Quick Rollback (< 5 minutes)

If production has critical issues in first 24 hours:

```bash
# 1. Revert code
git checkout production-before-unified
git push origin main --force

# 2. Vercel auto-deploys
# (Check deployment status: https://vercel.com/belarro)

# 3. Clear browser cache and test
# - Customers page should revert to old dual-source view
# - SalesTracker sync temporarily disabled
```

## Full Rollback (< 30 minutes)

If data corruption or sync issues:

```sql
-- Step 1: Stop all writes to new system
-- (Deploy code that reverts /api/sync-prospect)

-- Step 2: Mark all new customers as archived (created after July 2, 2026)
UPDATE belarro_v4_customer 
SET deleted_at = NOW()
WHERE created_at > '2026-07-02T00:00:00Z' AND source = 'saletracker';

-- Step 3: Verify locations table still has original data
SELECT COUNT(*) FROM locations WHERE archived != 'YES';
-- Should show ~75 records

-- Step 4: Restore old admin view (from git history)
-- Point customers endpoint back to: locations + belarro_v4_customer (old logic)

-- Step 5: Notify users
-- "System temporarily reverted. SalesTracker sync disabled until July X."
```

## Data Recovery (30-day window)

**All data is recoverable because:**

1. **`locations` table is READ-ONLY** — original 75 SalesTracker locations untouched
2. **`belarro_v4_customer` has full audit trail** — `created_at`, `updated_at`, `source` fields
3. **`belarro_v4_follow_up` references both** — `location_id` and `customer_id` columns preserved
4. **Soft deletes only** — no hard deletes, `deleted_at` column for recovery

**To restore a customer:**
```sql
-- Find customer by name
SELECT id, created_at, source FROM belarro_v4_customer 
WHERE name ILIKE '%Restaurant Name%';

-- If wrongly deleted, restore:
UPDATE belarro_v4_customer 
SET deleted_at = NULL 
WHERE id = 'customer-uuid';
```

## Timeline for Final Decision

| Date | Action | Owner |
|------|--------|-------|
| July 2 | Deploy to production | Claude |
| July 2-9 | Monitor 24/7 for bugs | Ron |
| July 10 | Go/no-go decision | Ron |
| July 10-Aug 2 | If "GO": continue monitoring | Ron |
| July 10-Aug 2 | If "NO-GO": execute rollback | Claude |
| August 2 | Final decision: keep or revert? | Ron |
| August 2 | If KEEP: archive `locations` table | Claude |
| August 2 | If REVERT: restore from backup | Claude |

## What Cannot Be Rolled Back

- **SalesTracker app updates** — users will have updated code pointing to new endpoints
  - Solution: Push SalesTracker revert to all devices (takes 24-48 hours for iOS/Android)
- **Customer relationship data created during rollback window** — if Ron adds new customers, they will be in unified system
  - Solution: Export + manually migrate to old system if needed

## Contact & Escalation

**If issues detected:**
1. Document the issue (error message, reproduction steps)
2. Contact: Josh (josh@duchess.capital)
3. Decision: Continue monitoring or rollback immediately

**Rollback is reversible up to August 2.**

After August 2, the `locations` table is archived and rollback becomes manual/complex.

---

**Backup Location:**  
All migrations and rollback SQL stored in: `supabase/migrations/`  
Restore scripts: `supabase/rollback-scripts/`  
Last tested: July 2, 2026
