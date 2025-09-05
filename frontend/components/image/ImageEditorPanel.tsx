import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Check, Wand2, Crop as CropIcon, RotateCw, Gauge, Type, UploadCloud, Undo2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  type ImageOperation,
  type ImageEnhanceOptions,
  type ResizeOptions,
  type CropOptions,
  type CompressOptions,
  type RotateOptions,
  type FlipOptions,
  type ConvertOptions,
  type AdjustOptions,
  type TextOverlayOptions,
  enhanceImage,
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
import { useToast } from "@/components/ui/use-toast";

interface ImageEditorPanelProps {
  files: File[];
  operation: ImageOperation;
  onConfirm: (options: any) => void;
  onClose: () => void;
}

type AnyOptions =
  | ImageEnhanceOptions
  | ResizeOptions
  | CropOptions
  | CompressOptions
  | RotateOptions
  | FlipOptions
  | ConvertOptions
  | AdjustOptions
  | TextOverlayOptions
  | Record<string, any>;

// Common aspect ratios for cropping (Free removed)
const ASPECT_RATIOS = [
  { label: "1:1 (Square)", value: 1 },
  { label: "3:4 (Portrait)", value: 3/4 },
  { label: "4:3 (Landscape)", value: 4/3 },
  { label: "9:16 (Vertical)", value: 9/16 },
  { label: "16:9 (Widescreen)", value: 16/9 },
  { label: "2:3 (Portrait Photo)", value: 2/3 },
  { label: "3:2 (Landscape Photo)", value: 3/2 },
] as const;

