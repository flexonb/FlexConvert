import React, { useEffect, useMemo, useState } from "react";
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
  onConfirm: (options: ResizeOptions | CropOptions | CompressOptions | RotateOptions | FlipOptions | ConvertOptions | AdjustOptions | TextOverlayOptions | Record<string, any>) => void;
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
  const steps: Step[] = useMemo(() => {
    return [
      { id: "configure", label: "Configure", status: currentStep === "configure" ? "current" : "complete" },
      { id: "preview", label: "Preview", status: currentStep === "preview" ? "current" : (currentStep === "confirm" ? "complete" : "upcoming") },
      { id: "confirm", label: "Confirm", status: currentStep === "confirm" ? "current" : "upcoming" },
    ];
  }, [currentStep]);

  // Default option presets for each operation, user can customize
  const [options, setOptions] = useState<AnyOptions>(() => defaultOptionsFor(operation));

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    // Reset dialog state when operation changes or dialog opens
    if (open) {
      setCurrentStep("configure");
      setOptions(defaultOptionsFor(operation));
      setPreviewUrl(null);
    }
  }, [open, operation]);

  function defaultOptionsFor(op: ConfigurableOperation): AnyOptions {
    switch (op) {
      case "resize":
        return { maxWidth: 1920, maxHeight: 1920, format: "jpeg", quality: 0.9 } satisfies ResizeOptions;
      case "crop":
        return { mode: "center-square", format: "jpeg", quality: 0.92 } satisfies CropOptions;
      case "compress":
        return { format: "jpeg", quality: 0.7 } satisfies CompressOptions;
      case "rotate":
        return { degrees: 90, format: "jpeg", quality: 0.9 } satisfies RotateOptions;
      case "flip":
        return { horizontal: true, vertical: false, format: "jpeg", quality: 0.9 } satisfies FlipOptions;
      case "convert":
        return { format: "webp", quality: 0.92 } satisfies ConvertOptions;
      case "grayscale":
        return {} as Record<string, any>;
      case "adjust":
        return { brightness: 1.1, contrast: 1.05, saturation: 1.05, format: "jpeg", quality: 0.9 } satisfies AdjustOptions;
      case "text-overlay":
        return { text: "FlexConvert", opacity: 0.75, format: "jpeg", quality: 0.92 } satisfies TextOverlayOptions;
      default:
        return {};
    }
  }

  async function generatePreview() {
    if (!firstFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one image file to preview.",
        variant: "destructive"
      });
      return;
    }
    setIsPreviewing(true);
    setPreviewUrl(null);
    try {
      let blob: Blob;
      switch (operation) {
        case "resize":
          blob = await resizeImage(firstFile, options as ResizeOptions);
          break;
        case "crop":
          blob = await cropImage(firstFile, options as CropOptions);
          break;
        case "compress":
          blob = await compressImage(firstFile, options as CompressOptions);
          break;
        case "rotate":
          blob = await rotateImage(firstFile, options as RotateOptions);
          break;
        case "flip":
          blob = await flipImage(firstFile, options as FlipOptions);
          break;
        case "convert":
          blob = await convertFormat(firstFile, options as ConvertOptions);
          break;
        case "grayscale":
          blob = await grayscaleImage(firstFile);
          break;
        case "adjust":
          blob = await adjustImage(firstFile, options as AdjustOptions);
          break;
        case "text-overlay":
          if (!(options as TextOverlayOptions).text?.trim()) {
            throw new Error("Text is required for text overlay.");
          }
          blob = await textOverlay(firstFile, options as TextOverlayOptions);
          break;
        default:
          throw new Error("Unsupported operation");
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setCurrentStep("preview");
    } catch (err) {
      console.error("Preview error:", err);
      toast({
        title: "Preview failed",
        description: err instanceof Error ? err.message : "Could not generate preview.",
        variant: "destructive"
      });
    } finally {
      setIsPreviewing(false);
    }
  }

  function handleConfirm() {
    // Basic validation for operations requiring text or degrees etc.
    if (operation === "text-overlay") {
      const txt = (options as TextOverlayOptions).text || "";
      if (!txt.trim()) {
        toast({
          title: "Text required",
          description: "Please enter text for the overlay.",
          variant: "destructive",
        });
        setCurrentStep("configure");
        return;
      }
    }
    onConfirm(options);
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
                <Input
                  id="maxw"
                  inputMode="numeric"
                  value={o.maxWidth ?? 1920}
                  onChange={(e) => setOptions({ ...o, maxWidth: numberOrUndefined(e.target.value, 1920) })}
                />
              </div>
              <div>
                <Label htmlFor="maxh">Max Height (px)</Label>
                <Input
                  id="maxh"
                  inputMode="numeric"
                  value={o.maxHeight ?? 1920}
                  onChange={(e) => setOptions({ ...o, maxHeight: numberOrUndefined(e.target.value, 1920) })}
                />
              </div>
            </div>
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.9}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "crop": {
        const o = options as CropOptions;
        return (
          <div className="space-y-4">
            <div>
              <Label>Mode</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Center square crop (automatic)</div>
            </div>
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.92}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "compress": {
        const o = options as CompressOptions;
        return (
          <div className="space-y-4">
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.7}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "rotate": {
        const o = options as RotateOptions;
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Degrees</Label>
                <span className="text-xs text-gray-500">{o.degrees ?? 0}°</span>
              </div>
              <Slider
                value={[o.degrees ?? 0]}
                onValueChange={([v]) => setOptions({ ...o, degrees: v })}
                min={-180}
                max={180}
                step={5}
              />
            </div>
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.9}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "flip": {
        const o = options as FlipOptions;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Horizontal</Label>
                <div className="text-xs text-gray-500">Flip left/right</div>
              </div>
              <Switch checked={o.horizontal ?? true} onCheckedChange={(c) => setOptions({ ...o, horizontal: c })} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Vertical</Label>
                <div className="text-xs text-gray-500">Flip top/bottom</div>
              </div>
              <Switch checked={o.vertical ?? false} onCheckedChange={(c) => setOptions({ ...o, vertical: c })} />
            </div>
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.9}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "convert": {
        const o = options as ConvertOptions;
        return (
          <div className="space-y-4">
            <FormatPicker
              value={o.format}
              onChange={(fmt) => setOptions({ ...o, format: fmt })}
            />
            <QualityPicker
              label="Quality"
              value={o.quality ?? 0.92}
              onChange={(q) => setOptions({ ...o, quality: q })}
            />
          </div>
        );
      }
      case "grayscale": {
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Converts images to grayscale. No additional configuration required.</p>
          </div>
        );
      }
      case "adjust": {
        const o = options as AdjustOptions;
        return (
          <div className="space-y-4">
            <LabeledSlider label="Brightness" value={o.brightness ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, brightness: v })} />
            <LabeledSlider label="Contrast" value={o.contrast ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, contrast: v })} />
            <LabeledSlider label="Saturation" value={o.saturation ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, saturation: v })} />
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.9}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      case "text-overlay": {
        const o = options as TextOverlayOptions;
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="overlay-text">Text *</Label>
              <Input
                id="overlay-text"
                placeholder="Enter overlay text"
                value={o.text ?? ""}
                onChange={(e) => setOptions({ ...o, text: e.target.value })}
              />
            </div>
            <LabeledSlider label="Opacity" value={o.opacity ?? 0.75} min={0.1} max={1} step={0.05} onChange={(v) => setOptions({ ...o, opacity: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <OutputFormatQuality
              format={o.format ?? "jpeg"}
              quality={o.quality ?? 0.92}
              onChange={(format, quality) => setOptions({ ...o, format, quality })}
            />
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {titleFor(operation)}</DialogTitle>
          <DialogDescription>
            Guided setup to customize how your images are processed. Preview uses the first selected file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <StepIndicator steps={steps} />

          {currentStep === "configure" && (
            <div className="space-y-4">
              {renderFields()}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Selected files: {files.length}. Preview shows the first file only.
                </div>
                <Button onClick={generatePreview} disabled={!firstFile || isPreviewing}>
                  {isPreviewing ? "Generating preview..." : "Generate Preview"}
                </Button>
              </div>
            </div>
          )}

          {currentStep === "preview" && (
            <div className="space-y-4">
              <Card className="p-3">
                <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-[360px] object-contain" />
                  ) : (
                    <div className="text-gray-400">No preview available</div>
                  )}
                </div>
              </Card>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("configure")}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("confirm")}>Looks good</Button>
              </div>
            </div>
          )}

          {currentStep === "confirm" && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                You are about to process {files.length} file{files.length > 1 ? "s" : ""} with the following configuration:
              </div>
              <pre className="text-xs p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 overflow-auto">
                {JSON.stringify(options, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep !== "configure" && (
            <Button variant="outline" onClick={() => setCurrentStep("configure")}>
              Edit
            </Button>
          )}
          {currentStep !== "confirm" ? (
            <Button onClick={() => (currentStep === "preview" ? setCurrentStep("confirm") : generatePreview())}>
              {currentStep === "configure" ? "Preview" : "Continue"}
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              Process {files.length} file{files.length > 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function titleFor(op: ConfigurableOperation) {
  switch (op) {
    case "resize": return "Resize Images";
    case "crop": return "Crop Images";
    case "compress": return "Compress Images";
    case "rotate": return "Rotate Images";
    case "flip": return "Flip Images";
    case "convert": return "Convert Format";
    case "grayscale": return "Grayscale";
    case "adjust": return "Adjust Colors";
    case "text-overlay": return "Text Overlay";
    default: return "Image Operation";
  }
}

function numberOrUndefined(str: string, fallback: number): number {
  const n = parseInt(str, 10);
  return Number.isFinite(n) ? n : fallback;
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v: number) => v.toFixed(2) + "x"
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-xs text-gray-500">{format(value)}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

function OutputFormatQuality({
  format,
  quality,
  onChange
}: {
  format: "jpeg" | "png" | "webp";
  quality: number;
  onChange: (format: "jpeg" | "png" | "webp", quality: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormatPicker value={format} onChange={(fmt) => onChange(fmt, quality)} />
      <QualityPicker label="Quality" value={quality} onChange={(q) => onChange(format, q)} />
    </div>
  );
}

function FormatPicker({
  value,
  onChange
}: {
  value: "jpeg" | "png" | "webp";
  onChange: (v: "jpeg" | "png" | "webp") => void;
}) {
  return (
    <div>
      <Label>Output Format</Label>
      <Select
        value={value}
        onValueChange={(v: "jpeg" | "png" | "webp") => onChange(v)}
      >
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="webp">WebP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function QualityPicker({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-xs text-gray-500">{Math.round((value ?? 0.9) * 100)}%</span>
      </div>
      <Slider
        value={[value ?? 0.9]}
        onValueChange={([v]) => onChange(v)}
        min={0.1}
        max={1}
        step={0.01}
      />
    </div>
  );
}
