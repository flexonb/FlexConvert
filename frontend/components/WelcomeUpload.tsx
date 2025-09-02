import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdvancedDropZone from "./shared/AdvancedDropZone";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, RefreshCcw, UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelection, detectCategory } from "../context/SelectionContext";

type TabId = "pdf" | "image" | "convert" | "stats" | "tools";

interface WelcomeUploadProps {
  onProceed: (category: "pdf" | "image" | "convert") => void;
  activeTab: TabId;
}

const ALL_ACCEPTED = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".docx",
  ".pptx",
  ".xlsx",
  ".txt",
  ".zip",
];

export default function WelcomeUpload({ onProceed, activeTab }: WelcomeUploadProps) {
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const { setSelection } = useSelection();

  const { category, counts } = useMemo(() => detectCategory(localFiles), [localFiles]);

  const proceedLabel = useMemo(() => {
    switch (category) {
      case "pdf":
        return "Continue to PDF Tools";
      case "image":
        return "Continue to Image Tools";
      default:
        return "Continue to Convert Tools";
    }
  }, [category]);

  const proceedIcon = useMemo(() => {
    switch (category) {
      case "pdf":
        return FileText;
      case "image":
        return ImageIcon;
      default:
        return RefreshCcw;
    }
  }, [category]);

  const handleFilesSelected = (files: File[]) => {
    setLocalFiles(files);
    // Save selection globally with detected category
    const det = detectCategory(files);
    setSelection(files, det.category);
  };

  const onContinue = () => {
    const det = detectCategory(localFiles);
    setSelection(localFiles, det.category);
    onProceed(det.category);
  };

  const Icon = proceedIcon;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Welcome
          </CardTitle>
          <CardDescription>
            Upload files to begin. We will auto-detect available tools based on your file types. Sidebar clicks only change highlight; tools open when you proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedDropZone
            onFilesSelected={handleFilesSelected}
            acceptedTypes={ALL_ACCEPTED}
            maxFiles={20}
          />

          {/* Auto-detected summary */}
          {localFiles.length > 0 && (
            <div className="mt-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Detected category:
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    category === "pdf" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                    category === "image" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                    category === "convert" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  )}
                >
                  {category}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {counts.pdf} PDF • {counts.image} image • {counts.other} other
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1"
                  disabled={localFiles.length === 0}
                  onClick={onContinue}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {proceedLabel}
                </Button>
                <Button
                  className="sm:w-auto"
                  variant="outline"
                  onClick={() => {
                    setLocalFiles([]);
                    setSelection([], null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Quick legend for tab highlight behavior */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "pdf", label: "PDF", Icon: FileText, active: activeTab === "pdf" },
              { id: "image", label: "Image", Icon: ImageIcon, active: activeTab === "image" },
              { id: "convert", label: "Convert", Icon: RefreshCcw, active: activeTab === "convert" },
            ].map(({ id, label, Icon, active }) => (
              <div
                key={id}
                className={cn(
                  "rounded-xl border p-3 flex items-center gap-2 text-sm",
                  active
                    ? "border-blue-300/60 dark:border-blue-700/60 bg-blue-50/60 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-blue-600 dark:text-blue-400" : "text-gray-500")} />
                <span>{label}</span>
                <span className="ml-auto text-xs text-muted-foreground">highlight only</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
