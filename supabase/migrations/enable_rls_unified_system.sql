-- Enable RLS on unified customer database tables
-- Deploy after testing on staging, before production go-live

-- 1. Enable RLS on belarro_v4_customer
ALTER TABLE belarro_v4_customer ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on belarro_v4_follow_up
ALTER TABLE belarro_v4_follow_up ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Service role (Edge Functions, API) can read/write all
CREATE POLICY "service_role_all" ON belarro_v4_customer
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_all" ON belarro_v4_follow_up
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Policy: Authenticated users can read (for dashboard/list views)
CREATE POLICY "authenticated_read" ON belarro_v4_customer
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read" ON belarro_v4_follow_up
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Policy: Only service role can INSERT/UPDATE/DELETE (via API routes)
-- This prevents direct client access, forces all writes through Next.js API layer
