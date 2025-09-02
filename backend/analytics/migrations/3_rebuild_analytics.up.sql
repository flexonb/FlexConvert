-- Rebuild analytics from scratch using a new, clear schema.
-- This does not drop legacy tables; it creates a new table `analytics_events`
-- and (best-effort) migrates existing data from `usage_stats` if present.

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 1 CHECK (file_count >= 1),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_events_category_chk CHECK (category IN ('pdf','image','convert'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_cat_name ON analytics_events(category, name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_cat_created_at ON analytics_events(category, created_at);

-- Optional one-time data migration from legacy table if it exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'usage_stats'
  ) THEN
    INSERT INTO analytics_events (category, name, file_count, success, created_at)
    SELECT
      LOWER(COALESCE(tool_category, 'convert')),
      LOWER(COALESCE(tool_name, 'unknown')),
      COALESCE(file_count, 1),
      COALESCE(success, TRUE),
      COALESCE(created_at, NOW())
    FROM usage_stats
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
