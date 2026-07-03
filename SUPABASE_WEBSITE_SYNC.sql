-- ═══════════════════════════════════════════════════════════════════
-- WEBSITE ↔ ADMIN UNIFICATION (July 3, 2026)
-- Run ONCE in the Supabase SQL editor of project wbqzlxdyjdmbzifhsyil
-- (the belarro-v4 admin project).
--
-- 1. Creates form_submissions so website forms land in the admin
--    Submissions page (currently 404s — table only exists in the OLD
--    Supabase project gcgscmtjesyiziebutzw).
-- 2. Adds website display columns to belarro_v4_crop (category for the
--    for-chefs tabs, tags for inventory filters, sort_order, photo_flip).
--    Data is copied from the old project by scripts/migrate (Claude runs
--    it after this SQL).
-- ═══════════════════════════════════════════════════════════════════

-- 1. form_submissions ------------------------------------------------
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL,
  intent TEXT,
  restaurant_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  sample_varieties TEXT,
  delivery_address TEXT,
  preferred_days TEXT[],
  preferred_times TEXT[],
  notes TEXT,
  message TEXT,
  locale TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Website (anon key) may INSERT only. Nobody reads with anon — the admin
-- reads via service role, which bypasses RLS. Submissions contain PII.
DROP POLICY IF EXISTS "anon insert only" ON form_submissions;
CREATE POLICY "anon insert only" ON form_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- 2. Website display columns on crops --------------------------------
ALTER TABLE belarro_v4_crop
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS sort_order INTEGER,
  ADD COLUMN IF NOT EXISTS photo_flip TEXT;
