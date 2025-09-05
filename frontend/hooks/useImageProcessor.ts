import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { recordToolUsage } from "../utils/recentTools";
import {
  adjustImage,
  compressImage,
  convertFormat,
  cropImage,
  flipImage,
  grayscaleImage,
  resizeImage,
  rotateImage,
  textOverlay,
  enhanceImage,
  type ImageOperation,
} from "../utils/imageProcessor";

export function useImageProcessor() {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{ blob: Blob; operation: ImageOperation; originalName: string }[]>([]);
  const { toast } = useToast();

  const updateProgress = (val: number) => setProgress(Math.max(0, Math.min(100, Math.round(val))));

  const processFiles = async (files: File[], operation: ImageOperation, options?: any) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image file",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    updateProgress(0);
    setResultFiles([]);

    try {
      const results: { blob: Blob; operation: ImageOperation; originalName: string }[] = [];
      let i = 0;

      for (const file of files) {
        i++;
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not an image file.`);
        }

        let blob: Blob;
        switch (operation) {
          case "enhance":
            blob = await enhanceImage(file, options);
            break;
          case "resize":
            blob = await resizeImage(file, options);
            break;
          case "crop":
            blob = await cropImage(file, options);
            break;
          case "compress":
            blob = await compressImage(file, options);
            break;
          case "rotate":
            blob = await rotateImage(file, options);
            break;
          case "flip":
            blob = await flipImage(file, options);
            break;
          case "convert":
            blob = await convertFormat(file, options);
            break;
          case "grayscale":
            blob = await grayscaleImage(file);
            break;
          case "adjust":
            blob = await adjustImage(file, options);
            break;
          case "text-overlay":
            blob = await textOverlay(file, options);
            break;
          default:
            throw new Error(`Unsupported operation: ${operation as string}`);
        }

        results.push({ blob, operation, originalName: file.name });
        updateProgress((i / files.length) * 100);
      }

      setResultFiles(results);
      setStatus("success");

      recordToolUsage("image", operation);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${files.length} image(s). Ready to download.`,
      });

    } catch (error) {
      console.error("Image processing error:", error);
      setStatus("error");

      recordToolUsage("image", operation);

      toast({
        title: "Processing failed",
        description:
          error instanceof Error ? error.message : "An error occurred while processing your image files",
        variant: "destructive",
      });
    }
  };

  const downloadResults = () => {
    if (resultFiles.length === 0) return;

    resultFiles.forEach(({ blob, operation, originalName }, index) => {
      const url = URL.createObjectURL(blob);
      const ext = blob.type.split('/')[1] || 'jpg';
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}-${operation}-${index + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return {
    status,
    progress,
    processFiles,
    resultFiles,
    downloadResults,
  };
}
