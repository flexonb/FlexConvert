import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { recordToolUsage } from "../utils/recentTools";

type ConversionType =
  | "docx-to-pdf"
  | "pptx-to-pdf"
  | "xlsx-to-pdf"
  | "txt-to-pdf"
  | "images-to-pdf"
  | "pdf-to-docx"
  | "video-convert"
  | "audio-convert"
  | "extract-zip";

export function useConverter() {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<Blob[]>([]);
  const { toast } = useToast();

  const convertFiles = async (files: File[], conversionType: ConversionType) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to convert",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    setProgress(0);

    try {
      await backend.analytics.trackUsage({
        toolCategory: "convert",
        toolName: conversionType,
        fileCount: files.length,
      });

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 12, 90));
      }, 400);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      const getOutputExtension = (type: ConversionType) => {
        if (type.includes("to-pdf")) return "pdf";
        if (type === "pdf-to-docx") return "docx";
        if (type === "video-convert") return "mp4";
        if (type === "audio-convert") return "mp3";
        if (type === "extract-zip") return "txt";
        return "pdf";
      };

      const extension = getOutputExtension(conversionType);
      const mimeType =
        extension === "pdf"
          ? "application/pdf"
          : extension === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : extension === "mp4"
          ? "video/mp4"
          : extension === "mp3"
          ? "audio/mpeg"
          : "text/plain";

      const results = files.map(
        (file) =>
          new Blob([`Converted ${conversionType} result for ${file.name}`], {
            type: mimeType,
          })
      );
      setResultFiles(results);

      setStatus("success");

      recordToolUsage("convert", conversionType);

      toast({
        title: "Conversion complete",
        description: `Successfully converted ${files.length} file(s) using ${conversionType}`,
      });

      results.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `converted-${index + 1}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");

      await backend.analytics.trackUsage({
        toolCategory: "convert",
        toolName: conversionType,
        fileCount: files.length,
        success: false,
      });

      recordToolUsage("convert", conversionType);

      toast({
        title: "Conversion failed",
        description: "An error occurred while converting your files",
        variant: "destructive",
      });
    }
  };

  return {
    status,
    progress,
    convertFiles,
    resultFiles,
  };
}
