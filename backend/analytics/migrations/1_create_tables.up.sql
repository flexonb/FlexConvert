CREATE TABLE usage_stats (
  id BIGSERIAL PRIMARY KEY,
  tool_category VARCHAR(50) NOT NULL,
  tool_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_count INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_usage_stats_tool_category ON usage_stats(tool_category);
CREATE INDEX idx_usage_stats_tool_name ON usage_stats(tool_name);
CREATE INDEX idx_usage_stats_timestamp ON usage_stats(timestamp);
