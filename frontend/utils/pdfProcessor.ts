import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to a known stable version to avoid mismatches.
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.170/pdf.worker.min.js`;

export interface PDFProcessingOptions {
  quality?: number;
  rotation?: number;
  pageRange?: { start: number; end: number };
  watermarkText?: string;
  watermarkOpacity?: number;
  imageFormat?: 'png' | 'jpeg';
  compressionLevel?: number;
  pageOrder?: number[];
  insertPages?: { position: number; count: number }[];
  removePages?: number[];
}

export class PDFProcessor {
  private static async validatePDFFile(file: File): Promise<void> {
    if (file.type !== 'application/pdf') {
      throw new Error(`Invalid file type: ${file.type}. Please select a valid PDF file.`);
    }

    if (file.size === 0) {
      throw new Error('The selected file is empty.');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size too large. Please select a PDF file smaller than 100MB.');
    }

    // Check for PDF header
    const firstBytes = await file.slice(0, 1024).arrayBuffer();
    const header = new TextDecoder().decode(firstBytes);
    
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF file: Missing PDF header. Please select a valid PDF file.');
    }
  }

  private static async validatePDFBuffer(buffer: ArrayBuffer): Promise<void> {
    if (buffer.byteLength === 0) {
      throw new Error('PDF buffer is empty.');
    }

    const header = new TextDecoder().decode(buffer.slice(0, 1024));
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF data: Missing PDF header.');
    }
  }

  static async mergePDFs(files: File[]): Promise<Blob> {
    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging.');
    }

    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
      try {
        await this.validatePDFFile(file);
        const arrayBuffer = await file.arrayBuffer();
        await this.validatePDFBuffer(arrayBuffer);
        
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        throw new Error(`Error processing file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async splitPDF(file: File): Promise<Blob[]> {
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    if (pageCount === 0) {
      throw new Error('PDF has no pages to split.');
    }
    
    const splitPDFs: Blob[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      
      const pdfBytes = await newPdf.save();
      splitPDFs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    
    return splitPDFs;
  }

  static async compressPDF(file: File, options: PDFProcessingOptions = {}): Promise<Blob> {
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // Basic compression by removing unused objects and optimizing
    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async rotatePDF(file: File, options: PDFProcessingOptions): Promise<Blob> {
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    const rotation = options.rotation || 90;
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages to rotate.');
    }
    
    pages.forEach(page => {
      const currentRotation = page.getRotation().angle;
      page.setRotation({ type: 'degrees', angle: currentRotation + rotation });
    });
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async reorderPDF(file: File, options: PDFProcessingOptions): Promise<Blob> {
    if (!options.pageOrder || options.pageOrder.length === 0) {
      throw new Error('Page order must be specified and cannot be empty.');
    }
    
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    // Validate page indices
    for (const pageIndex of options.pageOrder) {
      if (pageIndex < 0 || pageIndex >= pageCount) {
        throw new Error(`Invalid page index: ${pageIndex}. Pages must be between 0 and ${pageCount - 1}.`);
      }
    }
    
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, options.pageOrder);
    pages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async addPages(file: File, options: PDFProcessingOptions): Promise<Blob> {
    if (!options.insertPages || options.insertPages.length === 0) {
      throw new Error('Insert pages configuration must be specified.');
    }
    
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    // Validate insertion positions
    for (const insertion of options.insertPages) {
      if (insertion.position < 0 || insertion.position > pageCount) {
        throw new Error(`Invalid insertion position: ${insertion.position}. Position must be between 0 and ${pageCount}.`);
      }
      if (insertion.count <= 0) {
        throw new Error(`Invalid page count: ${insertion.count}. Count must be greater than 0.`);
      }
    }
    
    // Sort insertions by position (descending) to maintain correct indices
    const sortedInsertions = [...options.insertPages].sort((a, b) => b.position - a.position);
    
    for (const insertion of sortedInsertions) {
      for (let i = 0; i < insertion.count; i++) {
        const page = pdf.insertPage(insertion.position);
        page.setSize(595.28, 841.89); // A4 size in points
      }
    }
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async removePages(file: File, options: PDFProcessingOptions): Promise<Blob> {
    if (!options.removePages || options.removePages.length === 0) {
      throw new Error('Remove pages configuration must be specified.');
    }
    
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    // Validate page indices
    for (const pageIndex of options.removePages) {
      if (pageIndex < 0 || pageIndex >= pageCount) {
        throw new Error(`Invalid page index: ${pageIndex}. Pages must be between 0 and ${pageCount - 1}.`);
      }
    }
    
    if (options.removePages.length >= pageCount) {
      throw new Error('Cannot remove all pages. At least one page must remain.');
    }
    
    // Sort indices in descending order to maintain correct positions
    const sortedIndices = [...new Set(options.removePages)].sort((a, b) => b - a);
    
    for (const index of sortedIndices) {
      if (index >= 0 && index < pdf.getPageCount()) {
        pdf.removePage(index);
      }
    }
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async addWatermark(file: File, options: PDFProcessingOptions): Promise<Blob> {
    if (!options.watermarkText || options.watermarkText.trim().length === 0) {
      throw new Error('Watermark text must be specified and cannot be empty.');
    }
    
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages to watermark.');
    }
    
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const opacity = Math.max(0.1, Math.min(1, options.watermarkOpacity || 0.3));
    
    pages.forEach(page => {
      const { width, height } = page.getSize();
      
      // Add watermark text diagonally across the page
      page.drawText(options.watermarkText!.trim(), {
        x: width / 4,
        y: height / 2,
        size: 60,
        font,
        color: rgb(0.7, 0.7, 0.7),
        opacity,
        rotate: { type: 'degrees', angle: 45 },
      });
    });
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async convertToImages(file: File, options: PDFProcessingOptions = {}): Promise<Blob[]> {
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: Blob[] = [];
      const format = options.imageFormat || 'png';
      
      if (pdf.numPages === 0) {
        throw new Error('PDF has no pages to convert.');
      }
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2; // Higher scale for better quality
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context for image conversion.');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, `image/${format}`, 0.9);
        });
        
        images.push(blob);
      }
      
      return images;
    } catch (error) {
      if (error instanceof Error && error.message.includes('PDF.js')) {
        throw new Error('Failed to process PDF with PDF.js. The file might be corrupted or password-protected.');
      }
      throw error;
    }
  }

  static async extractPages(file: File, options: PDFProcessingOptions): Promise<Blob> {
    if (!options.pageRange) {
      throw new Error('Page range must be specified.');
    }
    
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    const { start, end } = options.pageRange;
    
    if (start < 0 || end >= pageCount || start > end) {
      throw new Error(`Invalid page range: ${start}-${end}. Valid range is 0-${pageCount - 1}.`);
    }
    
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    const pages = await newPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  static async getPDFInfo(file: File): Promise<{
    pageCount: number;
    fileSize: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  }> {
    await this.validatePDFFile(file);
    
    const arrayBuffer = await file.arrayBuffer();
    await this.validatePDFBuffer(arrayBuffer);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    
    return {
      pageCount: pdf.getPageCount(),
      fileSize: file.size,
      title: pdf.getTitle(),
      author: pdf.getAuthor(),
      subject: pdf.getSubject(),
      creator: pdf.getCreator(),
      producer: pdf.getProducer(),
      creationDate: pdf.getCreationDate()?.toString(),
      modificationDate: pdf.getModificationDate()?.toString(),
    };
  }
}
