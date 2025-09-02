import JSZip from "jszip";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Configure PDF.js worker to be bundled with Vite.
GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ProgressCb = (p: number) => void;

// A4 page in points (1pt = 1/72 inch)
const A4 = { width: 595.28, height: 841.89 };

function sanitizeTextForDocx(text: string): string {
  // Removes characters that are invalid in XML.
  // See https://www.w3.org/TR/xml/#charsets
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

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

// Extracts plain text from a DOCX (OpenXML) using JSZip (no external mammoth dependency).
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docXml = zip.file("word/document.xml");
  if (!docXml) return "";

  const xml = await docXml.async("text");

  // Split into paragraphs, then extract text runs from each paragraph.
  const paragraphs = Array.from(xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)).map((pm) => pm[0]);

  const decode = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));

  const paraTexts = paragraphs.map((p) => {
    const runs = Array.from(p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)).map((m) => decode(m[1]));
    return runs.join("");
  });

  // Fallback if no paragraph tags matched: join all text nodes
  if (paraTexts.length === 0) {
    const runs = Array.from(xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)).map((m) => decode(m[1]));
    return runs.join("\n");
  }

  return paraTexts.join("\n\n");
}

export async function docxToPdf(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const results: { blob: Blob; suggestedName: string }[] = [];
  let i = 0;

  for (const f of files) {
    const arrayBuffer = await f.arrayBuffer();
    const text = await extractTextFromDocx(arrayBuffer);
    const paragraphs = (text || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const blob = await paragraphsToPdf(paragraphs.length ? paragraphs : ["(no text)"], (p) => {
      onProgress?.((i / files.length) * 100 + p / files.length);
    });
    const base = f.name.replace(/\.[^/.]+$/, "");
    results.push({ blob, suggestedName: `${base}.pdf` });
    i++;
    onProgress?.((i / files.length) * 100);
  }

  return results;
}

export async function xlsxToPdf(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const results: { blob: Blob; suggestedName: string }[] = [];
  let i = 0;

  for (const f of files) {
    const data = new Uint8Array(await f.arrayBuffer());
    const wb = XLSX.read(data, { type: "array" });

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Courier);
    const fontSize = 10;
    const lineHeight = 12;
    const margin = 30;
    const maxWidth = A4.width - margin * 2;

    let page = doc.addPage([A4.width, A4.height]);
    let y = A4.height - margin;

    wb.SheetNames.forEach((sheetName, idx) => {
      const ws = wb.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (idx > 0) {
        page = doc.addPage([A4.width, A4.height]);
        y = A4.height - margin;
      }

      // Sheet title
      const title = `Sheet: ${sheetName}`;
      page.drawText(title, { x: margin, y, size: fontSize + 2, font });
      y -= lineHeight * 1.5;

      for (const row of rows) {
        const line = row.map((cell) => (cell == null ? "" : String(cell))).join(" | ");
        const wrapped = wrapText(font, line, fontSize, maxWidth);
        for (const wline of wrapped) {
          if (y < margin + lineHeight) {
            page = doc.addPage([A4.width, A4.height]);
            y = A4.height - margin;
          }
          page.drawText(wline, { x: margin, y, size: fontSize, font });
          y -= lineHeight;
        }
      }
    });

    const bytes = await doc.save();
    const base = f.name.replace(/\.[^/.]+$/, "");
    results.push({ blob: new Blob([bytes], { type: "application/pdf" }), suggestedName: `${base}.pdf` });
    i++;
    onProgress?.((i / files.length) * 100);
  }

  return results;
}

