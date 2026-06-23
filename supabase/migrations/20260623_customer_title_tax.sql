ALTER TABLE belarro_v4_customer
  ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'owner' CHECK (contact_title IN ('owner', 'executive_chef', 'chef', 'sous_chef', 'manager')),
  ADD COLUMN IF NOT EXISTS tax_number TEXT;
