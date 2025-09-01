import React from "react";
import { Card } from "@/components/ui/card";
import { Merge, Scissors, Image as ImageIcon, Archive, QrCode, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinksProps {
  onSelectTab: (id: "pdf" | "image" | "convert" | "stats" | "tools") => void;
}

export default function QuickLinks({ onSelectTab }: QuickLinksProps) {
  const links: {
    id: string;
    label: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    tab: "pdf" | "image" | "tools";
    accent: "blue" | "green" | "amber";
  }[] = [
    { id: "merge-pdf", label: "Merge PDFs", sub: "Combine files", icon: Merge, tab: "pdf", accent: "blue" },
    { id: "split-pdf", label: "Split PDF", sub: "Per-page export", icon: Scissors, tab: "pdf", accent: "blue" },
    { id: "resize-img", label: "Resize Images", sub: "Set dimensions", icon: ImageIcon, tab: "image", accent: "green" },
    { id: "compress-img", label: "Compress Images", sub: "Smaller files", icon: Archive, tab: "image", accent: "green" },
    { id: "qr-generator", label: "QR Generator", sub: "Create codes", icon: QrCode, tab: "tools", accent: "amber" },
    { id: "watermark-designer", label: "Watermark Designer", sub: "Design watermarks", icon: Droplets, tab: "tools", accent: "amber" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {links.map((l) => (
          <Card
            key={l.id}
            className={cn(
              "relative overflow-hidden p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 shadow hover:shadow-lg transition-all duration-200 group"
            )}
          >
            {/* accent bar */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-x-4 -top-[2px] h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                l.accent === "blue" && "bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent",
                l.accent === "green" && "bg-gradient-to-r from-emerald-500 via-green-500 to-transparent",
                l.accent === "amber" && "bg-gradient-to-r from-amber-500 via-orange-500 to-transparent"
              )}
            />
            <button
              onClick={() => onSelectTab(l.tab)}
              className="w-full text-left flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-lg"
              aria-label={l.label}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  l.accent === "blue" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  l.accent === "green" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  l.accent === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
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
