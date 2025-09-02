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
    conds.push(`created_at >= NOW() - make_interval(days => $${args.length})`);
  }

  if (params.category) {
    args.push(params.category.toLowerCase());
    conds.push(`category = $${args.length}`);
  }

  const clause = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  return { clause, args };
}

// Retrieves aggregate usage statistics and a daily time series for analytics events.
export const getStats = api<GetStatsParams, GetStatsResponse>(
  { expose: true, method: "GET", path: "/analytics/stats" },
  async (req) => {
    const params = {
      days: req.days ? Number(req.days) : undefined,
      category: req.category,
    };
    const { clause, args } = buildWhereClause(params);

    // Aggregate per tool
    const stats = await analyticsDB.rawQueryAll<{
      category: string;
      name: string;
      total_usage: string;
      success_count: string | null;
    }>(
      `
      SELECT
        category,
        name,
        COUNT(*) AS total_usage,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) AS success_count
      FROM analytics_events
      ${clause}
      GROUP BY category, name
      ORDER BY total_usage DESC
      `,
      ...args
    );

    // Total operations
    const totalOperationsRow = await analyticsDB.rawQueryRow<{ count: string }>(
      `
      SELECT COUNT(*) AS count
      FROM analytics_events
      ${clause}
      `,
      ...args
    );

    // Daily time series
    const series = await analyticsDB.rawQueryAll<{ day: string | Date; count: string }>(
      `
      SELECT date_trunc('day', created_at) AS day, COUNT(*) AS count
      FROM analytics_events
      ${clause}
      GROUP BY 1
      ORDER BY 1 ASC
      `,
      ...args
    );

    return {
      stats: stats.map((s) => {
        const total = parseInt(s.total_usage || "0", 10);
        const success = parseInt(s.success_count || "0", 10);
        return {
          toolCategory: s.category,
          toolName: s.name,
          totalUsage: total,
          successRate: total > 0 ? success / total : 0,
        };
      }),
      totalOperations: parseInt(totalOperationsRow?.count || "0", 10),
      timeSeries: series.map((row) => {
        const d = row.day instanceof Date ? row.day : new Date(row.day);
        return {
          date: d.toISOString().slice(0, 10),
          count: parseInt(row.count || "0", 10),
        };
      }),
    };
  }
);
