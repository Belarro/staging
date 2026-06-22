ALTER TABLE belarro_v4_seed_inventory
ADD COLUMN IF NOT EXISTS seeds_per_tray FLOAT DEFAULT 60;
