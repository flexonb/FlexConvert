import React, { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  points: number[];
  height?: number; // px
  className?: string;
  stroke?: string;
  fillFrom?: string;
  fillTo?: string;
}

export default function Sparkline({
  points,
  height = 64,
  className,
  stroke = "rgb(59,130,246)", // blue-500
  fillFrom = "rgba(59,130,246,0.25)",
  fillTo = "rgba(168,85,247,0.10)", // purple-500/10
}: SparklineProps) {
  const id = useId();

  const { pathD, fillD, width, min, max } = useMemo(() => {
    const n = points.length;
    const w = Math.max(1, n - 1) * 8 + 4; // 8px step + padding
    const mn = Math.min(...points, 0);
    const mx = Math.max(...points, 1);
    const range = mx - mn || 1;

    const scaleX = (i: number) => (i / Math.max(1, n - 1)) * (w - 4) + 2;
    const scaleY = (v: number) => height - 2 - ((v - mn) / range) * (height - 4);

    let d = "";
    points.forEach((p, i) => {
      const x = scaleX(i);
      const y = scaleY(p);
      d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });

    // Area fill to baseline
    const baselineY = scaleY(mn);
    const fill = `${d} L ${scaleX(points.length - 1)},${baselineY} L ${scaleX(0)},${baselineY} Z`;

    return { pathD: d, fillD: fill, width: w, min: mn, max: mx };
  }, [points, height]);

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "w-full h-[64px] rounded bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-pulse",
          className
        )}
      />
    );
  }

  return (
    <svg
      className={cn("w-full", className)}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Activity sparkline. Min ${min}, Max ${max}`}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={stroke} floodOpacity="0.4" />
        </filter>
      </defs>

      <path d={fillD} fill={`url(#${id}-grad)`} />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={2} filter={`url(#${id}-glow)`} />
    </svg>
  );
}
