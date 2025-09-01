import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, FileText, Image, File, Video, Music, Archive } from "lucide-react";
import ProcessingStatus from "../shared/ProcessingStatus";
import { useConverter } from "../../hooks/useConverter";
import ToolCard from "../shared/ToolCard";
import AdvancedDropZone from "../shared/AdvancedDropZone";

export default function ConvertTools() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, progress, convertFiles } = useConverter();

  const converters = [
    { id: "docx-to-pdf", title: "DOCX → PDF", description: "Convert Word documents to PDF", icon: FileText, accepts: [".docx"], action: () => convertFiles(files, "docx-to-pdf") },
    { id: "pptx-to-pdf", title: "PPTX → PDF", description: "Convert PowerPoint to PDF", icon: FileText, accepts: [".pptx"], action: () => convertFiles(files, "pptx-to-pdf") },
    { id: "xlsx-to-pdf", title: "XLSX → PDF", description: "Convert Excel to PDF", icon: FileText, accepts: [".xlsx"], action: () => convertFiles(files, "xlsx-to-pdf") },
    { id: "txt-to-pdf", title: "TXT → PDF", description: "Convert text files to PDF", icon: File, accepts: [".txt"], action: () => convertFiles(files, "txt-to-pdf") },
    { id: "images-to-pdf", title: "Images → PDF", description: "Combine images into a single PDF", icon: Image, accepts: [".jpg", ".jpeg", ".png", ".webp"], action: () => convertFiles(files, "images-to-pdf") },
    { id: "pdf-to-docx", title: "PDF → DOCX", description: "Convert PDF to Word (basic)", icon: FileText, accepts: [".pdf"], action: () => convertFiles(files, "pdf-to-docx") },
    { id: "video-convert", title: "Video Convert", description: "Convert between video formats", icon: Video, accepts: [".mp4", ".webm", ".avi", ".mov"], action: () => convertFiles(files, "video-convert") },
    { id: "audio-convert", title: "Audio Convert", description: "Convert between audio formats", icon: Music, accepts: [".mp3", ".wav", ".ogg", ".m4a"], action: () => convertFiles(files, "audio-convert") },
    { id: "extract-zip", title: "Extract Archive", description: "Extract ZIP/RAR files", icon: Archive, accepts: [".zip", ".rar"], action: () => convertFiles(files, "extract-zip") },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            File Conversion Tools
          </CardTitle>
          <CardDescription>Convert between different file formats. All conversions happen locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedDropZone onFilesSelected={setFiles} maxFiles={10} className="mb-4" />

          <ProcessingStatus status={status} progress={progress} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {converters.map((converter) => (
              <ToolCard
                key={converter.id}
                icon={converter.icon}
                title={converter.title}
                description={converter.description}
                accent="purple"
                accepts={converter.accepts}
                onClick={converter.action}
                disabled={files.length === 0 || status === "processing"}
                buttonText="Convert"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
