-- ============================================================================
-- DELIVERY LEDGER
-- ============================================================================
-- Immutable record of what actually left the farm, per order line per week.
-- Written ONCE when a delivery is confirmed (Sales Tracker app). Never
-- recomputed from live order state — this is the ground truth that invoices
-- and "what happened in month X" must read for any date <= today. Editing an
-- order's crop/qty/schedule today must never rewrite what already happened.
--
-- One row per (order_id, delivery_date): confirming the same line/week twice
-- overwrites the previous confirmation (a correction), never inserts a
-- duplicate — see the unique constraint below.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS belarro_v4_delivery (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES belarro_v4_order(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES belarro_v4_customer(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,               -- the Tuesday this line was due
  crop_name TEXT NOT NULL,                    -- denormalized: survives crop/order edits later
  size_name TEXT,
  expected_qty FLOAT NOT NULL,
  actual_qty FLOAT NOT NULL,
  unit_price_eur FLOAT NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('delivered', 'adjusted', 'not_delivered')),
  note TEXT,
  confirmed_by TEXT,                          -- email of whoever tapped confirm
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (order_id, delivery_date)
);

CREATE INDEX IF NOT EXISTS idx_delivery_customer_date ON belarro_v4_delivery(customer_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_date ON belarro_v4_delivery(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_deleted_at ON belarro_v4_delivery(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE belarro_v4_delivery ENABLE ROW LEVEL SECURITY;

-- Anon policies (dev-mode pattern matching the rest of this schema — the app
-- gates access at the API/session layer, not via RLS, same as every other
-- belarro_v4_* table).
CREATE POLICY "Allow anon select" ON belarro_v4_delivery FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert" ON belarro_v4_delivery FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update" ON belarro_v4_delivery FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- No DELETE policy: soft-delete only, consistent with the no-hard-delete
-- trigger installed on the other belarro_v4_* tables (Data Protection Mandate).

-- Reuses prevent_hard_delete() installed by sprint3_soft_delete.sql.
DROP TRIGGER IF EXISTS no_hard_delete_delivery ON belarro_v4_delivery;
CREATE TRIGGER no_hard_delete_delivery BEFORE DELETE ON belarro_v4_delivery FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

COMMIT;
