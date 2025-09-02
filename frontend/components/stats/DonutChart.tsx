import React, { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number; // px
  thickness?: number; // px
  className?: string;
  showTotalInCenter?: boolean;
  centerLabel?: string;
  legend?: boolean;
  legendClassName?: string;
}

export default function DonutChart({
  data,
  size = 160,
  thickness = 14,
  className,
  showTotalInCenter = true,
  centerLabel,
  legend = true,
  legendClassName,
}: DonutChartProps) {
  const id = useId();

  const { series, total } = useMemo(() => {
    const t = data.reduce((s, d) => s + (d.value || 0), 0);
    const s = data.map((d) => ({ ...d, value: Math.max(0, d.value || 0) }));
    return { series: s, total: t };
  }, [data]);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build cumulative stroke offsets for each segment.
  let cumulative = 0;

  const colorFor = (label: string, fallbackIdx: number) => {
    // Category-aware defaults plus pleasant fallbacks
    const palette = [
      "#3b82f6", // blue
      "#8b5cf6", // violet
      "#f59e0b", // amber
      "#10b981", // emerald
      "#ef4444", // red
      "#06b6d4", // cyan
      "#a855f7", // purple
      "#f97316", // orange
    ];
    const map: Record<string, string> = {
      pdf: "#3b82f6",
      image: "#10b981",
      convert: "#8b5cf6",
    };
    return map[label] || palette[fallbackIdx % palette.length];
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Category breakdown"
      >
        <defs>
          <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth={thickness}
        />

        {/* Segments */}
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#${id}-shadow)`}>
          {series.map((d, i) => {
            const fraction = total > 0 ? d.value / total : 0;
            const segLen = fraction * circumference;
            const dashArray = `${segLen} ${circumference - segLen}`;
            const dashOffset = cumulative;
            cumulative -= segLen;

            return (
              <circle
                key={`${d.label}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color || colorFor(d.label, i)}
                strokeWidth={thickness}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </g>

        {/* Center label */}
        {showTotalInCenter && (
          <g transform={`translate(${size / 2} ${size / 2})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              style={{ fontWeight: 700, fontSize: 16 }}
            >
              {total.toLocaleString()}
            </text>
            {centerLabel && (
              <text
                textAnchor="middle"
                y={16}
                className="fill-muted-foreground"
                style={{ fontSize: 11 }}
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}
      </svg>

      {legend && (
        <div className={cn("mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs", legendClassName)}>
          {series.map((d, i) => (
            <div key={`${d.label}-legend-${i}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: d.color || colorFor(d.label, i) }}
              />
              <span className="truncate">{d.label}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">
                {d.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
