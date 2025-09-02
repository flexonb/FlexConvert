import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, FileText, Image, File, Archive } from "lucide-react";
import ProcessingStatus from "../shared/ProcessingStatus";
import { useConverter } from "../../hooks/useConverter";
import ToolCard from "../shared/ToolCard";
import AdvancedDropZone from "../shared/AdvancedDropZone";
import StepIndicator, { type Step } from "../shared/StepIndicator";
import { useToast } from "@/components/ui/use-toast";

type ConverterId =
  | "docx-to-pdf"
  | "pptx-to-pdf"
  | "xlsx-to-pdf"
  | "txt-to-pdf"
  | "images-to-pdf"
  | "pdf-to-docx"
  | "extract-zip";

interface ConverterDef {
  id: ConverterId;
  title: string;
  description: string;
  icon: any;
  exts: string[]; // file extensions including dot, lowercased
}

const ALL_ACCEPTED_EXTS = [
  ".docx",
  ".pptx",
  ".xlsx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".zip",
];

export default function ConvertTools() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, progress, convertFiles } = useConverter();
  const { toast } = useToast();

  const converters: ConverterDef[] = [
    { id: "docx-to-pdf", title: "DOCX → PDF", description: "Convert Word documents to PDF", icon: FileText, exts: [".docx"] },
    { id: "pptx-to-pdf", title: "PPTX → PDF", description: "Convert PowerPoint to PDF", icon: FileText, exts: [".pptx"] },
    { id: "xlsx-to-pdf", title: "XLSX → PDF", description: "Convert Excel to PDF", icon: FileText, exts: [".xlsx"] },
    { id: "txt-to-pdf", title: "TXT → PDF", description: "Convert text files to PDF", icon: File, exts: [".txt"] },
    { id: "images-to-pdf", title: "Images → PDF", description: "Combine images into a single PDF", icon: Image, exts: [".jpg", ".jpeg", ".png", ".webp"] },
    { id: "pdf-to-docx", title: "PDF → DOCX", description: "Convert PDF to Word (basic)", icon: FileText, exts: [".pdf"] },
    { id: "extract-zip", title: "Extract ZIP", description: "Extract .zip archive files", icon: Archive, exts: [".zip"] },
  ];

  const stage: "select" | "process" | "download" = useMemo(() => {
    if (files.length === 0) return "select";
    if (status === "processing") return "process";
    if (status === "success") return "download";
    return "process";
  }, [files.length, status]);

  const steps: Step[] = useMemo(() => {
    return [
      { id: "select", label: "Select Files", status: stage === "select" ? "current" : "complete" },
      { id: "process", label: "Convert", status: stage === "process" ? "current" : (stage === "download" ? "complete" : "upcoming") },
      { id: "download", label: "Download", status: stage === "download" ? "current" : "upcoming" },
    ];
  }, [stage]);

  const fileExt = (f: File) => {
    const m = /\.([^.]+)$/.exec(f.name);
    return m ? `.${m[1].toLowerCase()}` : "";
    };

  const supportedCountFor = (conv: ConverterDef) => {
    return files.filter(f => conv.exts.includes(fileExt(f))).length;
  };

  const runConverter = (conv: ConverterDef) => {
    const supported = files.filter(f => conv.exts.includes(fileExt(f)));
    const skipped = files.filter(f => !conv.exts.includes(fileExt(f)));
    if (supported.length === 0) {
      toast({
        title: "No supported files selected",
        description: `This tool supports: ${conv.exts.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    if (skipped.length > 0) {
      toast({
        title: "Some files were skipped",
        description: `Skipped ${skipped.length} unsupported file(s). Supported: ${conv.exts.join(", ")}`,
      });
    }
    convertFiles(supported, conv.id as any);
  };

  const buttonTextFor = (conv: ConverterDef) => {
    if (files.length === 0) return "Select files";
    const count = supportedCountFor(conv);
    if (count === 0) return "No supported files";
    return "Convert";
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            File Conversion Tools
          </CardTitle>
          <CardDescription>Only fully supported, in-browser conversions are shown. All processing happens locally.</CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator steps={steps} className="mb-4" />

          <AdvancedDropZone
            onFilesSelected={setFiles}
            acceptedTypes={ALL_ACCEPTED_EXTS}
            maxFiles={20}
            className="mb-4"
          />

          <ProcessingStatus status={status} progress={progress} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {converters.map((converter) => {
              const supported = supportedCountFor(converter);
              const disabled = status === "processing" || (files.length > 0 && supported === 0);
              return (
                <ToolCard
                  key={converter.id}
                  icon={converter.icon}
                  title={converter.title}
                  description={converter.description}
                  accent="purple"
                  accepts={converter.exts}
                  onClick={() => runConverter(converter)}
                  disabled={disabled}
                  buttonText={buttonTextFor(converter)}
                  buttonVariant={disabled && files.length > 0 ? "outline" : "default"}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
