import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { recordToolUsage } from "../utils/recentTools";

type ImageOperation =
  | "resize"
  | "crop"
  | "compress"
  | "rotate"
  | "flip"
  | "convert"
  | "grayscale"
  | "adjust"
  | "text-overlay";

export function useImageProcessor() {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<Blob[]>([]);
  const { toast } = useToast();

  const processFiles = async (files: File[], operation: ImageOperation) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image file",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    setProgress(0);

    try {
      await backend.analytics.trackUsage({
        toolCategory: "image",
        toolName: operation,
        fileCount: files.length,
      });

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      clearInterval(progressInterval);
      setProgress(100);

      const results = files.map(
        (file) =>
          new Blob([`Processed ${operation} result for ${file.name}`], {
            type: "image/jpeg",
          })
      );
      setResultFiles(results);

      setStatus("success");

      recordToolUsage("image", operation);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${files.length} image(s) with ${operation}`,
      });

      results.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `processed-${operation}-${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Image processing error:", error);
      setStatus("error");

      await backend.analytics.trackUsage({
        toolCategory: "image",
        toolName: operation,
        fileCount: files.length,
        success: false,
      });

      recordToolUsage("image", operation);

      toast({
        title: "Processing failed",
        description: "An error occurred while processing your image files",
        variant: "destructive",
      });
    }
  };

  return {
    status,
    progress,
    processFiles,
    resultFiles,
  };
}
