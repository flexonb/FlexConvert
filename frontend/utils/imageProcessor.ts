export type ImageOperation =
  | "enhance"
  | "resize"
  | "crop"
  | "compress"
  | "rotate"
  | "flip"
  | "convert"
  | "grayscale"
  | "adjust"
  | "text-overlay";

export interface ImageEnhanceOptions {
  sharpen?: number; // 0-1
  denoise?: number; // 0-1
  autoLevels?: boolean;
  saturation?: number; // ~1.0
  contrast?: number; // ~1.0
  brightness?: number; // ~1.0
  targetWidth?: number;
  targetHeight?: number;
}

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  format?: "jpeg" | "png" | "webp";
  quality?: number; // 0-1
}

export interface CropOptions {
  mode: "center-square";
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

export interface CompressOptions {
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
}

export interface RotateOptions {
  degrees: number; // positive clockwise
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

export interface FlipOptions {
  horizontal?: boolean;
  vertical?: boolean;
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

export interface ConvertOptions {
  format: "jpeg" | "png" | "webp";
  quality?: number;
}

export interface AdjustOptions {
  brightness?: number; // 1 = no change
  contrast?: number; // 1 = no change
  saturation?: number; // 1 = no change
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

export interface TextOverlayOptions {
  text: string;
  opacity?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function mimeFor(format?: "jpeg" | "png" | "webp"): string {
  switch (format) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      },
      type,
      quality
    );
  });
}

// Convolution helper
function applyConvolution(
  src: ImageData,
  kernel: number[],
  divisor?: number,
  bias = 0
): ImageData {
  const w = src.width;
  const h = src.height;
  const output = new ImageData(w, h);
  const srcData = src.data;
  const dstData = output.data;
  const side = Math.sqrt(kernel.length);
  const half = Math.floor(side / 2);
  const div = divisor ?? (kernel.reduce((a, b) => a + b, 0) || 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const scy = Math.min(h - 1, Math.max(0, y + ky - half));
          const scx = Math.min(w - 1, Math.max(0, x + kx - half));
          const srcOff = (scy * w + scx) * 4;
          const wt = kernel[ky * side + kx];

          r += srcData[srcOff] * wt;
          g += srcData[srcOff + 1] * wt;
          b += srcData[srcOff + 2] * wt;
          a += srcData[srcOff + 3] * wt;
        }
      }
      const dstOff = (y * w + x) * 4;
      dstData[dstOff] = Math.min(255, Math.max(0, r / div + bias));
      dstData[dstOff + 1] = Math.min(255, Math.max(0, g / div + bias));
      dstData[dstOff + 2] = Math.min(255, Math.max(0, b / div + bias));
      dstData[dstOff + 3] = Math.min(255, Math.max(0, a / div));
    }
  }
  return output;
}

