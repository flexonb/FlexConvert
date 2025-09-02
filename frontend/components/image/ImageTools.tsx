import React, { useEffect, useMemo, useState } from "react";
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
  Wand2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessingStatus from "../shared/ProcessingStatus";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import ToolCard from "../shared/ToolCard";
import AdvancedDropZone from "../shared/AdvancedDropZone";
import StepIndicator, { type Step } from "../shared/StepIndicator";
import ImageEnhanceDialog from "./ImageEnhanceDialog";
import ImageOperationDialog from "./ImageOperationDialog";
import type { ImageEnhanceOptions, ImageOperation } from "@/utils/imageProcessor";
import { useSelection } from "../../context/SelectionContext";

type ConfigurableOperation =
  | "resize"
  | "crop"
  | "compress"
  | "rotate"
  | "flip"
  | "convert"
  | "grayscale"
  | "adjust"
  | "text-overlay";

export default function ImageTools() {
  const [files, setFiles] = useState<File[]>([]);
  const [enhanceOpen, setEnhanceOpen] = useState(false);

  const [opDialogOpen, setOpDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<ConfigurableOperation | null>(null);

  const { status, progress, processFiles, resultFiles, downloadResults } = useImageProcessor();
  const { files: selFiles, setSelection } = useSelection();

  // Sync with global selection
  useEffect(() => {
    if (selFiles.length > 0) {
      setFiles(selFiles);
    }
  }, [selFiles]);

  const imageTools = [
    { id: "enhance", title: "Enhance", description: "Auto-enhance (sharpen, denoise, levels)", icon: Wand2, action: () => setEnhanceOpen(true) },
    { id: "resize", title: "Resize Images", description: "Change image dimensions", icon: ImageIcon, action: () => openOperation("resize") },
    { id: "crop", title: "Crop Images", description: "Crop images to specific area", icon: Crop, action: () => openOperation("crop") },
    { id: "compress", title: "Compress Images", description: "Reduce image file size", icon: Archive, action: () => openOperation("compress") },
    { id: "rotate", title: "Rotate Images", description: "Rotate images by any angle", icon: RotateCw, action: () => openOperation("rotate") },
    { id: "flip", title: "Flip Images", description: "Flip horizontally and/or vertically", icon: FlipHorizontal, action: () => openOperation("flip") },
    { id: "convert", title: "Convert Format", description: "PNG ↔ JPG ↔ WebP conversion", icon: RefreshCw, action: () => openOperation("convert") },
    { id: "grayscale", title: "Grayscale", description: "Convert images to grayscale", icon: Palette, action: () => openOperation("grayscale") },
    { id: "adjust", title: "Adjust Colors", description: "Brightness, contrast, saturation", icon: Sun, action: () => openOperation("adjust") },
    { id: "text-overlay", title: "Add Text", description: "Add text overlay to images", icon: Type, action: () => openOperation("text-overlay") },
  ] as const;

  const acceptedImageTypes = [".jpeg", ".jpg", ".png", ".webp", ".gif", ".bmp"];

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

  function openOperation(op: ConfigurableOperation) {
    setCurrentOperation(op);
    setOpDialogOpen(true);
  }

  function onConfirmOperation(options: any) {
    if (!currentOperation) return;
    processFiles(files, currentOperation as ImageOperation, options);
    setOpDialogOpen(false);
  }

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setSelection(newFiles, "image");
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            Image Processing Tools
          </CardTitle>
          <CardDescription>Select images and choose a tool. Configure options in a guided, multi-step flow. All processing happens locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator steps={steps} className="mb-4" />

          <AdvancedDropZone onFilesSelected={handleFilesSelected} acceptedTypes={acceptedImageTypes} maxFiles={20} className="mb-4" />

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
                buttonText={files.length === 0 ? "Select files" : "Configure"}
                buttonVariant={files.length === 0 ? "outline" : "default"}
              />
            ))}
          </div>

          {status === "success" && (
            <div className="flex justify-end mt-2 gap-2">
              <Button size="sm" variant="secondary" onClick={downloadResults}>
                <Download className="w-4 h-4 mr-2" />
                Download Results ({resultFiles.length})
              </Button>
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

      {/* Generic operation dialog (multistep) */}
      {currentOperation && (
        <ImageOperationDialog
          open={opDialogOpen}
          onOpenChange={setOpDialogOpen}
          operation={currentOperation}
          files={files}
          onConfirm={onConfirmOperation}
        />
      )}
    </div>
  );
}
