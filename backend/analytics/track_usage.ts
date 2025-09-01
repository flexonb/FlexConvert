import { api, APIError } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface TrackUsageRequest {
  toolCategory: string;
  toolName: string;
  fileCount?: number;
  success?: boolean;
}

const ALLOWED_CATEGORIES = new Set(["pdf", "image", "convert"]);

// Tracks usage statistics for FlexConvert tools.
export const trackUsage = api<TrackUsageRequest, void>(
  { expose: true, method: "POST", path: "/analytics/track" },
  async (req) => {
    const category = (req.toolCategory || "").toLowerCase().trim();
    const toolName = (req.toolName || "").toLowerCase().trim();
    const fileCount = Number.isFinite(req.fileCount) && (req.fileCount as number) > 0 ? Math.floor(req.fileCount as number) : 1;
    const success = req.success ?? true;

    if (!ALLOWED_CATEGORIES.has(category)) {
      throw APIError.invalidArgument(`invalid tool category: "${req.toolCategory}". Allowed: pdf, image, convert`);
    }
    if (!toolName || toolName.length > 100) {
      throw APIError.invalidArgument("toolName must be a non-empty string up to 100 characters");
    }

    await analyticsDB.exec`
      INSERT INTO usage_stats (tool_category, tool_name, file_count, success)
      VALUES (${category}, ${toolName}, ${fileCount}, ${success})
    `;
  }
);
