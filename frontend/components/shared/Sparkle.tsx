import React from "react";
import { cn } from "@/lib/utils";

interface SparkleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  delay?: number;
}

export default function Sparkle({ size = "md", className, delay = 0 }: SparkleProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  };

  return (
    <div
      className={cn(
        "absolute animate-pulse",
        sizeClasses[size],
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: "2s"
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-yellow-400"
      >
        <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-3.01L12 0z" />
      </svg>
    </div>
  );
}
