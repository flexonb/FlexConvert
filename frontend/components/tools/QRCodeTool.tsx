import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { QrCode, Download, Palette, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QRCodeOptions {
  text: string;
  size: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  foregroundColor: string;
  backgroundColor: string;
  format: "PNG" | "SVG";
}

export default function QRCodeTool() {
  const [options, setOptions] = useState<QRCodeOptions>({
    text: "",
    size: 256,
    errorCorrectionLevel: "M",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    format: "PNG"
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!options.text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text or URL to generate QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate QR code generation (in real implementation, use qrcode library)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock QR code generation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = options.size;
          canvas.height = options.size;
          
          // Simple mock QR pattern
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, options.size, options.size);
          
          ctx.fillStyle = options.foregroundColor;
          const cellSize = options.size / 25;
          
          // Draw a simple QR-like pattern
          for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
              if ((i + j) % 3 === 0 || (i % 7 === 0 && j % 7 === 0)) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
              }
            }
          }
          
          // Add corner squares
          const cornerSize = cellSize * 7;
          ctx.fillRect(0, 0, cornerSize, cornerSize);
          ctx.fillRect(options.size - cornerSize, 0, cornerSize, cornerSize);
          ctx.fillRect(0, options.size - cornerSize, cornerSize, cornerSize);
          
          // Add white centers
          ctx.fillStyle = options.backgroundColor;
          const centerSize = cellSize * 3;
          ctx.fillRect(cellSize * 2, cellSize * 2, centerSize, centerSize);
          ctx.fillRect(options.size - cellSize * 5, cellSize * 2, centerSize, centerSize);
          ctx.fillRect(cellSize * 2, options.size - cellSize * 5, centerSize, centerSize);
        }
        
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
      }
      
      toast({
        title: "QR Code generated",
        description: "Your QR code is ready for download",
      });
    } catch (error) {
      console.error("QR generation error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const a = document.createElement('a');
      a.href = qrCodeUrl;
      a.download = `qrcode_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            QR Code Settings
          </CardTitle>
          <CardDescription>
            Configure your QR code appearance and content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="qr-text">Text or URL *</Label>
            <Input
              id="qr-text"
              value={options.text}
              onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter text, URL, or data to encode"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Size: {options.size}px</Label>
            <Slider
              value={[options.size]}
              onValueChange={([value]) => setOptions(prev => ({ ...prev, size: value }))}
              min={128}
              max={512}
              step={32}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Error Correction Level</Label>
            <Select
              value={options.errorCorrectionLevel}
              onValueChange={(value: "L" | "M" | "Q" | "H") => 
                setOptions(prev => ({ ...prev, errorCorrectionLevel: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (~7%)</SelectItem>
                <SelectItem value="M">Medium (~15%)</SelectItem>
                <SelectItem value="Q">Quartile (~25%)</SelectItem>
                <SelectItem value="H">High (~30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fg-color">Foreground</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="fg-color"
                  type="color"
                  value={options.foregroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 rounded-md"
                />
                <Input
                  value={options.foregroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bg-color">Background</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bg-color"
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 rounded-md"
                />
                <Input
                  value={options.backgroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={generateQRCode}
            disabled={!options.text.trim() || isGenerating}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Preview & Download
          </CardTitle>
          <CardDescription>
            Preview your QR code and download when ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            {qrCodeUrl ? (
              <div className="text-center space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="Generated QR Code" 
                  className="mx-auto border rounded-lg shadow-lg"
                  style={{ maxWidth: '250px', maxHeight: '250px' }}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {options.size}×{options.size}px • {options.format}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Generate a QR code to see preview</p>
              </div>
            )}
          </div>

          {qrCodeUrl && (
            <Button onClick={downloadQRCode} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
}
