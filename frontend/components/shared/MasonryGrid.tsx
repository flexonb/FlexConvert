import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}

export default function MasonryGrid({ 
  children, 
  columns = 3, 
  gap = 16, 
  className 
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnHeight, setColumnHeight] = useState<number[]>([]);

  useEffect(() => {
    setColumnHeight(new Array(columns).fill(0));
  }, [columns]);

  const getShortestColumn = () => {
    return columnHeight.indexOf(Math.min(...columnHeight));
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        columnCount: columns,
        columnGap: `${gap}px`,
      }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className="break-inside-avoid"
          style={{ marginBottom: `${gap}px` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
