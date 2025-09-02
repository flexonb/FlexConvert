import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, RefreshCcw, AlertTriangle, Gauge, FolderOpen } from "lucide-react";
import backend from "~backend/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AnimatedCounter from "../shared/AnimatedCounter";
import Sparkline from "./Sparkline";
import DonutChart from "./DonutChart";
import { cn } from "@/lib/utils";

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

  const topTools = useMemo(() => (stats ? stats.stats.slice(0, 5) : []), [stats]);

  const categoryAgg = useMemo(() => {
    const agg: Record<string, number> = {};
    if (!stats) return agg;
    for (const s of stats.stats) {
      agg[s.toolCategory] = (agg[s.toolCategory] || 0) + s.totalUsage;
    }
    return agg;
  }, [stats]);

  const donutData = useMemo(
    () =>
      Object.entries(categoryAgg).map(([label, value]) => ({
        label,
        value,
        color:
          label === "pdf"
            ? "#3b82f6"
            : label === "image"
            ? "#10b981"
            : label === "convert"
            ? "#8b5cf6"
            : undefined,
      })),
    [categoryAgg]
  );

  const maxSeries = useMemo(() => {
    if (!stats?.timeSeries?.length) return 0;
    return Math.max(...stats.timeSeries.map((p) => p.count));
  }, [stats]);

  const seriesPoints = useMemo(
    () => stats?.timeSeries?.map((p) => p.count) ?? [],
    [stats]
  );

  // Approximate overall success rate weighted by usage counts
  const overallSuccess = useMemo(() => {
    if (!stats?.stats?.length) return 0;
    let sum = 0;
    let denom = 0;
    for (const s of stats.stats) {
      sum += s.successRate * s.totalUsage;
      denom += s.totalUsage;
    }
    return denom ? sum / denom : 0;
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
            <CardHeader className="pb-2">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-24 mt-2 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
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
      {/* Filters */}
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

      {/* Metric tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              Total Operations
            </CardTitle>
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
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              Success Rate
            </CardTitle>
            <CardDescription>Weighted across tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {((overallSuccess || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Unique Tools
            </CardTitle>
            <CardDescription>Variants in use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              <AnimatedCounter to={stats.stats.length} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Activity Over Time
            </CardTitle>
            <CardDescription>
              Daily operations{category !== "all" ? ` • ${category}` : ""}
              {range !== "all" ? ` • last ${range} days` : " • all time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seriesPoints.length > 0 ? (
              <>
                <Sparkline points={seriesPoints} height={80} className="mt-2" />
                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                  <span>{stats.timeSeries[0]?.date || ""}</span>
                  <span>{stats.timeSeries[stats.timeSeries.length - 1]?.date || ""}</span>
                </div>
              </>
            ) : (
              <div className="h-24 grid place-items-center text-sm text-muted-foreground">
                No activity in selected range
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Share of operations</CardDescription>
          </CardHeader>
          <CardContent>
            {donutData.length > 0 ? (
              <DonutChart
                data={donutData}
                size={180}
                thickness={16}
                centerLabel="Total"
                legend
                legendClassName="mt-4"
              />
            ) : (
              <div className="h-24 grid place-items-center text-sm text-muted-foreground">
                No category data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most used tools compact list */}
      <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Most Used Tools
          </CardTitle>
          <CardDescription>Top 5 by usage count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topTools.length === 0 && (
              <div className="text-sm text-muted-foreground">No tools in the selected range.</div>
            )}
            {topTools.map((tool, index) => {
              const pctOfTop = topTools[0]?.totalUsage
                ? (tool.totalUsage / topTools[0].totalUsage) * 100
                : 0;
              const color =
                tool.toolCategory === "pdf"
                  ? "from-blue-500 via-indigo-500 to-blue-500"
                  : tool.toolCategory === "image"
                  ? "from-emerald-500 via-green-500 to-emerald-500"
                  : "from-violet-500 via-purple-500 to-violet-500";

              return (
                <div
                  key={`${tool.toolCategory}-${tool.toolName}`}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 text-sm font-medium text-muted-foreground shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium">
                        <span className="capitalize text-muted-foreground/80 mr-1.5">
                          {tool.toolCategory}:
                        </span>
                        <span className="text-foreground">{tool.toolName}</span>
                      </div>
                      <div className="text-xs tabular-nums text-muted-foreground shrink-0">
                        {tool.totalUsage.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden"
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 rounded-full bg-gradient-to-r transition-all duration-500",
                          color
                        )}
                        style={{ width: `${Math.max(4, pctOfTop)}%` }}
                        aria-label={`${tool.toolName} ${pctOfTop.toFixed(1)} percent of top`}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {(tool.successRate * 100).toFixed(1)}% success
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
