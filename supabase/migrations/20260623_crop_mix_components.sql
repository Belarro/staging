-- Add is_mix flag to crops
ALTER TABLE belarro_v4_crop ADD COLUMN IF NOT EXISTS is_mix BOOLEAN NOT NULL DEFAULT FALSE;

-- Mix components table
CREATE TABLE IF NOT EXISTS belarro_v4_crop_mix_component (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_crop_id UUID NOT NULL REFERENCES belarro_v4_crop(id) ON DELETE CASCADE,
  component_crop_id UUID NOT NULL REFERENCES belarro_v4_crop(id) ON DELETE CASCADE,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mix_crop_id, component_crop_id)
);