function autoLevels(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const v = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - min) / range) * 255;
    data[i + 1] = ((data[i + 1] - min) / range) * 255;
    data[i + 2] = ((data[i + 2] - min) / range) * 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function enhanceImage(file: File, opts: ImageEnhanceOptions = {}): Promise<Blob> {
  const img = await loadImageFromFile(file);

  // Optionally resize to target size while keeping aspect ratio
  let targetW = img.width;
  let targetH = img.height;
  if (opts.targetWidth || opts.targetHeight) {
    const ar = img.width / img.height;
    if (opts.targetWidth && !opts.targetHeight) {
      targetW = opts.targetWidth;
      targetH = Math.round(targetW / ar);
    } else if (!opts.targetWidth && opts.targetHeight) {
      targetH = opts.targetHeight;
      targetW = Math.round(targetH * ar);
    } else if (opts.targetWidth && opts.targetHeight) {
      targetW = opts.targetWidth;
      targetH = opts.targetHeight;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Denoise via simple box blur, controlled by denoise intensity
  const denoise = Math.max(0, Math.min(1, opts.denoise ?? 0.2));
  if (denoise > 0) {
    const passes = Math.round(denoise * 2); // 0-2 passes
    for (let p = 0; p < passes; p++) {
      const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const kernel = [
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ];
      const blurred = applyConvolution(src, kernel, 9, 0);
      ctx.putImageData(blurred, 0, 0);
    }
  }

  // Auto-levels
  if (opts.autoLevels ?? true) {
    autoLevels(ctx, canvas.width, canvas.height);
  }

  // Adjustments (CSS-like filter)
  const brightness = opts.brightness ?? 1.0;
  const contrast = opts.contrast ?? 1.05;
  const saturation = opts.saturation ?? 1.05;
  (ctx as any).filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
  ctx.drawImage(canvas, 0, 0);

  // Sharpen (unsharp mask style: original + sharpened detail)
  const sharpen = Math.max(0, Math.min(1, opts.sharpen ?? 0.5));
  if (sharpen > 0) {
    const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // High-pass filter: sharpen kernel
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    const sharpened = applyConvolution(src, sharpenKernel, 1, 0);
    // Blend based on sharpen amount
    const base = src.data;
    const sh = sharpened.data;
    for (let i = 0; i < base.length; i += 4) {
      base[i] = base[i] + (sh[i] - base[i]) * sharpen;
      base[i + 1] = base[i + 1] + (sh[i + 1] - base[i + 1]) * sharpen;
      base[i + 2] = base[i + 2] + (sh[i + 2] - base[i + 2]) * sharpen;
    }
    ctx.putImageData(src, 0, 0);
  }

  // Output to JPEG (balanced size/quality)
  return canvasToBlob(canvas, "image/jpeg", 0.92);
}

export async function resizeImage(file: File, opts: ResizeOptions = {}): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const maxW = opts.maxWidth ?? 1920;
  const maxH = opts.maxHeight ?? 1920;

  let { width, height } = img;
  const ratio = Math.min(maxW / width, maxH / height, 1);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.9);
}

export async function cropImage(file: File, opts: CropOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const size = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - size) / 2);
  const sy = Math.floor((img.height - size) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.9);
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<Blob> {
  const img = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.7);
}

export async function rotateImage(file: File, opts: RotateOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const angle = ((opts.degrees % 360) + 360) % 360;

  const radians = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const newW = Math.round(img.width * cos + img.height * sin);
  const newH = Math.round(img.width * sin + img.height * cos);

  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.9);
}

export async function flipImage(file: File, opts: FlipOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.translate(opts.horizontal ? canvas.width : 0, opts.vertical ? canvas.height : 0);
  ctx.scale(opts.horizontal ? -1 : 1, opts.vertical ? -1 : 1);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.9);
}

export async function convertFormat(file: File, opts: ConvertOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.92);
}

export async function grayscaleImage(file: File): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = data[i + 1] = data[i + 2] = y;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, "image/jpeg", 0.9);
}

export async function adjustImage(file: File, opts: AdjustOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  const brightness = opts.brightness ?? 1;
  const contrast = opts.contrast ?? 1;
  const saturate = opts.saturation ?? 1;

  (ctx as any).filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
  ctx.drawImage(img, 0, 0);

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.9);
}

export async function textOverlay(file: File, opts: TextOverlayOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0);

  const text = opts.text || "FlexConvert";
  const opacity = Math.max(0, Math.min(1, opts.opacity ?? 0.75));

  const pad = Math.round(canvas.width * 0.02);
  const fontSize = Math.max(14, Math.round(canvas.width * 0.035));

  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell`;
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  const metrics = ctx.measureText(text);
  const tx = canvas.width - metrics.width - pad;
  const ty = canvas.height - pad;
  ctx.fillRect(tx - pad / 2, ty - fontSize - pad / 2, metrics.width + pad, fontSize + pad);
  ctx.fillStyle = "white";
  ctx.fillText(text, tx, ty);
  ctx.globalAlpha = 1;

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.92);
}
