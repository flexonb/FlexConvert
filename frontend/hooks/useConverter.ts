import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { recordToolUsage } from "../utils/recentTools";
import {
  convertAudio,
  convertVideo,
  docxToPdf,
  imagesToPdf,
  pdfToDocx,
  pptxToPdf,
  txtToPdf,
  xlsxToPdf,
  extractZip,
} from "../utils/fileConverters";

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
    setResultFiles([]);

    try {
      await backend.analytics.trackUsage({
        toolCategory: "convert",
        toolName: conversionType,
        fileCount: files.length,
      });

      const results: { blob: Blob; suggestedName: string }[] = [];
      const update = (v: number) => setProgress(Math.max(0, Math.min(100, Math.round(v))));

      switch (conversionType) {
        case "txt-to-pdf": {
          const out = await txtToPdf(files, update);
          results.push(...out);
          break;
        }
        case "images-to-pdf": {
          const out = await imagesToPdf(files, update);
          results.push(...out);
          break;
        }
        case "docx-to-pdf": {
          const out = await docxToPdf(files, update);
          results.push(...out);
          break;
        }
        case "xlsx-to-pdf": {
          const out = await xlsxToPdf(files, update);
          results.push(...out);
          break;
        }
        case "pptx-to-pdf": {
          const out = await pptxToPdf(files, update);
          results.push(...out);
          break;
        }
        case "pdf-to-docx": {
          const out = await pdfToDocx(files, update);
          results.push(...out);
          break;
        }
        case "video-convert": {
          let i = 0;
          for (const f of files) {
            const { blob, ext } = await convertVideo(f, (p) => {
              // distribute progress across files
              const base = (i / files.length) * 100;
              update(base + (p / files.length));
            });
            i++;
            const baseName = f.name.replace(/\.[^/.]+$/, "");
            results.push({ blob, suggestedName: `${baseName}.webm` });
            update((i / files.length) * 100);
          }
          break;
        }
        case "audio-convert": {
          let i = 0;
          for (const f of files) {
            const { blob, ext } = await convertAudio(f, (p) => {
              const base = (i / files.length) * 100;
              update(base + (p / files.length));
            });
            i++;
            const baseName = f.name.replace(/\.[^/.]+$/, "");
            results.push({ blob, suggestedName: `${baseName}.${ext}` });
            update((i / files.length) * 100);
          }
          break;
        }
        case "extract-zip": {
          const out = await extractZip(files, update);
          results.push(...out);
          break;
        }
        default:
          throw new Error(`Unsupported conversion type: ${conversionType}`);
      }

      setResultFiles(results.map((r) => r.blob));
      setProgress(100);
      setStatus("success");

      recordToolUsage("convert", conversionType);

      toast({
        title: "Conversion complete",
        description: `Successfully converted ${files.length} file(s) using ${conversionType}`,
      });

      // Auto-download
      results.forEach(({ blob, suggestedName }, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName || `converted-${index + 1}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");

      try {
        await backend.analytics.trackUsage({
          toolCategory: "convert",
          toolName: conversionType,
          fileCount: files.length,
          success: false,
        });
      } catch (e) {
        console.error("Failed to track usage:", e);
      }

      recordToolUsage("convert", conversionType);

      let message = "An unknown error occurred during conversion.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message);
      }

      toast({
        title: "Conversion failed",
        description: message,
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
