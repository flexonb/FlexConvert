import React, { useCallback, useId } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ClipboardPaste, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
  enablePaste?: boolean;
}

export default function FileDropZone({
  onFilesSelected,
  acceptedTypes,
  maxFiles = 10,
  className,
  enablePaste = true,
}: FileDropZoneProps) {
  const { toast } = useToast();
  const titleId = useId();
  const descId = useId();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedTypes?.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    noClick: true,
  });

  const typeMatchesAccepted = (mime: string) => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;
    if (acceptedTypes.includes(mime)) return true;
    const ext = mime.split("/")[1];
    if (ext && acceptedTypes.some((t) => t.startsWith(".") && t.slice(1).toLowerCase() === ext.toLowerCase())) {
      return true;
    }
    return false;
  };

  const extFromMime = (mime: string) => {
    const map: Record<string, string> = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/bmp": "bmp",
    };
    return map[mime] || "bin";
  };

  const handlePasteFromClipboard = async () => {
    if (!enablePaste) return;
    try {
      // @ts-ignore navigator.clipboard.read may not exist in TS lib target
      if (!navigator.clipboard || !navigator.clipboard.read) {
        throw new Error("Clipboard API not supported in this browser");
      }
      // @ts-ignore
      const items: ClipboardItem[] = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        for (const type of item.types) {
          if (!typeMatchesAccepted(type)) continue;
          const blob = await item.getType(type);
          const ext = extFromMime(type);
          const file = new File([blob], `pasted-${Date.now()}.${ext}`, { type });
          files.push(file);
        }
      }
      if (files.length === 0) {
        toast({
          title: "Nothing to paste",
          description: "Clipboard doesn't contain supported files.",
        });
        return;
      }
      onFilesSelected(files);
      toast({
        title: "Pasted from clipboard",
        description: `Added ${files.length} file(s) from clipboard`,
      });
    } catch (err) {
      console.error("Clipboard paste error:", err);
      toast({
        title: "Paste failed",
        description: "Your browser blocked clipboard access or it isn't supported.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    open();
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
        "border-gray-300/60 dark:border-gray-600/60 hover:border-blue-400/60 dark:hover:border-blue-500/60",
        isDragActive 
          ? "border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 scale-[1.01]" 
          : "bg-white/60 dark:bg-gray-900/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/60",
        "backdrop-blur-xl shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        className
      )}
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-label="File upload area"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <input {...getInputProps()} aria-label="File input" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 rounded-2xl opacity-50" aria-hidden="true">
        <div className="absolute top-6 right-6">
          <Sparkles
            className={cn(
              "w-5 h-5 transition-all duration-300",
              isDragActive ? "text-blue-500 animate-pulse" : "text-gray-300 dark:text-gray-600"
            )}
          />
        </div>
        <div className="absolute bottom-6 left-6">
          <Plus
            className={cn(
              "w-4 h-4 transition-all duration-300",
              isDragActive ? "text-blue-500 animate-pulse" : "text-gray-300 dark:text-gray-600"
            )}
          />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-5 relative z-10">
        <div
          className={cn(
            "rounded-2xl p-5 transition-all duration-300",
            isDragActive 
              ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 scale-105 shadow-xl" 
              : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 hover:scale-105"
          )}
          aria-hidden="true"
        >
          {isDragActive ? (
            <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-bounce" />
          ) : (
            <FileText className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
              {isDragActive ? "Drop your files here" : "Drag & drop files here"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              or choose files to get started
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <Button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                open();
              }} 
              className="h-10 px-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Browse Files
            </Button>
            
            {enablePaste && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePasteFromClipboard();
                }} 
                className="h-10 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ClipboardPaste className="w-4 h-4 mr-2" />
                Paste
              </Button>
            )}
          </div>
          
          <div id={descId} className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
            <p>
              {acceptedTypes ? `Supports: ${acceptedTypes.join(", ")}` : "All file types supported"}
            </p>
            {maxFiles > 1 && (
              <p>Maximum {maxFiles} files • No size limits in browser</p>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-blue-500/10" />
      </div>
    </div>
  );
}
