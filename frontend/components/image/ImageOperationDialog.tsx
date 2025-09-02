import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StepIndicator, { type Step } from "../shared/StepIndicator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import {
  type ImageOperation,
  type AdjustOptions,
  type CompressOptions,
  type ConvertOptions,
  type CropOptions,
  type FlipOptions,
  type ResizeOptions,
  type RotateOptions,
  type TextOverlayOptions,
  resizeImage,
  cropImage,
  compressImage,
  rotateImage,
  flipImage,
  convertFormat,
  grayscaleImage,
  adjustImage,
  textOverlay
} from "@/utils/imageProcessor";

type ConfigurableOperation =
  | "resize"
  | "crop"
  | "compress"
  | "rotate"
  | "flip"
  | "convert"
  | "grayscale"
  | "adjust"
  | "text-overlay";

interface ImageOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: ConfigurableOperation;
  files: File[];
  onConfirm: (options: any) => void;
}

type AnyOptions =
  | ResizeOptions
  | CropOptions
  | CompressOptions
  | RotateOptions
  | FlipOptions
  | ConvertOptions
  | AdjustOptions
  | TextOverlayOptions
  | Record<string, any>;

export default function ImageOperationDialog({
  open,
  onOpenChange,
  operation,
  files,
  onConfirm
}: ImageOperationDialogProps) {
  const { toast } = useToast();
  const firstFile = files[0];

  const [currentStep, setCurrentStep] = useState<"configure" | "preview" | "confirm">("configure");
  const [options, setOptions] = useState<AnyOptions>(() => defaultOptionsFor(operation));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // State for react-easy-crop
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const steps: Step[] = useMemo(() => {
    return [
      { id: "configure", label: "Configure", status: currentStep === "configure" ? "current" : "complete" },
      { id: "preview", label: "Preview", status: currentStep === "preview" ? "current" : (currentStep === "confirm" ? "complete" : "upcoming") },
      { id: "confirm", label: "Confirm", status: currentStep === "confirm" ? "current" : "upcoming" },
    ];
  }, [currentStep]);

  useEffect(() => {
    if (open) {
      setCurrentStep("configure");
      setOptions(defaultOptionsFor(operation));
      setPreviewUrl(null);
      if (operation === 'crop' && firstFile) {
        const url = URL.createObjectURL(firstFile);
        setImageSrc(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setImageSrc(null);
    }
  }, [open, operation, firstFile]);

  function defaultOptionsFor(op: ConfigurableOperation): AnyOptions {
    switch (op) {
      case "resize": return { maxWidth: 1920, maxHeight: 1080, format: "jpeg", quality: 0.9 };
      case "crop": return { area: { x: 0, y: 0, width: 0, height: 0 }, format: "jpeg", quality: 0.92 };
      case "compress": return { format: "jpeg", quality: 0.7 };
      case "rotate": return { degrees: 90, format: "jpeg", quality: 0.9 };
      case "flip": return { horizontal: true, vertical: false, format: "jpeg", quality: 0.9 };
      case "convert": return { format: "webp", quality: 0.92 };
      case "grayscale": return {};
      case "adjust": return { brightness: 1.1, contrast: 1.05, saturation: 1.05, format: "jpeg", quality: 0.9 };
      case "text-overlay": return { text: "FlexConvert", opacity: 0.75, format: "jpeg", quality: 0.92 };
      default: return {};
    }
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function generatePreview() {
    if (!firstFile) {
      toast({ title: "No file selected", description: "Please select an image to preview.", variant: "destructive" });
      return;
    }
    setIsPreviewing(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    try {
      let blob: Blob;
      let currentOptions = options;

      if (operation === 'crop') {
        if (!croppedAreaPixels) throw new Error("Please select an area to crop.");
        currentOptions = { ...options, area: croppedAreaPixels };
        setOptions(currentOptions);
      }

      switch (operation) {
        case "resize": blob = await resizeImage(firstFile, currentOptions as ResizeOptions); break;
        case "crop": blob = await cropImage(firstFile, currentOptions as CropOptions); break;
        case "compress": blob = await compressImage(firstFile, currentOptions as CompressOptions); break;
        case "rotate": blob = await rotateImage(firstFile, currentOptions as RotateOptions); break;
        case "flip": blob = await flipImage(firstFile, currentOptions as FlipOptions); break;
        case "convert": blob = await convertFormat(firstFile, currentOptions as ConvertOptions); break;
        case "grayscale": blob = await grayscaleImage(firstFile); break;
        case "adjust": blob = await adjustImage(firstFile, currentOptions as AdjustOptions); break;
        case "text-overlay":
          if (!(currentOptions as TextOverlayOptions).text?.trim()) throw new Error("Text is required for overlay.");
          blob = await textOverlay(firstFile, currentOptions as TextOverlayOptions);
          break;
        default: throw new Error("Unsupported operation");
      }
      setPreviewUrl(URL.createObjectURL(blob));
      setCurrentStep("preview");
    } catch (err) {
      console.error("Preview error:", err);
      toast({ title: "Preview failed", description: err instanceof Error ? err.message : "Could not generate preview.", variant: "destructive" });
    } finally {
      setIsPreviewing(false);
    }
  }

  function handleConfirm() {
    let finalOptions = options;
    if (operation === 'crop') {
      const cropArea = croppedAreaPixels || (options as CropOptions).area;
      if (!cropArea || !cropArea.width || !cropArea.height) {
        toast({ title: "Crop area not set", description: "Please select an area to crop.", variant: "destructive" });
        setCurrentStep("configure");
        return;
      }
      finalOptions = { ...options, area: cropArea };
    }
    if (operation === "text-overlay" && !(finalOptions as TextOverlayOptions).text?.trim()) {
      toast({ title: "Text required", description: "Please enter text for the overlay.", variant: "destructive" });
      setCurrentStep("configure");
      return;
    }
    onConfirm(finalOptions);
  }

  function renderFields() {
    switch (operation) {
      case "resize": {
        const o = options as ResizeOptions;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="maxw">Max Width (px)</Label>
                <Input id="maxw" inputMode="numeric" value={o.maxWidth ?? ""} onChange={(e) => setOptions({ ...o, maxWidth: numberOrUndefined(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="maxh">Max Height (px)</Label>
                <Input id="maxh" inputMode="numeric" value={o.maxHeight ?? ""} onChange={(e) => setOptions({ ...o, maxHeight: numberOrUndefined(e.target.value) })} />
              </div>
            </div>
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.9} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      case "crop": {
        const o = options as CropOptions;
        return (
          <div className="space-y-4">
            <div className="relative h-80 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {imageSrc ? (
                <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
              ) : <div className="flex items-center justify-center h-full text-gray-500">Select an image first</div>}
            </div>
            <div>
              <Label>Zoom</Label>
              <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={1} max={3} step={0.1} />
            </div>
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.92} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      case "compress": {
        const o = options as CompressOptions;
        return <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.7} onChange={(format, quality) => setOptions({ ...o, format, quality })} />;
      }
      case "rotate": {
        const o = options as RotateOptions;
        return (
          <div className="space-y-4">
            <LabeledSlider label="Degrees" value={o.degrees ?? 90} min={-180} max={180} step={5} onChange={(v) => setOptions({ ...o, degrees: v })} format={(v) => `${v}°`} />
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.9} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      case "flip": {
        const o = options as FlipOptions;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Label>Horizontal</Label><Switch checked={o.horizontal ?? true} onCheckedChange={(c) => setOptions({ ...o, horizontal: c })} /></div>
            <div className="flex items-center justify-between"><Label>Vertical</Label><Switch checked={o.vertical ?? false} onCheckedChange={(c) => setOptions({ ...o, vertical: c })} /></div>
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.9} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      case "convert": {
        const o = options as ConvertOptions;
        return (
          <div className="space-y-4">
            <FormatPicker value={o.format} onChange={(fmt) => setOptions({ ...o, format: fmt })} />
            <QualityPicker label="Quality" value={o.quality ?? 0.92} onChange={(q) => setOptions({ ...o, quality: q })} />
          </div>
        );
      }
      case "grayscale": return <p className="text-sm text-gray-600 dark:text-gray-400">Converts images to grayscale. No additional configuration required.</p>;
      case "adjust": {
        const o = options as AdjustOptions;
        return (
          <div className="space-y-4">
            <LabeledSlider label="Brightness" value={o.brightness ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, brightness: v })} />
            <LabeledSlider label="Contrast" value={o.contrast ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, contrast: v })} />
            <LabeledSlider label="Saturation" value={o.saturation ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, saturation: v })} />
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.9} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      case "text-overlay": {
        const o = options as TextOverlayOptions;
        return (
          <div className="space-y-4">
            <div><Label htmlFor="overlay-text">Text *</Label><Input id="overlay-text" placeholder="Enter overlay text" value={o.text ?? ""} onChange={(e) => setOptions({ ...o, text: e.target.value })} /></div>
            <LabeledSlider label="Opacity" value={o.opacity ?? 0.75} min={0.1} max={1} step={0.05} onChange={(v) => setOptions({ ...o, opacity: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.92} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          </div>
        );
      }
      default: return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {titleFor(operation)}</DialogTitle>
          <DialogDescription>Guided setup to customize how your images are processed. Preview uses the first selected file.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <StepIndicator steps={steps} />
          {currentStep === "configure" && <div className="space-y-4">{renderFields()}</div>}
          {currentStep === "preview" && (
            <Card className="p-3"><div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} alt="Preview" className="max-h-[360px] object-contain" /> : <div className="text-gray-400">No preview available</div>}
            </div></Card>
          )}
          {currentStep === "confirm" && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">You are about to process {files.length} file{files.length > 1 ? "s" : ""} with this configuration:</div>
              <pre className="text-xs p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 overflow-auto max-h-40">{JSON.stringify(options, null, 2)}</pre>
            </div>
          )}
        </div>
        <DialogFooter>
          {currentStep === "configure" && <div className="text-xs text-gray-500 dark:text-gray-400 flex-1 text-left">Selected files: {files.length}. Preview shows the first file only.</div>}
          {currentStep === "preview" && <Button variant="outline" onClick={() => setCurrentStep("configure")}>Back</Button>}
          {currentStep === "confirm" && <Button variant="outline" onClick={() => setCurrentStep("configure")}>Edit</Button>}
          {currentStep !== "confirm" ? (
            <Button onClick={generatePreview} disabled={!firstFile || isPreviewing}>{isPreviewing ? "Generating..." : "Generate Preview"}</Button>
          ) : (
            <Button onClick={handleConfirm}>Process {files.length} file{files.length > 1 ? "s" : ""}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function titleFor(op: ConfigurableOperation) {
  const titles: Record<ConfigurableOperation, string> = {
    resize: "Resize Images", crop: "Crop Images", compress: "Compress Images", rotate: "Rotate Images",
    flip: "Flip Images", convert: "Convert Format", grayscale: "Grayscale", adjust: "Adjust Colors", "text-overlay": "Text Overlay"
  };
  return titles[op] || "Image Operation";
}

function numberOrUndefined(str: string): number | undefined {
  const n = parseInt(str, 10);
  return Number.isFinite(n) ? n : undefined;
}

function LabeledSlider({ label, value, min, max, step, onChange, format = (v: number) => v.toFixed(2) + "x" }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string; }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1"><Label>{label}</Label><span className="text-xs text-gray-500">{format(value)}</span></div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

function OutputFormatQuality({ format, quality, onChange }: { format: "jpeg" | "png" | "webp"; quality: number; onChange: (format: "jpeg" | "png" | "webp", quality: number) => void; }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormatPicker value={format} onChange={(fmt) => onChange(fmt, quality)} />
      <QualityPicker label="Quality" value={quality} onChange={(q) => onChange(format, q)} />
    </div>
  );
}

function FormatPicker({ value, onChange }: { value: "jpeg" | "png" | "webp"; onChange: (v: "jpeg" | "png" | "webp") => void; }) {
  return (
    <div>
      <Label>Output Format</Label>
      <Select value={value} onValueChange={(v: "jpeg" | "png" | "webp") => onChange(v)}>
        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="webp">WebP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function QualityPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void; }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1"><Label>{label}</Label><span className="text-xs text-gray-500">{Math.round((value ?? 0.9) * 100)}%</span></div>
      <Slider value={[value ?? 0.9]} onValueChange={([v]) => onChange(v)} min={0.1} max={1} step={0.01} />
    </div>
  );
}
