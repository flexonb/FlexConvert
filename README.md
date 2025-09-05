# FlexConvert Enhanced

FlexConvert is an all-in-one, offline-first file toolkit that runs entirely in the browser without any external APIs. It provides comprehensive document and image processing capabilities while maintaining complete user privacy.

## ✨ New Features & Enhancements

### 🔧 New Advanced Tools
- QR Code Generator: Create customizable QR codes with various options
- Watermark Designer: Visual watermark creation tool with real-time preview
- Enhanced File Processing: Improved algorithms and error handling

### 🎨 UI/UX Improvements
- Floating Particles Animation: Subtle background animations
- Progressive Image Loading: Better image loading experience
- Advanced Drop Zone: Enhanced file upload with previews
- Error Boundary: Graceful error handling and recovery
- Performance Monitoring: Built-in performance tracking
- Enhanced Command Palette: Better search and navigation

### 🏗️ Technical Enhancements
- Lazy Loading: Components load only when needed
- Error Reporting: Comprehensive error tracking system
- Performance Optimization: Debouncing, throttling, and memory management
- Masonry Grid: Better layout for content display

## Features

### PDF Tools
- Merge PDFs: Combine multiple PDF files into one
- Split PDF: Split a PDF into individual pages
- Compress PDF: Reduce PDF file size
- Rotate Pages: Rotate PDF pages clockwise
- Reorder Pages: Change the order of PDF pages
- Add/Remove Pages: Insert blank pages or delete specific pages
- Extract Pages: Extract a specific page range into a new PDF
- Add Watermark: Add text watermarks
- PDF to Images: Convert PDF pages to JPG/PNG

### Image Tools
- Resize Images: Change image dimensions
- Crop Images: Crop images to specific areas
- Compress Images: Reduce image file size
- Rotate/Flip: Rotate and flip images
- Format Conversion: PNG ↔ JPG ↔ WebP conversion
- Grayscale: Convert images to grayscale
- Color Adjustment: Brightness, contrast, saturation
- Text Overlay: Add text overlays to images

### File Conversion Tools (Simple, fully in-browser)
- Images to PDF: Combine images into a PDF
- Text to PDF: Convert plain text files to PDF
- Extract ZIP: Extract .zip archives in-browser

Note: Office formats (DOCX, PPTX, XLSX) and PDF → DOCX are not included in the Convert section to ensure everything works reliably offline in the browser. Use the Image and PDF sections for their dedicated tools.

### Advanced Tools
- QR Code Generator: Create customizable QR codes with various styling options
- Watermark Designer: Design and preview custom watermarks with real-time editing

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Vite for build tooling
- React Query for state management
- Advanced animations and performance optimizations

### Processing Libraries (Client-side)
- pdf-lib: PDF manipulation
- jsPDF: PDF generation
- PDF.js: PDF rendering
- Pica: Image resizing
- BrowserImageCompression: Image compression
- FileSaver.js: File downloads
- QRCode.js: QR code generation

## Performance Features

### Optimization
- Lazy Loading: Components and resources load on demand
- Error Boundaries: Graceful error handling throughout the app
- Performance Monitoring: Built-in Web Vitals tracking
- Memory Management: Efficient resource cleanup
- Debounced Operations: Reduced unnecessary computations

### User Experience
- Progressive Enhancement: Core features work even with limited resources
- Responsive Design: Optimized for all screen sizes
- Accessibility: ARIA labels and keyboard navigation
- Dark Mode: Full dark mode support with system preference detection
- Offline Support: PWA capabilities for offline usage

## Local Development

### Prerequisites
- Node.js 18+
- Docker (optional)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:4000

## Deployment

### Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t flexconvert .
   ```
2. Run the container:
   ```bash
   docker run -p 4000:4000 flexconvert
   ```

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Privacy & Security

- 100% Offline Processing: All file operations happen in your browser
- No File Uploads: Files never leave your device
- No Analytics: No tracking or telemetry is collected
- No User Data: No personal information is collected or stored
- Error Reporting: Optional local-only error tracking for quality improvement (no network transmission)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Size Limits

Processing is limited by your browser's memory:
- PDF Files: Up to 100MB recommended
- Images: Up to 50MB per image
- Videos: Up to 500MB (using streaming when possible)

## Architecture

### Client-Side Processing
All file processing happens in the browser using WebAssembly libraries and native browser APIs. This ensures:
- Complete privacy (files never leave your device)
- Fast processing (no network overhead)
- Offline capability (works without internet)

## Recent Major Improvements

### New Tools
- Added QR Code Generator with customization options
- Added Watermark Designer with real-time preview
- Enhanced PDF tools with page extraction feature

### Performance & UX
- Implemented floating particle animations for better visual appeal
- Added progressive image loading for better performance
- Created advanced drop zone with file previews
- Added comprehensive error boundary system
- Implemented performance monitoring and Web Vitals tracking
- Enhanced command palette with better search functionality

### Technical Improvements
- Better error handling and reporting system
- Lazy loading for improved initial load times
- Memory optimization and cleanup
- Improved responsive design and accessibility
- Better dark mode support

## Future Enhancements

- OCR Integration: Text extraction from images/PDFs
- QR Code Scanning: Camera-based QR code scanning
- Batch Operations: Process multiple files with saved templates
- Advanced Cropping: Interactive crop tool with aspect ratio presets
- Progressive Web App: Full offline installation support
- Plugin System: Extensible architecture for custom tools
- Cloud Sync: Optional cloud backup for processing templates
- Audio/Video Conversion: Full FFmpeg.wasm-based conversion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.
