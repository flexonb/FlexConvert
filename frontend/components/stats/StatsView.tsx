import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, BarChart2, RefreshCcw, AlertTriangle } from "lucide-react";
import backend from "~backend/client";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCounter from "../shared/AnimatedCounter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CategoryFilter = "all" | "pdf" | "image" | "convert";
type RangeFilter = "7" | "30" | "90" | "365" | "all";

export default function StatsView() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [range, setRange] = useState<RangeFilter>("30");

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["usage-stats", category, range],
    queryFn: () =>
      backend.analytics.getStats({
        category: category === "all" ? undefined : category,
        days: range === "all" ? undefined : Number(range),
      }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const topTools = useMemo(() => (stats ? stats.stats.slice(0, 10) : []), [stats]);

  const categoryStats = useMemo(() => {
    if (!stats) return {};
    return stats.stats.reduce((acc, stat) => {
      if (!acc[stat.toolCategory]) {
        acc[stat.toolCategory] = { total: 0, tools: 0 };
      }
      acc[stat.toolCategory].total += stat.totalUsage;
      acc[stat.toolCategory].tools += 1;
      return acc;
    }, {} as Record<string, { total: number; tools: number }>);
  }, [stats]);

  const maxSeries = useMemo(() => {
    if (!stats?.timeSeries?.length) return 0;
    return Math.max(...stats.timeSeries.map((p) => p.count));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load analytics</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || "An unexpected error occurred while fetching stats."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCcw className={isFetching ? "animate-spin w-4 h-4" : "w-4 h-4"} />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No statistics available yet</p>
      </div>
    );
  }

  const totalOps = stats.totalOperations || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">Filter analytics</div>
        <div className="flex items-center gap-2.5">
          <Select value={category} onValueChange={(v: CategoryFilter) => setCategory(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="convert">Convert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v: RangeFilter) => setRange(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-1 gap-2">
            <RefreshCcw className={isFetching ? "animate-spin w-4 h-4" : "w-4 h-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Operations</CardTitle>
            <CardDescription>Processing count (filtered)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              <AnimatedCounter to={totalOps} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tool Categories</CardTitle>
            <CardDescription>Active tool types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              <AnimatedCounter to={Object.keys(categoryStats).length} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unique Tools</CardTitle>
            <CardDescription>Available tool variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              <AnimatedCounter to={stats.stats.length} />
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.timeSeries.length > 0 ? (
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Activity Over Time
            </CardTitle>
            <CardDescription>
              Daily operations{category !== "all" ? ` • ${category}` : ""}
              {range !== "all" ? ` • last ${range} days` : " • all time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-20 flex items-end gap-[3px]">
              {stats.timeSeries.map((p, i) => {
                const h = maxSeries ? Math.max(2, Math.round((p.count / maxSeries) * 100)) : 2;
                return (
                  <div
                    key={`${p.date}-${i}`}
                    title={`${p.date}: ${p.count}`}
                    aria-label={`${p.date}: ${p.count} operations`}
                    className="flex-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-t transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{stats.timeSeries[0]?.date || ""}</span>
              <span>{stats.timeSeries[stats.timeSeries.length - 1]?.date || ""}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gray-400" /> No Activity in Range
            </CardTitle>
            <CardDescription>Try expanding the date range or removing filters.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Most Used Tools
            </CardTitle>
            <CardDescription>Top 10 tools by usage count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {topTools.map((tool, index) => (
                <div key={`${tool.toolCategory}-${tool.toolName}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">#{index + 1}</div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{tool.toolName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{tool.toolCategory}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-gray-900 dark:text-white">{tool.totalUsage.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{(tool.successRate * 100).toFixed(1)}% success</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" /> Category Usage
            </CardTitle>
            <CardDescription>Usage breakdown by tool category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, data]) => {
                const pct = totalOps ? (data.total / totalOps) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{cat}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{data.total.toLocaleString()} uses</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                        aria-label={`${cat} ${pct.toFixed(1)} percent`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {data.tools} tools • {pct.toFixed(1)}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center py-6 text-sm text-gray-500 dark:text-gray-400">
        <Activity className="w-4 h-4 mr-2 animate-pulse" />
        Real-time analytics update automatically.
      </div>
    </div>
  );
}
