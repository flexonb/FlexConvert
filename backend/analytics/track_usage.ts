import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface TrackUsageRequest {
  toolCategory: string;
  toolName: string;
  fileCount?: number;
  success?: boolean;
}

// Tracks usage statistics for FlexConvert tools.
export const trackUsage = api<TrackUsageRequest, void>(
  { expose: true, method: "POST", path: "/analytics/track" },
  async (req) => {
    await analyticsDB.exec`
      INSERT INTO usage_stats (tool_category, tool_name, file_count, success)
      VALUES (${req.toolCategory}, ${req.toolName}, ${req.fileCount || 1}, ${req.success ?? true})
    `;
  }
);
