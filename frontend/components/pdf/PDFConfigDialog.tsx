import React, { useState } from "react";
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
        break;
        
      case "add-pages":
        if (!options.insertPages || options.insertPages.length === 0) {
          setValidationError("Insert pages configuration is required");
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
                  <SelectValue />
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
                  <SelectValue />
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
                placeholder={`e.g., ${Array.from({length: Math.min(pageCount, 5)}, (_, i) => i).reverse().join(',')}`}
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
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPage) {
            pages.push(i - 1); // Convert to 0-indexed
          }
        }
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage) {
        pages.push(pageNum - 1); // Convert to 0-indexed
      }
    }
  }
  
  return [...new Set(pages)].sort((a, b) => a - b);
}
