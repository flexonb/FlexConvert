import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Eye, Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AdvancedDropZone from "../shared/AdvancedDropZone";
import ProcessingStatus from "../shared/ProcessingStatus";
import { createWorker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export default function OCRTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  const processOCR = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image file for OCR processing",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    setProgress(0);
    setResults([]);
    setStatusMessage("Initializing OCR worker...");

    const worker = await createWorker({
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress * 100);
        }
        setStatusMessage(m.status);
      },
    });

    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const processedResults: OCRResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusMessage(`Recognizing text in ${file.name}...`);
        const { data } = await worker.recognize(file);
        
        processedResults.push({
          text: data.text,
          confidence: data.confidence,
          language: data.lang,
        });
      }

      setResults(processedResults);
      setStatus("success");
      setStatusMessage("Processing complete!");
      
      toast({
        title: "OCR processing complete",
        description: `Successfully extracted text from ${files.length} file(s)`,
      });
    } catch (error) {
      console.error("OCR error:", error);
      setStatus("error");
      setStatusMessage("An error occurred during OCR processing.");
      toast({
        title: "OCR processing failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your files",
        variant: "destructive",
      });
    } finally {
      await worker.terminate();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            OCR - Optical Character Recognition
          </CardTitle>
          <CardDescription>
            Extract text from images and scanned documents. Powered by Tesseract.js.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedDropZone 
            onFilesSelected={setFiles} 
            acceptedTypes={acceptedTypes}
            maxFiles={5}
            className="mb-4"
          />

          <ProcessingStatus status={status} progress={progress} message={statusMessage} />

          <div className="flex gap-3">
            <Button 
              onClick={processOCR}
              disabled={files.length === 0 || status === "processing"}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              {status === "processing" ? "Processing..." : "Extract Text"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index} className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate" title={files[index]?.name}>
                    Extracted Text - {files[index]?.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                    <span>Confidence: {(result.confidence).toFixed(1)}%</span>
                    <span>Lang: {result.language.toUpperCase()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={result.text}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.text)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(result.text, files[index]?.name || `file_${index + 1}`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
