import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  FileText, 
  Image, 
  RefreshCcw, 
  BarChart3,
  Merge,
  Scissors,
  Archive,
  RotateCw,
  Move,
  Plus,
  Minus,
  Droplets,
  Crop,
  FlipHorizontal,
  RefreshCw,
  Palette,
  Sun,
  Type,
  Video,
  Music,
  File
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryDropdownMenuProps {
  onNavigate?: (tab: "pdf" | "image" | "convert" | "stats") => void;
}

export default function CategoryDropdownMenu({ onNavigate }: CategoryDropdownMenuProps) {
  const pdfTools = [
    { icon: Merge, label: "Merge PDFs", desc: "Combine multiple PDF files" },
    { icon: Scissors, label: "Split PDF", desc: "Split into individual pages" },
    { icon: Archive, label: "Compress PDF", desc: "Reduce file size" },
    { icon: RotateCw, label: "Rotate Pages", desc: "Rotate PDF pages" },
    { icon: Move, label: "Reorder Pages", desc: "Change page order" },
    { icon: Plus, label: "Add Pages", desc: "Insert blank pages" },
    { icon: Minus, label: "Remove Pages", desc: "Delete specific pages" },
    { icon: Droplets, label: "Add Watermark", desc: "Add text watermark" },
    { icon: Image, label: "PDF to Images", desc: "Convert to JPG/PNG" },
  ];

  const imageTools = [
    { icon: Image, label: "Resize Images", desc: "Change dimensions" },
    { icon: Crop, label: "Crop Images", desc: "Crop to specific area" },
    { icon: Archive, label: "Compress Images", desc: "Reduce file size" },
    { icon: RotateCw, label: "Rotate Images", desc: "Rotate clockwise" },
    { icon: FlipHorizontal, label: "Flip Images", desc: "Flip horizontally/vertically" },
    { icon: RefreshCw, label: "Convert Format", desc: "PNG ↔ JPG ↔ WebP" },
    { icon: Palette, label: "Grayscale", desc: "Convert to grayscale" },
    { icon: Sun, label: "Adjust Colors", desc: "Brightness, contrast" },
    { icon: Type, label: "Add Text", desc: "Text overlay" },
  ];

  const convertTools = [
    { icon: FileText, label: "DOCX → PDF", desc: "Word documents to PDF" },
    { icon: FileText, label: "PPTX → PDF", desc: "PowerPoint to PDF" },
    { icon: FileText, label: "XLSX → PDF", desc: "Excel to PDF" },
    { icon: File, label: "TXT → PDF", desc: "Text files to PDF" },
    { icon: Image, label: "Images → PDF", desc: "Combine images" },
    { icon: FileText, label: "PDF → DOCX", desc: "PDF to Word (basic)" },
    { icon: Video, label: "Video Convert", desc: "Between video formats" },
    { icon: Music, label: "Audio Convert", desc: "Between audio formats" },
    { icon: Archive, label: "Extract Archive", desc: "ZIP/RAR extraction" },
  ];

  const handleNavigate = (tab: "pdf" | "image" | "convert" | "stats") => {
    onNavigate?.(tab);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* PDF Tools */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <FileText className="w-4 h-4" />
            PDF Tools
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
              <div className="row-span-3">
                <div 
                  onClick={() => handleNavigate("pdf")}
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500/20 to-blue-600/40 p-6 no-underline outline-none focus:shadow-md cursor-pointer hover:bg-gradient-to-b hover:from-blue-500/30 hover:to-blue-600/50 transition-all"
                >
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div className="mb-2 mt-4 text-lg font-medium text-blue-900 dark:text-blue-100">
                    PDF Processing
                  </div>
                  <p className="text-sm leading-tight text-blue-700 dark:text-blue-200">
                    Comprehensive PDF editing and manipulation tools for all your document needs.
                  </p>
                </div>
              </div>
              {pdfTools.slice(0, 6).map((tool, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate("pdf")}
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="h-4 w-4 text-blue-500" />
                    <div className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {tool.label}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Image Tools */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
            <Image className="w-4 h-4" />
            Image Tools
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
              <div className="row-span-3">
                <div 
                  onClick={() => handleNavigate("image")}
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-emerald-500/20 to-emerald-600/40 p-6 no-underline outline-none focus:shadow-md cursor-pointer hover:bg-gradient-to-b hover:from-emerald-500/30 hover:to-emerald-600/50 transition-all"
                >
                  <Image className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div className="mb-2 mt-4 text-lg font-medium text-emerald-900 dark:text-emerald-100">
                    Image Processing
                  </div>
                  <p className="text-sm leading-tight text-emerald-700 dark:text-emerald-200">
                    Professional image editing tools for resizing, cropping, format conversion and more.
                  </p>
                </div>
              </div>
              {imageTools.slice(0, 6).map((tool, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate("image")}
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="h-4 w-4 text-emerald-500" />
                    <div className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {tool.label}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Convert Tools */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            <RefreshCcw className="w-4 h-4" />
            Convert
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
              <div className="row-span-3">
                <div 
                  onClick={() => handleNavigate("convert")}
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500/20 to-purple-600/40 p-6 no-underline outline-none focus:shadow-md cursor-pointer hover:bg-gradient-to-b hover:from-purple-500/30 hover:to-purple-600/50 transition-all"
                >
                  <RefreshCcw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div className="mb-2 mt-4 text-lg font-medium text-purple-900 dark:text-purple-100">
                    File Conversion
                  </div>
                  <p className="text-sm leading-tight text-purple-700 dark:text-purple-200">
                    Convert between different file formats including documents, images, audio and video.
                  </p>
                </div>
              </div>
              {convertTools.slice(0, 6).map((tool, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate("convert")}
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="h-4 w-4 text-purple-500" />
                    <div className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {tool.label}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Analytics - Simple button that directly navigates */}
        <NavigationMenuItem>
          <Button
            onClick={() => handleNavigate("stats")}
            variant="ghost"
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 h-10 px-3 py-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
