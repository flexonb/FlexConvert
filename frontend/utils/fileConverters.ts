import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ProgressCb = (p: number) => void;

// A4 page in points (1pt = 1/72 inch)
const A4 = { width: 595.28, height: 841.89 };

// Helpers for text layout with pdf-lib
function wrapText(font: any, text: string, fontSize: number, maxWidth: number): string[] {
  const words = text.replace(/\r/g, "").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line.length ? line + " " + word : word;
    const width = font.widthOfTextAtSize(attempt, fontSize);
    if (width <= maxWidth || !line) {
      line = attempt;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function paragraphsToPdf(paragraphs: string[], onProgress?: ProgressCb): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 14;
  const margin = 40;
  let page = doc.addPage([A4.width, A4.height]);
  let y = A4.height - margin;

  const maxWidth = A4.width - margin * 2;

  let processed = 0;
  const total = paragraphs.length;

  for (const para of paragraphs) {
    const lines = wrapText(font, para, fontSize, maxWidth);
    for (const line of lines) {
      if (y < margin + lineHeight) {
        page = doc.addPage([A4.width, A4.height]);
        y = A4.height - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
    y -= lineHeight; // extra spacing between paragraphs
    processed++;
    onProgress?.(Math.min(99, Math.round((processed / Math.max(total, 1)) * 100)));
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

async function imageFileToPngBytes(file: File): Promise<Uint8Array> {
  // Converts given image file to PNG bytes using a canvas (handles WebP and others)
  const imgUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    im.src = imgUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(imgUrl);
    throw new Error("Canvas 2D context not available");
  }
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas toBlob failed"))), "image/png", 0.92)
  );
  URL.revokeObjectURL(imgUrl);
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

export async function txtToPdf(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const results: { blob: Blob; suggestedName: string }[] = [];
  let i = 0;
  for (const f of files) {
    const text = await f.text();
    const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const blob = await paragraphsToPdf(paragraphs.length ? paragraphs : [text], (p) => {
      onProgress?.((i / files.length) * 100 + p / files.length);
    });
    const base = f.name.replace(/\.[^/.]+$/, "");
    results.push({ blob, suggestedName: `${base}.pdf` });
    i++;
    onProgress?.((i / files.length) * 100);
  }
  return results;
}

export async function imagesToPdf(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const doc = await PDFDocument.create();
  const margin = 40;
  let processed = 0;
  for (const f of files) {
    let imageRef;
    let imgWidth: number;
    let imgHeight: number;

    if (f.type === "image/png") {
      const bytes = await f.arrayBuffer();
      const png = await doc.embedPng(bytes);
      imageRef = png;
      imgWidth = png.width;
      imgHeight = png.height;
    } else if (f.type === "image/jpeg" || f.type === "image/jpg") {
      const bytes = await f.arrayBuffer();
      const jpg = await doc.embedJpg(bytes);
      imageRef = jpg;
      imgWidth = jpg.width;
      imgHeight = jpg.height;
    } else {
      // Convert other formats (e.g., webp) to PNG
      const pngBytes = await imageFileToPngBytes(f);
      const png = await doc.embedPng(pngBytes);
      imageRef = png;
      imgWidth = png.width;
      imgHeight = png.height;
    }

    const page = doc.addPage([A4.width, A4.height]);
    const maxW = A4.width - margin * 2;
    const maxH = A4.height - margin * 2;
    const ratio = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
    const drawW = imgWidth * ratio;
    const drawH = imgHeight * ratio;
    const x = (A4.width - drawW) / 2;
    const y = (A4.height - drawH) / 2;

    page.drawImage(imageRef, { x, y, width: drawW, height: drawH });

    processed++;
    onProgress?.(Math.round((processed / files.length) * 100));
  }

  const bytes = await doc.save();
  return [{ blob: new Blob([bytes], { type: "application/pdf" }), suggestedName: `images-${Date.now()}.pdf` }];
}

export async function extractZip(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const results: { blob: Blob; suggestedName: string }[] = [];
  let processed = 0;

  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "zip") {
      throw new Error(`Unsupported archive type for "${f.name}". Only .zip is supported in-browser.`);
    }
    const zip = await JSZip.loadAsync(await f.arrayBuffer());
    const entries = Object.values(zip.files).filter((z) => !z.dir);

    let entryIndex = 0;
    for (const entry of entries) {
      const content = await entry.async("blob");
      results.push({ blob: content, suggestedName: entry.name });
      entryIndex++;
      const fileProgress = (entryIndex / entries.length) * (100 / files.length);
      onProgress?.(Math.min(99, Math.round((processed / files.length) * 100 + fileProgress)));
    }

    processed++;
    onProgress?.((processed / files.length) * 100);
  }

  onProgress?.(100);
  return results;
}