export async function pptxToPdf(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  // Basic conversion: one page per slide with extracted simple text (titles), if possible.
  const results: { blob: Blob; suggestedName: string }[] = [];
  let i = 0;

  for (const f of files) {
    const zip = await JSZip.loadAsync(await f.arrayBuffer());
    const slideFiles = Object.keys(zip.files)
      .filter((p) => p.startsWith("ppt/slides/slide") && p.endsWith(".xml"))
      .sort((a, b) => {
        const an = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
        const bn = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
        return an - bn;
      });

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const titleSize = 18;
    const bodySize = 12;
    const lineHeight = 14;
    const margin = 40;

    for (let s = 0; s < slideFiles.length; s++) {
      const path = slideFiles[s];
      const xml = await zip.files[path].async("text");
      // Simple text extraction: pull out <a:t>text</a:t>
      const texts = Array.from(xml.matchAll(/<a:t>(.*?)<\/a:t>/g)).map((m) =>
        m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      );

      let currentPage = doc.addPage([A4.width, A4.height]);
      let y = A4.height - margin;

      // Title
      currentPage.drawText(`Slide ${s + 1}`, { x: margin, y, size: titleSize, font });
      y -= lineHeight * 2;

      const content = texts.join("\n\n") || "(no extractable text)";
      const maxWidth = A4.width - margin * 2;
      const lines = content.split(/\n+/).flatMap((ln) => wrapText(font, ln, bodySize, maxWidth));
      for (const line of lines) {
        if (y < margin + lineHeight) {
          currentPage.drawText("(continued)", { x: margin, y: margin, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
          currentPage = doc.addPage([A4.width, A4.height]);
          y = A4.height - margin;
        }
        currentPage.drawText(line, { x: margin, y, size: bodySize, font });
        y -= lineHeight;
      }
    }

    const bytes = await doc.save();
    const base = f.name.replace(/\.[^/.]+$/, "");
    results.push({ blob: new Blob([bytes], { type: "application/pdf" }), suggestedName: `${base}.pdf` });
    i++;
    onProgress?.((i / files.length) * 100);
  }

  return results;
}

export async function pdfToDocx(files: File[], onProgress?: ProgressCb): Promise<{ blob: Blob; suggestedName: string }[]> {
  const results: { blob: Blob; suggestedName: string }[] = [];
  let i = 0;

  for (const f of files) {
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const docxParagraphs: Paragraph[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        
        if (content.items.length === 0) {
            continue;
        }

        // Sort items by their vertical, then horizontal position.
        const sortedItems = content.items.sort((a: any, b: any) => {
            if (Math.abs(a.transform[5] - b.transform[5]) > 5) { // Different lines
                return b.transform[5] - a.transform[5]; // Higher y first
            }
            return a.transform[4] - b.transform[4]; // Same line, sort by x
        });

        let lineBuffer: string[] = [];
        let lastY = sortedItems[0].transform[5];

        for (const item of sortedItems) {
            if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
                const currentY = item.transform[5];
                if (Math.abs(currentY - lastY) > 5) { // New line
                    if (lineBuffer.length > 0) {
                        const sanitizedText = sanitizeTextForDocx(lineBuffer.join(' '));
                        docxParagraphs.push(new Paragraph({ children: [new TextRun(sanitizedText)] }));
                    }
                    lineBuffer = [item.str];
                } else {
                    lineBuffer.push(item.str);
                }
                lastY = currentY;
            }
        }
        // Add the last line
        if (lineBuffer.length > 0) {
            const sanitizedText = sanitizeTextForDocx(lineBuffer.join(' '));
            docxParagraphs.push(new Paragraph({ children: [new TextRun(sanitizedText)] }));
        }
        
        const fileProgress = pageNum / pdf.numPages;
        const totalProgress = ((i + fileProgress) / files.length) * 100;
        onProgress?.(totalProgress);
      }

      if (docxParagraphs.length === 0) {
        docxParagraphs.push(new Paragraph({ children: [new TextRun("(no text extracted)")] }));
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: docxParagraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const base = f.name.replace(/\.pdf$/i, "");
      results.push({ blob, suggestedName: `${base}.docx` });
      i++;
    } catch (error) {
      console.error(`Failed to convert ${f.name}:`, error);
      let message = `Conversion of "${f.name}" failed.`;
      if (error instanceof Error) {
        if (error.name === 'PasswordException') {
          message = `Conversion of "${f.name}" failed because it is password-protected.`;
        } else {
          message = `Error converting "${f.name}": ${error.message}`;
        }
      }
      // Re-throw a more informative error
      throw new Error(message);
    }
  }

  return results;
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
