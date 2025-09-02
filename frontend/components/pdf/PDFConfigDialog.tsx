import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PDFProcessingOptions } from "../../utils/pdfProcessor";

interface PDFConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: string;
  pageCount?: number;
  onConfirm: (options: PDFProcessingOptions) => void;
}

export default function PDFConfigDialog({
  open,
  onOpenChange,
  operation,
  pageCount = 1,
  onConfirm
}: PDFConfigDialogProps) {
  const [options, setOptions] = useState<PDFProcessingOptions>({
    rotation: 90,
    watermarkText: "",
    watermarkOpacity: 0.3,
    imageFormat: "png",
    pageOrder: [],
    insertPages: [],
    removePages: [],
    pageRange: { start: 0, end: pageCount - 1 }
  });
  
  const [validationError, setValidationError] = useState<string>("");

  // Keep derived defaults in sync when pageCount changes
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      pageRange: {
        start: prev.pageRange?.start ?? 0,
        end: Math.max(0, Math.min((prev.pageRange?.end ?? pageCount - 1), pageCount - 1)),
      }
    }));
  }, [pageCount]);

  const validateAndConfirm = () => {
    setValidationError("");
    
    // Validate based on operation
    switch (operation) {
      case "watermark":
        if (!options.watermarkText || options.watermarkText.trim().length === 0) {
          setValidationError("Watermark text is required");
          return;
        }
        break;
        
      case "reorder":
        if (!options.pageOrder || options.pageOrder.length === 0) {
          setValidationError("Page order must be specified");
          return;
        }
        if (options.pageOrder.length !== pageCount) {
          setValidationError(`Page order must contain exactly ${pageCount} page indices`);
          return;
        }
        // Validate indices
        if (options.pageOrder.some((idx) => idx < 0 || idx >= pageCount)) {
          setValidationError(`Invalid page index in order. Valid indices are 0-${pageCount - 1}.`);
          return;
        }
        break;
        
      case "remove-pages":
        if (!options.removePages || options.removePages.length === 0) {
          setValidationError("At least one page must be specified for removal");
          return;
        }
        if (options.removePages.length >= pageCount) {
          setValidationError("Cannot remove all pages. At least one page must remain");
          return;
        }
        if (options.removePages.some((idx) => idx < 0 || idx >= pageCount)) {
          setValidationError(`Invalid page index in removal list. Valid indices are 0-${pageCount - 1}.`);
          return;
        }
        break;
        
      case "add-pages":
        if (!options.insertPages || options.insertPages.length === 0) {
          setValidationError("Insert pages configuration is required");
          return;
        }
        break;

      case "extract-range":
        if (!options.pageRange) {
          setValidationError("Page range is required");
          return;
        }
        if (options.pageRange.start < 0 || options.pageRange.end >= pageCount || options.pageRange.start > options.pageRange.end) {
          setValidationError(`Invalid page range. Valid range is 1-${pageCount} (inclusive).`);
          return;
        }
        break;
    }
    
    onConfirm(options);
    onOpenChange(false);
  };

  const renderOperationConfig = () => {
    switch (operation) {
      case "rotate":
        return (
          <div className="space-y-4">
            <div>
              <Label>Rotation Angle</Label>
              <Select 
                value={options.rotation?.toString()} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, rotation: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select angle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90° Clockwise</SelectItem>
                  <SelectItem value="180">180°</SelectItem>
                  <SelectItem value="270">270° (90° Counter-clockwise)</SelectItem>
                  <SelectItem value="-90">90° Counter-clockwise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "watermark":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="watermark-text">Watermark Text *</Label>
              <Input
                id="watermark-text"
                value={options.watermarkText}
                onChange={(e) => setOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
                placeholder="Enter watermark text"
                className={validationError && !options.watermarkText?.trim() ? "border-red-500" : ""}
              />
            </div>
            <div>
              <Label>Opacity: {(options.watermarkOpacity || 0.3).toFixed(1)}</Label>
              <Slider
                value={[options.watermarkOpacity || 0.3]}
                onValueChange={([value]) => setOptions(prev => ({ ...prev, watermarkOpacity: value }))}
                min={0.1}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        );

      case "to-images":
        return (
          <div className="space-y-4">
            <div>
              <Label>Image Format</Label>
              <Select 
                value={options.imageFormat} 
                onValueChange={(value: "png" | "jpeg") => setOptions(prev => ({ ...prev, imageFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Higher Quality)</SelectItem>
                  <SelectItem value="jpeg">JPEG (Smaller Size)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "remove-pages":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="remove-pages">Pages to Remove (comma-separated, 1-indexed) *</Label>
              <Input
                id="remove-pages"
                placeholder="e.g., 1,3,5-7"
                onChange={(e) => {
                  const pages = parsePageNumbers(e.target.value, pageCount);
                  setOptions(prev => ({ ...prev, removePages: pages }));
                }}
                className={validationError && !options.removePages?.length ? "border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                Total pages: {pageCount}. Use format: 1,3,5 or 2-4 or 1,3-5,8
              </p>
            </div>
          </div>
        );

      case "add-pages":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="insert-position">Insert Position (0-indexed) *</Label>
              <Input
                id="insert-position"
                type="number"
                min="0"
                max={pageCount}
                defaultValue="0"
                onChange={(e) => {
                  const position = parseInt(e.target.value) || 0;
                  setOptions(prev => ({ 
                    ...prev, 
                    insertPages: [{ position, count: prev.insertPages?.[0]?.count || 1 }] 
                  }));
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Position 0 = beginning, {pageCount} = end
              </p>
            </div>
            <div>
              <Label htmlFor="page-count">Number of Pages to Add *</Label>
              <Input
                id="page-count"
                type="number"
                min="1"
                max="50"
                defaultValue="1"
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1;
                  setOptions(prev => ({ 
                    ...prev, 
                    insertPages: [{ position: prev.insertPages?.[0]?.position || 0, count }] 
                  }));
                }}
              />
            </div>
          </div>
        );

      case "reorder":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-order">New Page Order (comma-separated, 0-indexed) *</Label>
              <Input
                id="page-order"
                placeholder={`e.g., ${Array.from({length: Math.min(pageCount, 5)}, (_, i) => i).reverse().join(',')}${pageCount > 5 ? ",..." : ""}`}
                onChange={(e) => {
                  const order = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                  setOptions(prev => ({ ...prev, pageOrder: order }));
                }}
                className={validationError && !options.pageOrder?.length ? "border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                Total pages: {pageCount}. Use 0-indexed numbers: 0,1,2...{pageCount-1}
              </p>
              <p className="text-xs text-gray-500">
                Must include all {pageCount} pages in your desired order
              </p>
            </div>
          </div>
        );

      case "extract-range":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="range-start">Start Page (1-indexed) *</Label>
                <Input
                  id="range-start"
                  type="number"
                  min={1}
                  max={pageCount}
                  defaultValue={1}
                  onChange={(e) => {
                    const start1 = Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1));
                    setOptions(prev => ({ 
                      ...prev, 
                      pageRange: { start: start1 - 1, end: prev.pageRange?.end ?? (pageCount - 1) } 
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="range-end">End Page (1-indexed) *</Label>
                <Input
                  id="range-end"
                  type="number"
                  min={1}
                  max={pageCount}
                  defaultValue={pageCount}
                  onChange={(e) => {
                    const end1 = Math.max(1, Math.min(pageCount, parseInt(e.target.value) || pageCount));
                    setOptions(prev => ({ 
                      ...prev, 
                      pageRange: { start: prev.pageRange?.start ?? 0, end: end1 - 1 } 
                    }));
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Extracts pages in the inclusive range. Example: 2–5 will extract pages 2, 3, 4, and 5.
            </p>
            {options.pageRange && (
              <p className="text-xs text-gray-500">
                Selected: {options.pageRange.start + 1} – {options.pageRange.end + 1} of {pageCount}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600">
            No additional configuration required for this operation.
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {operation}</DialogTitle>
          <DialogDescription>
            Set up the parameters for the PDF operation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderOperationConfig()}
          
          {validationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={validateAndConfirm}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parsePageNumbers(input: string, maxPage: number): number[] {
  const pages: number[] = [];
  const parts = input.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const s1 = Math.max(1, Math.min(start, end));
        const e1 = Math.min(maxPage, Math.max(start, end));
        for (let i = s1; i <= e1; i++) {
          pages.push(i - 1); // Convert to 0-indexed
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage) {
        pages.push(pageNum - 1); // Convert to 0-indexed
      }
    }
  }
  
  return [...new Set(pages)].sort((a, b) => a - b);
}
