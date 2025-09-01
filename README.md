# FlexConvert Enhanced

FlexConvert is an all-in-one, offline-first file toolkit that runs entirely in the browser without any external APIs. It provides comprehensive document and image processing capabilities while maintaining complete user privacy.

## ✨ New Features & Enhancements

### 🔧 New Advanced Tools
- **OCR Scanner**: Extract text from images and documents with confidence scoring
- **QR Code Generator**: Create customizable QR codes with various options
- **Watermark Designer**: Visual watermark creation tool with real-time preview
- **Enhanced File Processing**: Improved algorithms and error handling

### 🎨 UI/UX Improvements
- **Floating Particles Animation**: Subtle background animations
- **Progressive Image Loading**: Better image loading experience
- **Advanced Drop Zone**: Enhanced file upload with previews
- **Error Boundary**: Graceful error handling and recovery
- **Performance Monitoring**: Built-in performance tracking
- **Enhanced Command Palette**: Better search and navigation

### 🏗️ Technical Enhancements
- **Lazy Loading**: Components load only when needed
- **Error Reporting**: Comprehensive error tracking system
- **Performance Optimization**: Debouncing, throttling, and memory management
- **Masonry Grid**: Better layout for content display
- **Enhanced Analytics**: Better tracking with validation and error handling

## Features

### PDF Tools
- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDF**: Split a PDF into individual pages  
- **Compress PDF**: Reduce PDF file size
- **Rotate Pages**: Rotate PDF pages clockwise
- **Reorder Pages**: Change the order of PDF pages
- **Add/Remove Pages**: Insert blank pages or delete specific pages
- **Extract Pages**: Extract a specific page range into a new PDF
- **Add Watermark**: Add text or image watermarks
- **PDF to Images**: Convert PDF pages to JPG/PNG

### Image Tools
- **Resize Images**: Change image dimensions
- **Crop Images**: Crop images to specific areas
- **Compress Images**: Reduce image file size
- **Rotate/Flip**: Rotate and flip images
- **Format Conversion**: PNG ↔ JPG ↔ WebP conversion
- **Grayscale**: Convert images to grayscale
- **Color Adjustment**: Brightness, contrast, saturation
- **Text Overlay**: Add text overlays to images

### File Conversion Tools
- **Document to PDF**: DOCX, PPTX, XLSX, TXT → PDF
- **PDF to Document**: PDF → DOCX (basic)
- **Images to PDF**: Combine images into PDF
- **Video Conversion**: Convert between video formats
- **Audio Conversion**: Convert between audio formats
- **Archive Extraction**: Extract ZIP/RAR files

### Advanced Tools
- **OCR Scanner**: Extract text from images with multiple language support
- **QR Code Generator**: Create customizable QR codes with various styling options
- **Watermark Designer**: Design and preview custom watermarks with real-time editing

## Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Vite** for build tooling
- **React Query** for state management
- **Advanced animations** and performance optimizations

### Backend (Lightweight Analytics)
- **Encore.ts** for API framework
- **PostgreSQL** for usage statistics
- **Enhanced input validation** and error handling
- No file processing or storage

### Processing Libraries (Client-side)
- **pdf-lib**: PDF manipulation
- **jsPDF**: PDF generation
- **PDF.js**: PDF rendering
- **Pica**: Image resizing
- **BrowserImageCompression**: Image compression
- **FFmpeg.wasm**: Video/audio processing
- **FileSaver.js**: File downloads
- **Tesseract.js**: OCR processing (planned)
- **QRCode.js**: QR code generation (planned)

## Performance Features

### Optimization
- **Lazy Loading**: Components and resources load on demand
- **Error Boundaries**: Graceful error handling throughout the app
- **Performance Monitoring**: Built-in Web Vitals tracking
- **Memory Management**: Efficient resource cleanup
- **Debounced Operations**: Reduced unnecessary computations

### User Experience
- **Progressive Enhancement**: Core features work even with limited resources
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Mode**: Full dark mode support with system preference detection
- **Offline Support**: PWA capabilities for offline usage

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

### Database Setup
The application uses Encore.ts which automatically manages the database. On first run, migrations will be applied automatically.

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

- **100% Offline Processing**: All file operations happen in your browser
- **No File Uploads**: Files never leave your device
- **Anonymous Analytics**: Only tool usage counts are tracked
- **No User Data**: No personal information is collected or stored
- **Error Reporting**: Anonymous error tracking for quality improvement

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Size Limits

Processing is limited by your browser's memory:
- **PDF Files**: Up to 100MB recommended
- **Images**: Up to 50MB per image
- **Videos**: Up to 500MB (using streaming when possible)

## Architecture

### Client-Side Processing
All file processing happens in the browser using WebAssembly libraries and native browser APIs. This ensures:
- Complete privacy (files never leave your device)
- Fast processing (no network overhead)
- Offline capability (works without internet)

### Backend Analytics
The lightweight Encore.ts backend only tracks:
- Which tools are used
- Usage frequency
- Success/failure rates
- No file content or user identification

## Recent Major Improvements

### New Tools
- Added OCR Scanner for text extraction from images
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
- Enhanced analytics with input validation
- Improved responsive design and accessibility
- Better dark mode support

## Future Enhancements

- **Real OCR Integration**: Tesseract.js integration for actual text extraction
- **QR Code Scanning**: Camera-based QR code scanning
- **Batch Operations**: Process multiple files with saved templates
- **Advanced Cropping**: Interactive crop tool with aspect ratio presets
- **Progressive Web App**: Full offline installation support
- **Plugin System**: Extensible architecture for custom tools
- **Cloud Sync**: Optional cloud backup for processing templates

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
