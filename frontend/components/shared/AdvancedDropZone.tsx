import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import FilePreview from "./FilePreview";

interface AdvancedDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  showPreviews?: boolean;
}

const extToMime: Record<string, string> = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

export default function AdvancedDropZone({
  onFilesSelected,
  acceptedTypes,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  showPreviews = true
}: AdvancedDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const totalSize = useMemo(
    () => files.reduce((s, f) => s + f.size, 0),
    [files]
  );

  const humanSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles.map(({ file, errors }) =>
        `${file.name}: ${errors.map((e: any) => e.message).join(", ")}`
      );
      toast({
        title: "Some files were rejected",
        description: reasons.join("\n"),
        variant: "destructive"
      });
    }

    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, maxFiles, onFilesSelected, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedTypes
      ? acceptedTypes.reduce((acc, ext) => {
          const mime = extToMime[ext.toLowerCase()];
          if (mime) {
            if (!acc[mime]) {
              acc[mime] = [];
            }
            acc[mime].push(ext);
          }
          return acc;
        }, {} as Record<string, string[]>)
      : undefined,
    maxFiles,
    maxSize,
    noClick: true,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group",
          isDragActive
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.02]"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500",
          "bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-xl"
        )}
        aria-label="File drop area"
      >
        <input {...getInputProps()} aria-label="File input" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className={cn(
            "absolute top-4 right-4 transition-all duration-500",
            isDragActive ? "scale-125 text-blue-500" : "scale-100 text-gray-300"
          )}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div className={cn(
            "absolute bottom-4 left-4 transition-all duration-500",
            isDragActive ? "scale-125 text-blue-500" : "scale-100 text-gray-300"
          )}>
            <Upload className="w-5 h-5" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragActive
              ? "bg-blue-500 scale-110 shadow-lg"
              : "bg-gray-100 dark:bg-gray-800 hover:scale-105"
          )}>
            {isDragActive ? (
              <Upload className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <FolderOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isDragActive ? "Drop files here" : "Drop files or click to browse"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {acceptedTypes
                ? `Supports: ${acceptedTypes.join(", ")}`
                : "All file types supported"}
            </p>
            <p className="text-sm text-gray-400">
              Max {maxFiles} files • Up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>

            {acceptedTypes && acceptedTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center pt-1" aria-label="Accepted file types">
                {acceptedTypes.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={open} className="bg-gradient-to-r from-blue-600 to-indigo-600" aria-label="Browse files">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            {files.length > 0 && (
              <Button variant="outline" onClick={clearAll} aria-label="Clear selected files">
                Clear All ({files.length})
              </Button>
            )}
          </div>

          {files.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Selected {files.length} file{files.length > 1 ? "s" : ""} • {humanSize(totalSize)}
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-x-4 bottom-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Progress value={uploadProgress} className="h-2" aria-label="Uploading progress" />
                </div>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {showPreviews && files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
