import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { PDFProcessor, PDFProcessingOptions } from "../utils/pdfProcessor";
import { recordToolUsage } from "../utils/recentTools";

type PDFOperation =
  | "merge"
  | "split"
  | "compress"
  | "rotate"
  | "reorder"
  | "add-pages"
  | "remove-pages"
  | "watermark"
  | "to-images"
  | "extract-range";

export function usePDFProcessor() {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultBlobs, setResultBlobs] = useState<Blob[]>([]);
  const [needsConfig, setNeedsConfig] = useState<{ operation: PDFOperation; files: File[] } | null>(null);
  const [pdfInfo, setPdfInfo] = useState<any>(null);
  const { toast } = useToast();

  const processFiles = async (files: File[], operation: PDFOperation, options?: PDFProcessingOptions) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: `"${file.name}" is not a PDF file. Please select only PDF files.`,
          variant: "destructive",
        });
        return;
      }
    }

    const configRequiredOps = ["rotate", "watermark", "to-images", "remove-pages", "add-pages", "reorder", "extract-range"];
    if (configRequiredOps.includes(operation) && !options) {
      try {
        const info = await PDFProcessor.getPDFInfo(files[0]);
        setPdfInfo(info);
        setNeedsConfig({ operation, files });
        return;
      } catch (error) {
        console.error("Error getting PDF info:", error);
        toast({
          title: "Error reading PDF",
          description: error instanceof Error ? error.message : "Could not read PDF file information",
          variant: "destructive",
        });
        return;
      }
    }

    setStatus("processing");
    setProgress(0);
    setResultBlob(null);
    setResultBlobs([]);

    try {
      await backend.analytics.trackUsage({
        toolCategory: "pdf",
        toolName: operation,
        fileCount: files.length,
      });

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 100);

      let result: Blob | Blob[] | null = null;

      try {
        switch (operation) {
          case "merge":
            result = await PDFProcessor.mergePDFs(files);
            break;
          case "split":
            result = await PDFProcessor.splitPDF(files[0]);
            break;
          case "compress":
            result = await PDFProcessor.compressPDF(files[0], options);
            break;
          case "rotate":
            result = await PDFProcessor.rotatePDF(files[0], options!);
            break;
          case "reorder":
            result = await PDFProcessor.reorderPDF(files[0], options!);
            break;
          case "add-pages":
            result = await PDFProcessor.addPages(files[0], options!);
            break;
          case "remove-pages":
            result = await PDFProcessor.removePages(files[0], options!);
            break;
          case "watermark":
            result = await PDFProcessor.addWatermark(files[0], options!);
            break;
          case "to-images":
            result = await PDFProcessor.convertToImages(files[0], options);
            break;
          case "extract-range":
            result = await PDFProcessor.extractPages(files[0], options!);
            break;
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }
      } catch (processingError) {
        clearInterval(progressInterval);
        throw processingError;
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (Array.isArray(result)) {
        setResultBlobs(result);
        result.forEach((blob, index) => {
          setTimeout(() => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            if (operation === "split") {
              a.download = `${files[0].name.replace(".pdf", "")}_page_${index + 1}.pdf`;
            } else if (operation === "to-images") {
              const ext = options?.imageFormat || "png";
              a.download = `${files[0].name.replace(".pdf", "")}_page_${index + 1}.${ext}`;
            } else {
              a.download = `processed_${index + 1}.pdf`;
            }
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, index * 100);
        });
      } else if (result) {
        setResultBlob(result);
        const url = URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = getOutputFilename(operation, files[0].name, options);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setStatus("success");

      recordToolUsage("pdf", operation);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${files.length} file(s) with ${operation}. ${Array.isArray(result) ? `${result.length} files generated.` : ""}`,
      });
    } catch (error) {
      console.error("PDF processing error:", error);
      setStatus("error");

      try {
        await backend.analytics.trackUsage({
          toolCategory: "pdf",
          toolName: operation,
          fileCount: files.length,
          success: false,
        });
      } catch (e) {
        console.error("Failed to track usage:", e);
      }

      recordToolUsage("pdf", operation);

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred while processing your PDF files";

      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const downloadResult = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleConfigConfirm = (options: PDFProcessingOptions) => {
    if (needsConfig) {
      processFiles(needsConfig.files, needsConfig.operation, options);
      setNeedsConfig(null);
    }
  };

  const cancelConfig = () => {
    setNeedsConfig(null);
  };

  return {
    status,
    progress,
    processFiles,
    downloadResult,
    resultBlob,
    resultBlobs,
    needsConfig,
    pdfInfo,
    handleConfigConfirm,
    cancelConfig,
  };
}

function getOutputFilename(operation: PDFOperation, originalName: string, options?: PDFProcessingOptions): string {
  const baseName = originalName.replace(/\.pdf$/i, "");
  switch (operation) {
    case "merge":
      return "merged.pdf";
    case "compress":
      return `${baseName}_compressed.pdf`;
    case "rotate":
      return `${baseName}_rotated.pdf`;
    case "reorder":
      return `${baseName}_reordered.pdf`;
    case "add-pages":
      return `${baseName}_with_pages.pdf`;
    case "remove-pages":
      return `${baseName}_pages_removed.pdf`;
    case "watermark":
      return `${baseName}_watermarked.pdf`;
    case "extract-range": {
      const s = (options?.pageRange?.start ?? 0) + 1;
      const e = (options?.pageRange?.end ?? 0) + 1;
      return `${baseName}_pages_${s}-${e}.pdf`;
    }
    default:
      return `${baseName}_processed.pdf`;
  }
}
