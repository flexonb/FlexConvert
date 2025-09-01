import { api, Query } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface ToolStats {
  toolCategory: string;
  toolName: string;
  totalUsage: number;
  successRate: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface GetStatsResponse {
  stats: ToolStats[];
  totalOperations: number;
  timeSeries: TimeSeriesPoint[];
}

interface GetStatsParams {
  days?: Query<number>;
  category?: Query<string>;
}

function buildWhereClause(params: { days?: number; category?: string }) {
  const conds: string[] = [];
  const args: (string | number | boolean | null)[] = [];

  if (params.days && params.days > 0) {
    args.push(params.days);
    conds.push(`created_at >= NOW() - ($${args.length}::int || ' days')::interval`);
  }

  if (params.category) {
    args.push(params.category);
    conds.push(`tool_category = $${args.length}`);
  }

  const clause = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  return { clause, args };
}

// Retrieves usage statistics for all tools, with optional filters and daily time series.
export const getStats = api<GetStatsParams, GetStatsResponse>(
  { expose: true, method: "GET", path: "/analytics/stats" },
  async (req) => {
    const params = {
      days: req.days ? Number(req.days) : undefined,
      category: req.category,
    };
    const { clause, args } = buildWhereClause(params);

    const stats = await analyticsDB.rawQueryAll<{
      tool_category: string;
      tool_name: string;
      total_usage: string;
      success_count: string;
    }>(
      `
      SELECT 
        tool_category,
        tool_name,
        COUNT(*) as total_usage,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count
      FROM usage_stats
      ${clause}
      GROUP BY tool_category, tool_name
      ORDER BY total_usage DESC
    `,
      ...args
    );

    const totalOperationsRow = await analyticsDB.rawQueryRow<{ count: string }>(
      `
      SELECT COUNT(*) AS count
      FROM usage_stats
      ${clause}
    `,
      ...args
    );

    const series = await analyticsDB.rawQueryAll<{ day: string; count: string }>(
      `
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count
      FROM usage_stats
      ${clause}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
      ...args
    );

    return {
      stats: stats.map((stat) => ({
        toolCategory: stat.tool_category,
        toolName: stat.tool_name,
        totalUsage: parseInt(stat.total_usage, 10),
        successRate:
          parseInt(stat.success_count || "0", 10) /
          Math.max(parseInt(stat.total_usage || "1", 10), 1),
      })),
      totalOperations: parseInt(totalOperationsRow?.count || "0", 10),
      timeSeries: series.map((s) => ({
        date: s.day,
        count: parseInt(s.count, 10),
      })),
    };
  }
);
