import React, { useCallback, useEffect, useId } from "react";
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

  const typeMatchesAccepted = (mimeOrExt: string) => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;
    // Exact MIME match
    if (acceptedTypes.includes(mimeOrExt)) return true;

    // If given a MIME, try to map to extension and compare against .ext accepted types
    if (mimeOrExt.includes("/")) {
      const ext = mimeOrExt.split("/")[1];
      if (ext && acceptedTypes.some((t) => t.startsWith(".") && t.slice(1).toLowerCase() === ext.toLowerCase())) {
        return true;
      }
    } else if (mimeOrExt.startsWith(".")) {
      // If given an extension, see if list contains it (or MIME with same ext)
      if (acceptedTypes.some((t) => t.toLowerCase() === mimeOrExt.toLowerCase())) return true;
    }

    return false;
  };

  const extFromMime = (mime: string) => {
    const map: Record<string, string> = {
      "application/pdf": "pdf",
      "text/plain": "txt",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/bmp": "bmp",
    };
    return map[mime] || (mime.includes("/") ? mime.split("/")[1] : "bin");
  };

  // Process ClipboardItem[] from async Clipboard API
  async function processClipboardItems(items: ClipboardItem[]): Promise<File[]> {
    const result: File[] = [];
    for (const item of items) {
      for (const type of item.types) {
        try {
          const blob = await item.getType(type);
          const ext = extFromMime(type);
          if (acceptedTypes && !typeMatchesAccepted(type) && !typeMatchesAccepted("." + ext)) {
            continue;
          }
          const file = new File([blob], `pasted-${Date.now()}.${ext}`, { type });
          result.push(file);
        } catch {
          // ignore this type
        }
      }
    }
    return result;
  }

  // Process DataTransfer (from onPaste event)
  async function processDataTransfer(dt: DataTransfer | null): Promise<File[]> {
    if (!dt) return [];
    const out: File[] = [];

    // Prefer files (images) first
    const items = Array.from(dt.items || []);
    for (const it of items) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) {
          if (!acceptedTypes || typeMatchesAccepted(f.type)) {
            out.push(f);
          }
        }
      }
    }

    // If we didn't get files, try text/plain
    if (out.length === 0) {
      const textItem = items.find((i) => i.kind === "string" && i.type === "text/plain");
      if (textItem) {
        const text = await new Promise<string>((resolve) => {
          textItem.getAsString((s) => resolve(s));
        });
        const blob = new Blob([text], { type: "text/plain" });
        const file = new File([blob], `pasted-${Date.now()}.txt`, { type: "text/plain" });
        if (!acceptedTypes || typeMatchesAccepted("text/plain") || typeMatchesAccepted(".txt")) {
          out.push(file);
        }
      }
    }

    return out;
  }

  const handlePasteFromClipboard = async () => {
    if (!enablePaste) return;
    try {
      // Try modern async Clipboard API for rich content (images, etc.)
      // @ts-ignore
      if (navigator.clipboard && navigator.clipboard.read) {
        // @ts-ignore
        const items: ClipboardItem[] = await navigator.clipboard.read();
        const files = await processClipboardItems(items);
        if (files.length > 0) {
          onFilesSelected(files);
          toast({
            title: "Pasted from clipboard",
            description: `Added ${files.length} file(s) from clipboard`,
          });
          return;
        }
      }

      // Fallback: plain text read
      // @ts-ignore
      if (navigator.clipboard && navigator.clipboard.readText) {
        // @ts-ignore
        const text: string = await navigator.clipboard.readText();
        if (text && text.length > 0) {
          const file = new File([text], `pasted-${Date.now()}.txt`, { type: "text/plain" });
          if (!acceptedTypes || typeMatchesAccepted("text/plain") || typeMatchesAccepted(".txt")) {
            onFilesSelected([file]);
            toast({
              title: "Pasted text",
              description: "Added 1 file from clipboard text",
            });
            return;
          }
        }
      }

      // If we reach here, prompt user to press Ctrl/Cmd+V inside the dropzone
      toast({
        title: "Paste not available",
        description: "Press Ctrl+V (or ⌘V) while the dropzone is focused to paste images/text.",
      });
    } catch (err) {
      console.error("Clipboard paste error:", err);
      toast({
        title: "Paste failed",
        description: "Your browser blocked clipboard access or it isn't supported. Try Ctrl+V in the dropzone.",
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

  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    open();
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = async (e) => {
    if (!enablePaste) return;
    try {
      const files = await processDataTransfer(e.clipboardData);
      if (files.length > 0) {
        e.preventDefault();
        onFilesSelected(files);
        toast({
          title: "Pasted from clipboard",
          description: `Added ${files.length} file(s) from clipboard`,
        });
      }
    } catch (err) {
      console.error("Paste (onPaste) error:", err);
      toast({
        title: "Paste failed",
        description: "Could not read from clipboard.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!enablePaste) return;

    const isEditable = (el: Element | null) => {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return true;
      const editable = (el as HTMLElement).isContentEditable;
      return Boolean(editable);
    };

    const onWindowPaste = async (e: ClipboardEvent) => {
      try {
        // Only intercept if not typing in an input/textarea/contenteditable
        if (isEditable(document.activeElement)) return;

        const files = await processDataTransfer(e.clipboardData || null);
        if (files.length > 0) {
          e.preventDefault();
          onFilesSelected(files);
          toast({
            title: "Pasted from clipboard",
            description: `Added ${files.length} file(s) from clipboard`,
          });
        }
      } catch (err) {
        console.error("Window paste error:", err);
      }
    };

    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [enablePaste, acceptedTypes, onFilesSelected, toast]);

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
      onPaste={handlePaste}
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
            <p className="text-gray-500 dark:text-gray-400">or choose files to get started</p>
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
            <p>{acceptedTypes ? `Supports: ${acceptedTypes.join(", ")}` : "All file types supported"}</p>
            {maxFiles > 1 && <p>Maximum {maxFiles} files • No size limits in browser</p>}
            {enablePaste && (
              <p>Tip: Click this area and press Ctrl+V (or ⌘V) to paste images or text from clipboard.</p>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-blue-500/10" />
      </div>
    </div>
  );
}
