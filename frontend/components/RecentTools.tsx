import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Image as ImageIcon, RefreshCcw, Clock, Trash2 } from "lucide-react";
import { getRecentTools, RecentTool, ToolCategory, clearRecentTools } from "../utils/recentTools";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecentToolsProps {
  onSelectCategory: (category: ToolCategory) => void;
  compact?: boolean;
}

export default function RecentTools({ onSelectCategory, compact = false }: RecentToolsProps) {
  const [recent, setRecent] = useState<RecentTool[]>([]);

  useEffect(() => {
    setRecent(getRecentTools(8));
    const onStorage = () => setRecent(getRecentTools(8));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (recent.length === 0) {
    return null;
  }

  const iconFor = (cat: ToolCategory) => {
    const icons = {
      pdf: FileText,
      image: ImageIcon,
      convert: RefreshCcw
    };
    const IconComponent = icons[cat];
    return <IconComponent className="w-5 h-5" />;
  };

  const styleFor = (cat: ToolCategory) => {
    const styles = {
      pdf: {
        bg: "bg-gradient-to-br from-blue-500/10 to-indigo-500/15 dark:from-blue-500/20 dark:to-indigo-500/25",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200/60 dark:border-blue-800/60",
        hover: "hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-indigo-500/20"
      },
      image: {
        bg: "bg-gradient-to-br from-emerald-500/10 to-green-500/15 dark:from-emerald-500/20 dark:to-green-500/25",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200/60 dark:border-emerald-800/60",
        hover: "hover:bg-gradient-to-br hover:from-emerald-500/15 hover:to-green-500/20"
      },
      convert: {
        bg: "bg-gradient-to-br from-purple-500/10 to-pink-500/15 dark:from-purple-500/20 dark:to-pink-500/25",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200/60 dark:border-purple-800/60",
        hover: "hover:bg-gradient-to-br hover:from-purple-500/15 hover:to-pink-500/20"
      }
    };
    return styles[cat];
  };

  const clearHistory = () => {
    clearRecentTools();
    setRecent([]);
  };

  const totalCount = recent.reduce((sum, r) => sum + (r.count || 1), 0);

  const containerClass = compact ? "w-full mb-4" : "w-full max-w-4xl mx-auto mb-8";
  const gridClass = compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 md:grid-cols-4 gap-3";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recently Used
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">• {totalCount} uses</span>
        </div>
        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-gray-600 dark:text-gray-300 hover:text-red-600"
          onClick={clearHistory}
          title="Clear recent tools"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Clear
        </Button>
      </div>
      
      <div className={gridClass}>
        {recent.map((t) => {
          const style = styleFor(t.category);
          return (
            <Card
              key={`${t.category}-${t.name}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCategory(t.category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCategory(t.category);
                }
              }}
              className={cn(
                "group relative p-4 border transition-all duration-200 cursor-pointer",
                "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl",
                "hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
                style.border,
                style.hover
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200 group-hover:scale-110",
                  style.bg
                )}>
                  {iconFor(t.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={cn("font-semibold text-sm leading-tight truncate mb-1", style.text)}>
                    {t.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {t.category}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.count}×
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
