# Unified Customer Database Schema

**Date:** July 2, 2026  
**Status:** Production Ready  
**Last Updated:** July 2, 2026

## Overview

The `belarro_v4_customer` table is now the single source of truth for all customer data across both systems:
- **SalesTracker** (mobile app, street visits) → `/api/sync-prospect`
- **Belarro Admin** (web app, business cards) → `/admin/customers` form

No separate `locations` table is used for active customer management. The `locations` table is archived read-only for 30 days as a rollback safety measure.

## Table: `belarro_v4_customer`

### Core Identity Fields
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | TEXT (UUID) | Both | Primary key, auto-generated |
| `name` | TEXT | Both | Customer/location name |
| `restaurant_name` | TEXT | Both | Preferred display name for restaurants |
| `contact_person` | TEXT | Both | Person to contact |
| `contact_title` | TEXT | Both | Job title (optional) |
| `created_at` | TIMESTAMP | Both | Record creation date |
| `updated_at` | TIMESTAMP | Both | Last modification date (optimistic locking) |

### Contact Information
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `phone` | TEXT | Both | Primary phone (direct line preferred) |
| `whatsapp` | TEXT | Belarro | WhatsApp number if available |
| `email` | TEXT | Both | Primary email |
| `business_phone` | TEXT | SalesTracker | Secondary business phone |
| `business_email` | TEXT | SalesTracker | Secondary business email |
| `business_website` | TEXT | SalesTracker | Company website |

### Location & Classification
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `address` | TEXT | Belarro | Street address |
| `city` | TEXT | Belarro | City (Berlin, etc.) |
| `business_types` | TEXT | SalesTracker | Category: "restaurant", "cafe", "hotel", etc. |
| `language` | TEXT | SalesTracker | Language preference (DE, EN) |

### Sales & Operations
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `status` | TEXT | Both | Enum: `prospect`, `active`, `paused`, `inactive` |
| `interest_level` | TEXT | Both | Sales interest: `high`, `medium`, `low`, `not interested` |
| `sales_rep` | TEXT | SalesTracker | Sales representative name |
| `visit_notes` | TEXT | Both | Notes from visits |
| `pause_reason` | TEXT | Belarro | Reason for pause status |
| `notes_internal` | TEXT | SalesTracker | Internal-only notes |

### Product & Logistics
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `net_days` | INTEGER | Belarro | Payment terms (e.g., 30 days) |
| `tax_number` | TEXT | Belarro | German tax ID (Steuernummer) |
| `uses_microgreens` | BOOLEAN | SalesTracker | Product interest flag |

### System Fields
| Field | Type | Purpose |
|-------|------|---------|
| `st_location_id` | TEXT | Reference to original SalesTracker location ID (for audit/rollback) |
| `source` | TEXT | Origin: `saletracker` or `belarro_admin` |
| `last_synced_at` | TIMESTAMP | Last sync from SalesTracker |
| `deleted_at` | TIMESTAMP | Soft delete timestamp (NULL = active) |

## Deduplication Logic

When adding a customer via `/api/sync-prospect` or web form:

1. **Check phone match** — if `phone` exists, UPDATE existing customer
2. **Check email match** — if `email` exists, UPDATE existing customer  
3. **Check business_email match** — if `business_email` exists, UPDATE existing customer
4. **Otherwise** — INSERT new customer

Result: **No duplicate customers possible** for same phone/email.

## Follow-ups: `belarro_v4_follow_up`

When a NEW customer is created, 5 follow-up records are auto-created. Both the
new-lead flow and the re-engage flow share the identical cadence — see
`FOLLOWUP_SYSTEM_SPEC.md` (source of truth for message copy and schedule):

| Stage | Offset | Purpose |
|-------|------|---------|
| 1 | 2 hours | First contact |
| 2 | Day 2 | 2-day follow-up |
| 3 | Day 5 | 5-day follow-up |
| 4 | Day 14 | 2-week follow-up |
| 5 | Day 30 | 1-month follow-up |

**Idempotency:** If follow-ups already exist for a customer, no duplicates are created.

### Follow-up Fields
| Field | Type | Notes |
|-------|------|-------|
| `customer_id` | TEXT | Reference to `belarro_v4_customer` |
| `follow_up_number` | INTEGER | Stage 1-5 |
| `follow_up_days` | INTEGER | Days from creation |
| `due_date` | TIMESTAMP | Calculated due date |
| `status` | TEXT | `pending`, `completed`, `skipped` |
| `sent_via` | TEXT | `email`, `whatsapp`, `sms`, `call` |
| `sent_date` | TIMESTAMP | When notification was sent |

## API Endpoints

### POST /api/sync-prospect
**Called by:** SalesTracker mobile app  
**Writes to:** `belarro_v4_customer` + `belarro_v4_follow_up`

**Request:**
```json
{
  "locationName": "Restaurant Name",
  "contactPerson": "John Doe",
  "directPhone": "+49 548 020911",
  "directEmail": "john@test.de",
  "businessPhone": "+49 548 020912",
  "businessEmail": "business@test.de",
  "businessWebsite": "example.com",
  "businessTypes": "restaurant",
  "language": "DE",
  "visitNotes": "Good interest",
  "salesRep": "Ron",
  "interestLevel": "high"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-customer",
  "isNew": true,
  "locationName": "Restaurant Name",
  "contactPerson": "John Doe"
}
```

### GET /admin/customers
**Called by:** Belarro web admin  
**Reads from:** `belarro_v4_customer`  
**Shows:** All active customers (both sources merged, deduped)

## Migration Timeline

- **June 30** — Schema migration, 75 locations migrated
- **July 1** — Testing, validation
- **July 2** — Staging sign-off, production deployment
- **July 2-9** — 24/7 monitoring
- **August 2** — Archive `locations` table (30-day rollback window closed)

## Rollback Plan

**If issues emerge within 30 days:**

1. Revert to old code (disable `/api/sync-prospect`)
2. Restore `locations` table as source of truth
3. Downgrade front-end to dual-system view

**No data is deleted.** All `belarro_v4_customer` records remain. The `locations` table is read-only and available for reference.

## Security

- **RLS Enabled:** Service role only for writes, authenticated users can read
- **Optimistic Locking:** `updated_at` timestamp prevents race conditions
- **Soft Deletes:** No hard deletes, `deleted_at` column for audit trail
- **Audit Logging:** `created_at`, `updated_at`, `source`, `last_synced_at` track all changes

## Future Improvements

- Add `integration_id` field for multi-tenant support
- Add `automation_status` for campaign tracking
- Add `revenue_ytd`, `next_order_date` for financial analytics
- Implement webhook notifications when customer status changes
