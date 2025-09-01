export type ImageOperation =
  | "resize"
  | "crop"
  | "compress"
  | "rotate"
  | "flip"
  | "convert"
  | "grayscale"
  | "adjust"
  | "text-overlay";

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  format?: "jpeg" | "png" | "webp";
  quality?: number; // 0-1
}

interface CropOptions {
  mode: "center-square";
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

interface CompressOptions {
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
}

interface RotateOptions {
  degrees: number; // positive clockwise
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

interface FlipOptions {
  horizontal?: boolean;
  vertical?: boolean;
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

interface ConvertOptions {
  format: "jpeg" | "png" | "webp";
  quality?: number;
}

interface AdjustOptions {
  brightness?: number; // 1 = no change
  contrast?: number; // 1 = no change
  saturation?: number; // 1 = no change
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

interface TextOverlayOptions {
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
    img.onerror = (e) => {
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

  // Use CSS-like filter on canvas
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
  // shadow-like backdrop
  const metrics = ctx.measureText(text);
  const tx = canvas.width - metrics.width - pad;
  const ty = canvas.height - pad;
  ctx.fillRect(tx - pad / 2, ty - fontSize - pad / 2, metrics.width + pad, fontSize + pad);
  ctx.fillStyle = "white";
  ctx.fillText(text, tx, ty);
  ctx.globalAlpha = 1;

  return canvasToBlob(canvas, mimeFor(opts.format), opts.quality ?? 0.92);
}
