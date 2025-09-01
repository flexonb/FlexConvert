-- Rename "timestamp" column to "created_at" for clarity and to avoid confusion with the TIMESTAMP type
ALTER TABLE usage_stats RENAME COLUMN "timestamp" TO created_at;

-- Drop old index if it exists and create a new one for created_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_usage_stats_timestamp'
  ) THEN
    DROP INDEX idx_usage_stats_timestamp;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);
