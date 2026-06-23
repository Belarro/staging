ALTER TABLE belarro_v4_order ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly'));
