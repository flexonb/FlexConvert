import React from "react";
import { FileText, Image, RefreshCcw, BarChart3, Command, Palette, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "../utils/recentTools";
import { Button } from "@/components/ui/button";

type NavId = ToolCategory | "stats" | "tools";

interface SideNavProps {
  active: NavId;
  onSelect: (id: NavId) => void;
  onOpenPalette?: () => void;
}

const items: { id: NavId; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; description: string }[] = [
  { 
    id: "pdf", 
    label: "PDF Tools", 
    icon: FileText, 
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    description: "Merge, split, compress & more"
  },
  { 
    id: "image", 
    label: "Image Tools", 
    icon: Image, 
    color: "text-emerald-600 dark:text-emerald-400", 
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    description: "Resize, crop, compress & edit"
  },
  { 
    id: "convert", 
    label: "Convert", 
    icon: RefreshCcw, 
    color: "text-purple-600 dark:text-purple-400", 
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    description: "Transform between formats"
  },
  { 
    id: "tools", 
    label: "Advanced Tools", 
    icon: Wand2, 
    color: "text-amber-600 dark:text-amber-400", 
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    description: "OCR, QR codes, watermarks"
  },
  { 
    id: "stats", 
    label: "Analytics", 
    icon: BarChart3, 
    color: "text-orange-600 dark:text-orange-400", 
    bgColor: "bg-orange-500/10 dark:bg-orange-500/20",
    description: "Usage insights & statistics"
  },
];

export default function SideNav({ active, onSelect, onOpenPalette }: SideNavProps) {
  return (
    <nav aria-label="Main" className="space-y-4">
      {/* Navigation */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg p-2">
        <div className="px-3 py-2 mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Tools
          </h4>
        </div>
        
        <ul className="space-y-2">
          {items.map(({ id, label, icon: Icon, color, bgColor, description }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onSelect(id)}
                  className={cn(
                    "w-full group relative flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    "hover:bg-gray-50/80 dark:hover:bg-gray-800/50",
                    isActive
                      ? "bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50"
                      : "border border-transparent"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive ? bgColor : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive ? color : "text-gray-500 dark:text-gray-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-semibold text-sm transition-colors duration-200",
                      isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {description}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className={cn("w-2 h-2 rounded-full", bgColor.replace('/10', '/60').replace('/20', '/60'))} />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Quick Actions
          </h4>
          <Palette className="w-3.5 h-3.5 text-gray-400" />
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-2.5 px-3 border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-200"
          onClick={onOpenPalette}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <Command className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">Command Palette</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">⌘K to open</div>
          </div>
        </Button>
      </div>
    </nav>
  );
}
