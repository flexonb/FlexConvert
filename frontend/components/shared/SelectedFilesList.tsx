import React from "react";
import { X, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectedFilesListProps {
  files: File[];
  onRemove: (index: number) => void;
  accent?: "blue" | "green" | "purple";
  label?: string;
}

export default function SelectedFilesList({
  files,
  onRemove,
  accent = "blue",
  label,
}: SelectedFilesListProps) {
  const accentBorder = {
    blue: "border-blue-200/70 dark:border-blue-900",
    green: "border-green-200/70 dark:border-green-900",
    purple: "border-purple-200/70 dark:border-purple-900",
  }[accent];

  const accentBg = {
    blue: "bg-blue-50/60 dark:bg-blue-950/30",
    green: "bg-green-50/60 dark:bg-green-950/30",
    purple: "bg-purple-50/60 dark:bg-purple-950/30",
  }[accent];

  const getIconForFile = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-gray-500" />;
    if (file.type === "application/pdf") return <FileText className="w-4 h-4 text-gray-500" />;
    return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  const totalSizeMB = files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;

  return (
    <div className={cn("mb-4 rounded-lg border p-2", accentBorder, accentBg)}>
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {label || "Selected Files"} ({files.length})
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Total size: {totalSizeMB.toFixed(1)} MB
        </div>
      </div>
      <div className="space-y-1.5 max-h-44 overflow-auto pr-1">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getIconForFile(file)}
              <span className="truncate">{file.name}</span>
              <span className="ml-2 shrink-0 text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-gray-500 hover:text-red-600"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
