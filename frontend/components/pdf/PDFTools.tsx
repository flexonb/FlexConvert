import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Scissors,
  Merge,
  Archive,
  RotateCw,
  Move,
  Plus,
  Minus,
  Droplets,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "../shared/FileDropZone";
import ProcessingStatus from "../shared/ProcessingStatus";
import PDFConfigDialog from "./PDFConfigDialog";
import { usePDFProcessor } from "../../hooks/usePDFProcessor";
import ToolCard from "../shared/ToolCard";
import SelectedFilesList from "../shared/SelectedFilesList";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PDFTools() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, progress, processFiles, downloadResult, needsConfig, pdfInfo, handleConfigConfirm, cancelConfig } =
    usePDFProcessor();

  const pdfTools = [
    {
      id: "merge",
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one",
      icon: Merge,
      minFiles: 2,
      maxFiles: 10,
      action: () => processFiles(files, "merge"),
    },
    {
      id: "split",
      title: "Split PDF",
      description: "Split a PDF into individual pages",
      icon: Scissors,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "split"),
    },
    {
      id: "compress",
      title: "Compress PDF",
      description: "Reduce PDF file size",
      icon: Archive,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "compress"),
    },
    {
      id: "rotate",
      title: "Rotate Pages",
      description: "Rotate PDF pages by angle",
      icon: RotateCw,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "rotate"),
    },
    {
      id: "reorder",
      title: "Reorder Pages",
      description: "Change the order of PDF pages",
      icon: Move,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "reorder"),
    },
    {
      id: "add-pages",
      title: "Add Pages",
      description: "Insert blank pages into PDF",
      icon: Plus,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "add-pages"),
    },
    {
      id: "remove-pages",
      title: "Remove Pages",
      description: "Delete specific pages from PDF",
      icon: Minus,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "remove-pages"),
    },
    {
      id: "watermark",
      title: "Add Watermark",
      description: "Add text watermark to pages",
      icon: Droplets,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "watermark"),
    },
    {
      id: "to-images",
      title: "PDF to Images",
      description: "Convert PDF pages to JPG/PNG",
      icon: ImageIcon,
      minFiles: 1,
      maxFiles: 1,
      action: () => processFiles(files, "to-images"),
    },
  ];

  const isToolDisabled = (tool: any) => {
    if (status === "processing") return true;
    if (files.length < tool.minFiles) return true;
    if (files.length > tool.maxFiles) return true;
    return false;
  };

  const getToolButtonText = (tool: any) => {
    if (files.length < tool.minFiles) {
      return `Need ${tool.minFiles}+`;
    }
    if (files.length > tool.maxFiles) {
      return `Max ${tool.maxFiles}`;
    }
    return "Process";
  };

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearFiles = () => setFiles([]);

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            PDF Processing Tools
          </CardTitle>
          <CardDescription>Select PDF files and choose a tool to process them. All processing happens locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropZone onFilesSelected={setFiles} acceptedTypes={["application/pdf"]} maxFiles={10} className="mb-4" />

          {files.length > 0 && (
            <SelectedFilesList files={files} onRemove={removeFileAt} accent="blue" label="Selected PDFs" />
          )}

          <ProcessingStatus status={status} progress={progress} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {pdfTools.map((tool) => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                accent="blue"
                onClick={tool.action}
                disabled={isToolDisabled(tool)}
                buttonText={getToolButtonText(tool)}
                buttonVariant={isToolDisabled(tool) ? "outline" : "default"}
                meta={tool.minFiles === tool.maxFiles ? `Requires ${tool.minFiles} file${tool.minFiles > 1 ? "s" : ""}` : `Requires ${tool.minFiles}-${tool.maxFiles} files`}
              />
            ))}
          </div>

          {files.length > 0 && pdfInfo?.pageCount && (
            <div className="flex justify-end mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-600 dark:text-gray-400 underline underline-offset-2 cursor-default">PDF Info</div>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  <div>Pages: {pdfInfo.pageCount}</div>
                  {pdfInfo.title && <div>Title: {pdfInfo.title}</div>}
                  {pdfInfo.author && <div>Author: {pdfInfo.author}</div>}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {files.length > 0 && (
            <div className="flex justify-between mt-2">
              <Button size="sm" variant="outline" onClick={clearFiles}>Clear Files</Button>
              {status === "success" && <Button size="sm" onClick={downloadResult}>Download Result</Button>}
            </div>
          )}
        </CardContent>
      </Card>

      {needsConfig && (
        <PDFConfigDialog
          open={true}
          onOpenChange={(open) => !open && cancelConfig()}
          operation={needsConfig.operation}
          pageCount={pdfInfo?.pageCount}
          onConfirm={handleConfigConfirm}
        />
      )}
    </div>
  );
}
