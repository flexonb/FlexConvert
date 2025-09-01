import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Eye, Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AdvancedDropZone from "../shared/AdvancedDropZone";
import ProcessingStatus from "../shared/ProcessingStatus";

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

    try {
      // Simulate OCR processing (in real implementation, this would use Tesseract.js or similar)
      const processedResults: OCRResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 0.5) / files.length) * 100);
        
        // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock OCR result
        const mockText = `Extracted text from ${file.name}:\n\nThis is sample text that would be extracted from the image using OCR technology. The actual implementation would use a library like Tesseract.js to perform real optical character recognition.\n\nKey features:\n• Text recognition\n• Multiple language support\n• Confidence scoring\n• Layout preservation`;
        
        processedResults.push({
          text: mockText,
          confidence: 0.85 + Math.random() * 0.15,
          language: "en"
        });
        
        setProgress(((i + 1) / files.length) * 100);
      }

      setResults(processedResults);
      setStatus("success");
      
      toast({
        title: "OCR processing complete",
        description: `Successfully extracted text from ${files.length} file(s)`,
      });
    } catch (error) {
      console.error("OCR error:", error);
      setStatus("error");
      toast({
        title: "OCR processing failed",
        description: "An error occurred while processing your files",
        variant: "destructive",
      });
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
    a.download = `${filename}_extracted.txt`;
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
            Extract text from images and scanned documents. Supports multiple languages and formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedDropZone 
            onFilesSelected={setFiles} 
            acceptedTypes={acceptedTypes}
            maxFiles={5}
            className="mb-4"
          />

          <ProcessingStatus status={status} progress={progress} />

          <div className="flex gap-3">
            <Button 
              onClick={processOCR}
              disabled={files.length === 0 || status === "processing"}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Extract Text
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
                  <CardTitle className="text-lg">
                    Extracted Text - File {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
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
