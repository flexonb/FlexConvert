import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Type, Image as ImageIcon, Download, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WatermarkSettings {
  type: "text" | "image";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  offsetX: number;
  offsetY: number;
}

export default function WatermarkDesigner() {
  const [settings, setSettings] = useState<WatermarkSettings>({
    type: "text",
    text: "WATERMARK",
    fontSize: 48,
    fontFamily: "Arial",
    color: "#000000",
    opacity: 0.5,
    rotation: 0,
    position: "center",
    offsetX: 0,
    offsetY: 0
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "preview" | "watermark") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "preview") {
          setPreviewImage(result);
        } else {
          setWatermarkImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyWatermark = () => {
    const canvas = canvasRef.current;
    if (!canvas || !previewImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      
      // Apply watermark
      ctx.save();
      ctx.globalAlpha = settings.opacity;
      
      if (settings.type === "text") {
        ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
        ctx.fillStyle = settings.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Calculate position
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        
        switch (settings.position) {
          case "top-left":
            x = canvas.width * 0.2;
            y = canvas.height * 0.2;
            break;
          case "top-right":
            x = canvas.width * 0.8;
            y = canvas.height * 0.2;
            break;
          case "bottom-left":
            x = canvas.width * 0.2;
            y = canvas.height * 0.8;
            break;
          case "bottom-right":
            x = canvas.width * 0.8;
            y = canvas.height * 0.8;
            break;
        }
        
        x += settings.offsetX;
        y += settings.offsetY;
        
        // Apply rotation
        if (settings.rotation !== 0) {
          ctx.translate(x, y);
          ctx.rotate((settings.rotation * Math.PI) / 180);
          ctx.fillText(settings.text, 0, 0);
        } else {
          ctx.fillText(settings.text, x, y);
        }
      }
      
      ctx.restore();
    };
    img.src = previewImage;
  };

  useEffect(() => {
    if (previewImage) {
      setTimeout(applyWatermark, 100);
    }
  }, [settings, previewImage]);

  const downloadWatermarkedImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `watermarked_image_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Download started",
        description: "Your watermarked image has been downloaded",
      });
    }
  };

  const positions = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const fontFamilies = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", 
    "Courier New", "Arial Black", "Impact", "Comic Sans MS"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Watermark Designer
            </CardTitle>
            <CardDescription>
              Design and preview custom watermarks for your images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="preview-image">Upload Preview Image</Label>
              <Input
                id="preview-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "preview")}
                className="mt-1"
              />
            </div>

            <Tabs value={settings.type} onValueChange={(value: "text" | "image") => 
              setSettings(prev => ({ ...prev, type: value }))
            }>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    value={settings.text}
                    onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter watermark text"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, fontSize: value }))}
                      min={12}
                      max={100}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Font Family</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="text-color"
                      type="color"
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10 p-1 rounded-md"
                    />
                    <Input
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="watermark-image">Watermark Image</Label>
                  <Input
                    id="watermark-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "watermark")}
                    className="mt-1"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opacity: {Math.round(settings.opacity * 100)}%</Label>
                <Slider
                  value={[settings.opacity]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, opacity: value }))}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Rotation: {settings.rotation}°</Label>
                <Slider
                  value={[settings.rotation]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, rotation: value }))}
                  min={-45}
                  max={45}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Position</Label>
              <Select
                value={settings.position}
                onValueChange={(value: any) => setSettings(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Offset X: {settings.offsetX}px</Label>
                <Slider
                  value={[settings.offsetX]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, offsetX: value }))}
                  min={-200}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Offset Y: {settings.offsetY}px</Label>
                <Slider
                  value={[settings.offsetY]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, offsetY: value }))}
                  min={-200}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            Preview your watermark design in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
            {previewImage ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Upload an image to preview watermark</p>
                </div>
              </div>
            )}
          </div>

          {previewImage && (
            <Button onClick={downloadWatermarkedImage} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Watermarked Image
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
