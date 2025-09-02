import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { ImageEnhanceOptions } from "@/utils/imageProcessor";

interface ImageEnhanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (opts: ImageEnhanceOptions) => void;
}

export default function ImageEnhanceDialog({ open, onOpenChange, onConfirm }: ImageEnhanceDialogProps) {
  const [opts, setOpts] = useState<ImageEnhanceOptions>({
    sharpen: 0.5,
    denoise: 0.2,
    autoLevels: true,
    saturation: 1.05,
    contrast: 1.05,
    brightness: 1.0,
  });

  const confirm = () => {
    onConfirm(opts);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enhance Images</DialogTitle>
          <DialogDescription>
            Improve clarity with sharpening, denoise and auto-levels. Applies to all selected images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Sharpen</Label>
              <span className="text-xs text-gray-500">{Math.round((opts.sharpen ?? 0) * 100)}%</span>
            </div>
            <Slider
              value={[opts.sharpen ?? 0]}
              onValueChange={([v]) => setOpts((p) => ({ ...p, sharpen: v }))}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Denoise</Label>
              <span className="text-xs text-gray-500">{Math.round((opts.denoise ?? 0) * 100)}%</span>
            </div>
            <Slider
              value={[opts.denoise ?? 0]}
              onValueChange={([v]) => setOpts((p) => ({ ...p, denoise: v }))}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Brightness</Label>
                <span className="text-xs text-gray-500">{(opts.brightness ?? 1).toFixed(2)}x</span>
              </div>
              <Slider
                value={[opts.brightness ?? 1]}
                onValueChange={([v]) => setOpts((p) => ({ ...p, brightness: v }))}
                min={0.5}
                max={1.5}
                step={0.05}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Contrast</Label>
                <span className="text-xs text-gray-500">{(opts.contrast ?? 1).toFixed(2)}x</span>
              </div>
              <Slider
                value={[opts.contrast ?? 1]}
                onValueChange={([v]) => setOpts((p) => ({ ...p, contrast: v }))}
                min={0.5}
                max={1.5}
                step={0.05}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Saturation</Label>
                <span className="text-xs text-gray-500">{(opts.saturation ?? 1).toFixed(2)}x</span>
              </div>
              <Slider
                value={[opts.saturation ?? 1]}
                onValueChange={([v]) => setOpts((p) => ({ ...p, saturation: v }))}
                min={0.5}
                max={1.5}
                step={0.05}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-levels">Auto Levels</Label>
              <p className="text-xs text-gray-500">Balance shadows and highlights automatically</p>
            </div>
            <Switch
              id="auto-levels"
              checked={opts.autoLevels ?? true}
              onCheckedChange={(checked) => setOpts((p) => ({ ...p, autoLevels: checked }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target-width">Target Width (px)</Label>
              <Input
                id="target-width"
                placeholder="e.g. 1920"
                inputMode="numeric"
                value={opts.targetWidth ?? ""}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setOpts((p) => ({ ...p, targetWidth: Number.isFinite(n) ? n : undefined }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="target-height">Target Height (px)</Label>
              <Input
                id="target-height"
                placeholder="e.g. 1080"
                inputMode="numeric"
                value={opts.targetHeight ?? ""}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setOpts((p) => ({ ...p, targetHeight: Number.isFinite(n) ? n : undefined }));
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
