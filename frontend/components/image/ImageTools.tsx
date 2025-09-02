import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Image as ImageIcon,
  Crop,
  Archive,
  RotateCw,
  FlipHorizontal,
  RefreshCw,
  Palette,
  Sun,
  Type,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessingStatus from "../shared/ProcessingStatus";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import ToolCard from "../shared/ToolCard";
import AdvancedDropZone from "../shared/AdvancedDropZone";
import StepIndicator, { type Step } from "../shared/StepIndicator";
import ImageEnhanceDialog from "./ImageEnhanceDialog";
import type { ImageEnhanceOptions } from "@/utils/imageProcessor";

export default function ImageTools() {
  const [files, setFiles] = useState<File[]>([]);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const { status, progress, processFiles } = useImageProcessor();

  const imageTools = [
    { id: "enhance", title: "Enhance", description: "Auto-enhance (sharpen, denoise, levels)", icon: Wand2, action: () => setEnhanceOpen(true) },
    { id: "resize", title: "Resize Images", description: "Change image dimensions", icon: ImageIcon, action: () => processFiles(files, "resize") },
    { id: "crop", title: "Crop Images", description: "Crop images to specific area", icon: Crop, action: () => processFiles(files, "crop") },
    { id: "compress", title: "Compress Images", description: "Reduce image file size", icon: Archive, action: () => processFiles(files, "compress") },
    { id: "rotate", title: "Rotate Images", description: "Rotate images clockwise", icon: RotateCw, action: () => processFiles(files, "rotate") },
    { id: "flip", title: "Flip Images", description: "Flip images horizontally/vertically", icon: FlipHorizontal, action: () => processFiles(files, "flip") },
    { id: "convert", title: "Convert Format", description: "PNG ↔ JPG ↔ WebP conversion", icon: RefreshCw, action: () => processFiles(files, "convert") },
    { id: "grayscale", title: "Grayscale", description: "Convert images to grayscale", icon: Palette, action: () => processFiles(files, "grayscale") },
    { id: "adjust", title: "Adjust Colors", description: "Brightness, contrast, saturation", icon: Sun, action: () => processFiles(files, "adjust") },
    { id: "text-overlay", title: "Add Text", description: "Add text overlay to images", icon: Type, action: () => processFiles(files, "text-overlay") },
  ] as const;

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];

  const stage: "select" | "process" | "download" = useMemo(() => {
    if (files.length === 0) return "select";
    if (status === "processing") return "process";
    if (status === "success") return "download";
    return "process";
  }, [files.length, status]);

  const steps: Step[] = useMemo(() => {
    return [
      { id: "select", label: "Select Images", status: stage === "select" ? "current" : "complete" },
      { id: "process", label: "Process", status: stage === "process" ? "current" : (stage === "download" ? "complete" : "upcoming") },
      { id: "download", label: "Download", status: stage === "download" ? "current" : "upcoming" },
    ];
  }, [stage]);

  const onConfirmEnhance = (opts: ImageEnhanceOptions) => {
    processFiles(files, "enhance", opts);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            Image Processing Tools
          </CardTitle>
          <CardDescription>Select images and choose a tool. All processing happens locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator steps={steps} className="mb-4" />

          <AdvancedDropZone onFilesSelected={setFiles} acceptedTypes={acceptedImageTypes} maxFiles={20} className="mb-4" />

          <ProcessingStatus status={status} progress={progress} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {imageTools.map((tool) => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                accent={tool.id === "enhance" ? "amber" : "green"}
                onClick={tool.action}
                disabled={files.length === 0 || status === "processing"}
                buttonText={files.length === 0 ? "Select files" : "Process"}
                buttonVariant={files.length === 0 ? "outline" : "default"}
              />
            ))}
          </div>

          {status === "success" && (
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline" onClick={() => setFiles([])}>Clear Selection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhance dialog */}
      <ImageEnhanceDialog
        open={enhanceOpen}
        onOpenChange={setEnhanceOpen}
        onConfirm={onConfirmEnhance}
      />
    </div>
  );
}
