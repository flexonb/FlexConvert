import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Merge, Scissors, Image as ImageIcon, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinksProps {
  onSelectTab: (id: "pdf" | "image" | "convert" | "stats") => void;
}

export default function QuickLinks({ onSelectTab }: QuickLinksProps) {
  const links: {
    id: string;
    label: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    tab: "pdf" | "image";
    accent: "blue" | "green";
  }[] = [
    { id: "merge-pdf", label: "Merge PDFs", sub: "Combine files", icon: Merge, tab: "pdf", accent: "blue" },
    { id: "split-pdf", label: "Split PDF", sub: "Per-page export", icon: Scissors, tab: "pdf", accent: "blue" },
    { id: "resize-img", label: "Resize Images", sub: "Set dimensions", icon: ImageIcon, tab: "image", accent: "green" },
    { id: "compress-img", label: "Compress Images", sub: "Smaller files", icon: Archive, tab: "image", accent: "green" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {links.map((l) => (
          <Card
            key={l.id}
            className={cn(
              "p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow hover:shadow-lg transition-all duration-200 group"
            )}
          >
            <button
              onClick={() => onSelectTab(l.tab)}
              className="w-full text-left flex items-center gap-3"
              aria-label={l.label}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  l.accent === "blue"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}
              >
                <l.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{l.label}</div>
                {l.sub && <div className="text-xs text-gray-500 dark:text-gray-400">{l.sub}</div>}
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
