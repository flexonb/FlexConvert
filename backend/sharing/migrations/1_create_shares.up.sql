CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('file', 'config')),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  config_data JSONB,
  tool_category TEXT,
  tool_name TEXT,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shares_type ON shares(type);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
CREATE INDEX idx_shares_created_at ON shares(created_at);