export default function ImageEditorPanel({
  files,
  operation,
  onConfirm,
  onClose
}: ImageEditorPanelProps) {
  const { toast } = useToast();
  const firstFile = files[0];

  const [options, setOptions] = useState<AnyOptions>(() => defaultOptionsFor(operation));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Crop specific state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | null>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const [showCropPreview, setShowCropPreview] = useState(false);
  const [cropperKey, setCropperKey] = useState(0);

  // Load preview source
  useEffect(() => {
    if (firstFile) {
      const url = URL.createObjectURL(firstFile);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    setImageSrc(null);
  }, [firstFile]);

  // Reset when operation changes
  useEffect(() => {
    setOptions(defaultOptionsFor(operation));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(operation === "crop" ? 1 : null);
    setCroppedAreaPixels(null);
    setShowCropPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (cropPreviewUrl) {
      URL.revokeObjectURL(cropPreviewUrl);
    }
    setCropPreviewUrl(null);
  }, [operation]);

  // Auto-generate preview for most operations (not "crop")
  useEffect(() => {
    if (!firstFile) return;
    if (operation === "crop") return; // handled explicitly via button for better UX

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setIsGenerating(true);
        const blob = await generatePreviewBlob(firstFile, operation, options, null);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
      } catch (err) {
        console.error("Preview error:", err);
        toast({
          title: "Preview failed",
          description: err instanceof Error ? err.message : "Could not generate preview.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstFile, operation, JSON.stringify(options)]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
    // Auto-generate crop preview when area changes (with debounce)
    if (operation === "crop") {
      const timer = setTimeout(() => {
        generateCropPreview(areaPixels);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [operation]);

  const generateCropPreview = async (cropArea?: Area) => {
    if (!firstFile) return;
    const area = cropArea || croppedAreaPixels;
    if (!area) {
      toast({
        title: "Crop area not set",
        description: "Drag to select an area to crop.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsGenerating(true);
      const blob = await cropImage(firstFile, { ...(options as CropOptions), area });
      const url = URL.createObjectURL(blob);
      if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl);
      setCropPreviewUrl(url);
      setShowCropPreview(true);
    } catch (err) {
      console.error("Crop preview error:", err);
      toast({
        title: "Preview failed",
        description: err instanceof Error ? err.message : "Could not generate preview.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyToAll = () => {
    let finalOptions = options;
    if (operation === "crop") {
      if (!croppedAreaPixels) {
        toast({
          title: "Crop area not set",
          description: "Please select an area to crop.",
          variant: "destructive",
        });
        return;
      }
      finalOptions = { ...(options as CropOptions), area: croppedAreaPixels };
    }
    if (operation === "text-overlay" && !(finalOptions as TextOverlayOptions).text?.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text for the overlay.",
        variant: "destructive",
      });
      return;
    }
    onConfirm(finalOptions);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(1);
    setCroppedAreaPixels(null);
    setShowCropPreview(false);
    if (cropPreviewUrl) {
      URL.revokeObjectURL(cropPreviewUrl);
      setCropPreviewUrl(null);
    }
    setCropperKey(k => k + 1);
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/70 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5">
              {iconFor(operation)}
            </div>
            <div>
              <CardTitle className="text-base">Photo Editor — {titleFor(operation)}</CardTitle>
              <CardDescription className="text-xs">
                Editing {files.length} image{files.length > 1 ? "s" : ""}. Preview uses the first image.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">{files.length} selected</Badge>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOptions(defaultOptionsFor(operation))}>
              <Undo2 className="w-4 h-4" /> Reset
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close editor">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Live Preview */}
        <div className="space-y-3">
          <div className={cn(
            "relative rounded-xl border-2 border-dashed",
            "bg-gray-50 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700/70",
            "aspect-video overflow-hidden grid place-items-center"
          )}>
            {!firstFile ? (
              <EmptyPreview />
            ) : operation === "crop" ? (
              imageSrc ? (
                <div className="relative w-full h-full">
                  <Cropper
                    key={cropperKey}
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect || undefined}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    restrictPosition={false}
                    showGrid={true}
                    style={{
                      containerStyle: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  />
                  {/* Crop overlay instructions */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Drag corners to adjust • Move image to reposition
                  </div>
                </div>
              ) : (
                <EmptyPreview />
              )
            ) : previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-muted-foreground flex flex-col items-center">
                <UploadCloud className={cn("w-6 h-6 mb-2", isGenerating ? "animate-pulse" : "")} />
                {isGenerating ? "Rendering preview..." : "Preview will appear here"}
              </div>
            )}
          </div>

          {operation === "crop" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Zoom: {zoom.toFixed(1)}x</Label>
                  <Slider 
                    value={[zoom]} 
                    onValueChange={([v]) => setZoom(v)} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Aspect Ratio</Label>
                  <Select
                    value={aspect?.toString() || "1"}
                    onValueChange={(v) => {
                      setAspect(parseFloat(v));
                      setCropperKey(k => k + 1);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.label} value={ratio.value.toString()}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => generateCropPreview()} disabled={!firstFile || isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Preview"}
                </Button>
                <Button size="sm" variant="outline" onClick={resetCrop}>
                  <Undo2 className="w-4 h-4 mr-1" /> Reset Crop
                </Button>
                {cropPreviewUrl && (
                  <Button size="sm" variant="ghost" onClick={() => setShowCropPreview(!showCropPreview)}>
                    {showCropPreview ? "Hide" : "Show"} Preview
                  </Button>
                )}
              </div>

              {cropPreviewUrl && showCropPreview && (
                <div className="rounded-lg border bg-white/60 dark:bg-gray-900/60 overflow-hidden">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b">
                    <div className="text-xs font-medium flex items-center gap-2">
                      <CropIcon className="w-3 h-3" />
                      Crop Preview
                      {croppedAreaPixels && (
                        <span className="text-muted-foreground">
                          {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <img src={cropPreviewUrl} alt="Cropped Preview" className="max-h-48 w-full object-contain rounded" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          {renderFields(operation, options, setOptions)}
          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <Button className="flex-1" onClick={applyToAll}>
              <Check className="w-4 h-4 mr-2" />
              Apply to {files.length} image{files.length > 1 ? "s" : ""}
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Tip: You can switch tools and keep your selection. Changes are applied when you click Apply.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* Helpers and field UIs */

function titleFor(op: ImageOperation) {
  const map: Record<ImageOperation, string> = {
    enhance: "Enhance",
    resize: "Resize Images",
    crop: "Crop Images",
    compress: "Compress Images",
    rotate: "Rotate Images",
    flip: "Flip Images",
    convert: "Convert Format",
    grayscale: "Grayscale",
    adjust: "Adjust Colors",
    "text-overlay": "Text Overlay"
  };
  return map[op];
}

function iconFor(op: ImageOperation) {
  switch (op) {
    case "enhance": return <Wand2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "crop": return <CropIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "rotate": return <RotateCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "text-overlay": return <Type className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    default: return <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  }
}

function defaultOptionsFor(op: ImageOperation): AnyOptions {
  switch (op) {
    case "enhance":
      return { sharpen: 0.5, denoise: 0.2, autoLevels: true, saturation: 1.05, contrast: 1.05, brightness: 1.0 } as ImageEnhanceOptions;
    case "resize":
      return { maxWidth: 1920, maxHeight: 1080, format: "jpeg", quality: 0.9 } as ResizeOptions;
    case "crop":
      return { area: { x: 0, y: 0, width: 0, height: 0 }, format: "jpeg", quality: 0.92 } as CropOptions;
    case "compress":
      return { format: "jpeg", quality: 0.7 } as CompressOptions;
    case "rotate":
      return { degrees: 90, format: "jpeg", quality: 0.9 } as RotateOptions;
    case "flip":
      return { horizontal: true, vertical: false, format: "jpeg", quality: 0.9 } as FlipOptions;
    case "convert":
      return { format: "webp", quality: 0.92 } as ConvertOptions;
    case "grayscale":
      return {};
    case "adjust":
      return { brightness: 1.1, contrast: 1.05, saturation: 1.05, format: "jpeg", quality: 0.9 } as AdjustOptions;
    case "text-overlay":
      return { text: "FlexConvert", opacity: 0.75, position: "bottom-right", offsetX: 0, offsetY: 0, format: "jpeg", quality: 0.92 } as TextOverlayOptions;
    default:
      return {};
  }
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v: number) => `${(v ?? 0).toFixed(2)}x`
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
      <Select value={value} onValueChange={(v: "jpeg" | "png" | "webp") => onChange(v)}>
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
      <Slider value={[value ?? 0.9]} onValueChange={([v]) => onChange(v)} min={0.1} max={1} step={0.01} />
    </div>
  );
}

function renderFields(
  operation: ImageOperation,
  options: AnyOptions,
  setOptions: React.Dispatch<React.SetStateAction<AnyOptions>>
) {
  switch (operation) {
    case "enhance": {
      const o = options as ImageEnhanceOptions;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Sharpen</Label>
              <Slider value={[o.sharpen ?? 0.5]} onValueChange={([v]) => setOptions({ ...o, sharpen: v })} min={0} max={1} step={0.05} />
            </div>
            <div>
              <Label>Denoise</Label>
              <Slider value={[o.denoise ?? 0.2]} onValueChange={([v]) => setOptions({ ...o, denoise: v })} min={0} max={1} step={0.05} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-levels">Auto Levels</Label>
                <p className="text-xs text-muted-foreground">Balance shadows and highlights</p>
              </div>
              <Switch id="auto-levels" checked={o.autoLevels ?? true} onCheckedChange={(c) => setOptions({ ...o, autoLevels: c })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <LabeledSlider label="Brightness" value={o.brightness ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, brightness: v })} />
            <LabeledSlider label="Contrast" value={o.contrast ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, contrast: v })} />
            <LabeledSlider label="Saturation" value={o.saturation ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => setOptions({ ...o, saturation: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target-width">Target Width (px)</Label>
              <Input
                id="target-width"
                placeholder="e.g. 1920"
                inputMode="numeric"
                value={(o as any).targetWidth ?? ""}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setOptions({ ...o, targetWidth: Number.isFinite(n) ? n : undefined });
                }}
              />
            </div>
            <div>
              <Label htmlFor="target-height">Target Height (px)</Label>
              <Input
                id="target-height"
                placeholder="e.g. 1080"
                inputMode="numeric"
                value={(o as any).targetHeight ?? ""}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setOptions({ ...o, targetHeight: Number.isFinite(n) ? n : undefined });
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    case "resize": {
      const o = options as ResizeOptions;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="maxw">Max Width (px)</Label>
              <Input id="maxw" inputMode="numeric" value={o.maxWidth ?? ""} onChange={(e) => setOptions({ ...o, maxWidth: numOrUndef(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="maxh">Max Height (px)</Label>
              <Input id="maxh" inputMode="numeric" value={o.maxHeight ?? ""} onChange={(e) => setOptions({ ...o, maxHeight: numOrUndef(e.target.value) })} />
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
          <div className="rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CropIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">How to Crop</span>
            </div>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <li>• <strong>Define the frame:</strong> Drag corner handles to adjust size and shape</li>
              <li>• <strong>Reposition image:</strong> Click and drag inside the crop box to move the image</li>
              <li>• <strong>Set aspect ratio:</strong> Choose a preset ratio from the dropdown</li>
              <li>• <strong>Zoom:</strong> Use the zoom slider for precise adjustments</li>
              <li>• <strong>Preview:</strong> Click "Generate Preview" to see your crop result</li>
            </ul>
          </div>
          <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.92} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
        </div>
      );
    }
    case "compress": {
      const o = options as CompressOptions;
      return (
        <div className="space-y-4">
          <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.7} onChange={(format, quality) => setOptions({ ...o, format, quality })} />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" />
            Balanced size vs. quality by adjusting the slider.
          </div>
        </div>
      );
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
          <div className="flex items-center justify-between">
            <Label>Horizontal</Label>
            <Switch checked={o.horizontal ?? true} onCheckedChange={(c) => setOptions({ ...o, horizontal: c })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Vertical</Label>
            <Switch checked={o.vertical ?? false} onCheckedChange={(c) => setOptions({ ...o, vertical: c })} />
          </div>
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
    case "grayscale": {
      return (
        <p className="text-sm text-muted-foreground">
          Converts images to grayscale. No additional configuration required.
        </p>
      );
    }
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
          <div>
            <Label htmlFor="overlay-text">Text *</Label>
            <Input id="overlay-text" placeholder="Enter overlay text" value={o.text ?? ""} onChange={(e) => setOptions({ ...o, text: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Position</Label>
              <Select
                value={o.position ?? "bottom-right"}
                onValueChange={(v: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right") =>
                  setOptions({ ...o, position: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Opacity</Label>
              <div className="mt-2">
                <Slider
                  value={[o.opacity ?? 0.75]}
                  onValueChange={([v]) => setOptions({ ...o, opacity: v })}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
                <div className="text-xs text-muted-foreground mt-1">{Math.round((o.opacity ?? 0.75) * 100)}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Offset X</Label>
              <Slider
                value={[o.offsetX ?? 0]}
                onValueChange={([v]) => setOptions({ ...o, offsetX: v })}
                min={-500}
                max={500}
                step={1}
              />
              <div className="text-xs text-muted-foreground mt-1">{Math.round(o.offsetX ?? 0)} px</div>
            </div>
            <div>
              <Label>Offset Y</Label>
              <Slider
                value={[o.offsetY ?? 0]}
                onValueChange={([v]) => setOptions({ ...o, offsetY: v })}
                min={-500}
                max={500}
                step={1}
              />
              <div className="text-xs text-muted-foreground mt-1">{Math.round(o.offsetY ?? 0)} px</div>
            </div>
          </div>

          <OutputFormatQuality format={o.format ?? "jpeg"} quality={o.quality ?? 0.92} onChange={(format, quality) => setOptions({ ...o, format, quality })} />

          <div className="text-[11px] text-muted-foreground">
            Position sets the base corner/center; use offsets to fine-tune placement. Positive X moves right, positive Y moves down.
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function numOrUndef(s: string): number | undefined {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

async function generatePreviewBlob(
  file: File,
  operation: ImageOperation,
  options: AnyOptions,
  croppedArea: Area | null
): Promise<Blob> {
  switch (operation) {
    case "enhance":
      return enhanceImage(file, options as ImageEnhanceOptions);
    case "resize":
      return resizeImage(file, options as ResizeOptions);
    case "crop":
      return cropImage(file, { ...(options as CropOptions), area: (options as CropOptions).area ?? croppedArea! });
    case "compress":
      return compressImage(file, options as CompressOptions);
    case "rotate":
      return rotateImage(file, options as RotateOptions);
    case "flip":
      return flipImage(file, options as FlipOptions);
    case "convert":
      return convertFormat(file, options as ConvertOptions);
    case "grayscale":
      return grayscaleImage(file);
    case "adjust":
      return adjustImage(file, options as AdjustOptions);
    case "text-overlay":
      return textOverlay(file, options as TextOverlayOptions);
    default:
      throw new Error("Unsupported operation");
  }
}

function EmptyPreview() {
  return (
    <div className="text-center text-gray-400">
      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p>No preview</p>
    </div>
  );
}
