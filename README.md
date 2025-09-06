# FlexConvert Enhanced

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FlexConvert is an all-in-one, offline-first file toolkit that runs entirely in the browser without any external APIs. It provides comprehensive document and image processing capabilities while maintaining complete user privacy.

## ✨ Features

### 🔧 New Advanced Tools
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

## 🚀 Features Overview

### PDF Tools
- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDF**: Split a PDF into individual pages
- **Compress PDF**: Reduce PDF file size
- **Rotate Pages**: Rotate PDF pages clockwise
- **Reorder Pages**: Change the order of PDF pages
- **Add/Remove Pages**: Insert blank pages or delete specific pages
- **Extract Pages**: Extract a specific page range into a new PDF
- **Add Watermark**: Add text watermarks
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
- **Images to PDF**: Combine images into a PDF
- **Text to PDF**: Convert plain text files to PDF
- **Extract ZIP**: Extract .zip archives in-browser

### Advanced Tools
- **QR Code Generator**: Create customizable QR codes with various styling options
- **Watermark Designer**: Design and preview custom watermarks with real-time editing

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Vite** for build tooling
- **React Query** for state management
- Advanced animations and performance optimizations

### Backend
- **Encore.ts** for API backend
- **PostgreSQL** for database
- **Object Storage** for file sharing

### Processing Libraries (Client-side)
- **pdf-lib**: PDF manipulation
- **jsPDF**: PDF generation
- **PDF.js**: PDF rendering
- **Pica**: Image resizing
- **BrowserImageCompression**: Image compression
- **FileSaver.js**: File downloads
- **QRCode.js**: QR code generation

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

## 🏃‍♂️ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flexconvert.git
cd flexconvert
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4000`.

## 🐳 Docker Development

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t flexconvert .

# Run the container
docker run -p 4000:4000 flexconvert
```

### Using Docker Compose (if you have a docker-compose.yml)

```bash
docker-compose up --build
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Configuration

The application uses Encore.ts for the backend. Configure your environment variables:

```bash
# Example environment variables
# Set these in your deployment environment
FRONTEND_URL=https://your-domain.com
```

### Database Setup

The application uses PostgreSQL through Encore.ts. Database migrations are handled automatically.

### Cloud Deployment

#### Vercel/Netlify (Frontend Only)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

#### Railway/Heroku (Full Stack)
1. Connect your GitHub repository
2. Encore.ts will handle the backend deployment automatically

#### Self-Hosted
1. Build the application: `npm run build`
2. Deploy using Docker or serve the `dist` folder with a web server
3. Configure database and object storage connections

## 🎯 Usage

### Basic Workflow
1. **Upload Files**: Drag and drop or click to select files
2. **Choose Tool**: Select from PDF, Image, Convert, or Advanced Tools
3. **Configure**: Set options for your chosen operation
4. **Process**: Files are processed entirely in your browser
5. **Download**: Get your processed files instantly

### Keyboard Shortcuts
- **⌘K / Ctrl + K**: Open Command Palette
- **Drag & Drop**: Add files to any tool
- **Escape**: Close dialogs and panels

### File Sharing (Optional)
- Share processed files with others
- Share tool configurations for reuse
- Set expiration dates and download limits

## 🔒 Privacy & Security

- **100% Offline Processing**: All file operations happen in your browser
- **No File Uploads**: Files never leave your device (except for optional sharing)
- **No Analytics**: No tracking or telemetry is collected
- **No User Data**: No personal information is collected or stored
- **Open Source**: Full transparency with MIT license

## 🌐 Browser Compatibility

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📏 File Size Limits

Processing is limited by your browser's memory:
- **PDF Files**: Up to 100MB recommended
- **Images**: Up to 50MB per image
- **Archives**: Up to 500MB

## 🧑‍💻 Development

### Project Structure

```
flexconvert/
├── backend/                 # Encore.ts backend
│   ├── sharing/            # File sharing service
│   └── ...
├── frontend/               # React frontend
│   ├── components/         # UI components
│   ├── utils/             # Processing utilities
│   ├── hooks/             # React hooks
│   └── ...
├── Dockerfile             # Container configuration
└── README.md             # This file
```

### Key Components

- **Dashboard**: Main application interface
- **Tool Categories**: PDF, Image, Convert, Advanced Tools
- **File Processors**: Client-side processing utilities
- **Sharing System**: Optional file and config sharing

### Adding New Tools

1. Create processing function in `frontend/utils/`
2. Add UI component in appropriate category folder
3. Register in the main tools array
4. Add to recent tools tracking

### Code Style

- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Component-based architecture**
- **Responsive design** with Tailwind CSS

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Submit** a pull request

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include browser version, OS, and reproduction steps
- Check existing issues before creating new ones

## 📖 API Documentation

### Backend API (Encore.ts)

The backend provides optional file sharing capabilities:

- `POST /shares/files` - Create file share
- `POST /shares/configs` - Create config share
- `GET /shares/:id` - Get share details
- `POST /shares/:id/download` - Download shared file
- `GET /shares` - List public shares

### Frontend Processing APIs

All file processing happens client-side using Web APIs and WebAssembly libraries.

## 🔧 Configuration

### Backend Configuration

Configure through Encore.ts environment:

```typescript
// backend/config
const secretKey = secret("SecretKey");
```

### Frontend Configuration

```typescript
// frontend/config.ts
export const config = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ['.pdf', '.jpg', '.png', '.webp'],
  // ... other settings
};
```

## 🆘 Troubleshooting

### Common Issues

**Large files fail to process**
- Your browser may run out of memory
- Try processing smaller batches
- Close other browser tabs

**PDF rendering issues**
- File might be password-protected
- PDF might be corrupted
- Try a different PDF

**Slow performance**
- Processing is CPU intensive
- Keep the browser tab focused
- Close unnecessary applications

### Getting Help

- Check the [Issues](https://github.com/yourusername/flexconvert/issues) page
- Review the [Documentation](https://yoursite.com/docs)
- Contact support through GitHub

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF.js** for PDF rendering capabilities
- **pdf-lib** for PDF manipulation
- **Encore.ts** for the backend framework
- **React** and **TypeScript** communities
- **Tailwind CSS** for the design system
- All contributors and users of FlexConvert

## 🔗 Links

- **Live Demo**: [https://flexconvert.app](https://flexconvert.app)
- **Documentation**: [https://docs.flexconvert.app](https://docs.flexconvert.app)
- **GitHub Issues**: [https://github.com/yourusername/flexconvert/issues](https://github.com/yourusername/flexconvert/issues)

---

**Made with ❤️ by BUGINGO Flexon**

*If you find FlexConvert useful, please consider giving it a ⭐ on GitHub!*
