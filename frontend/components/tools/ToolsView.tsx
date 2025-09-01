import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  QrCode, 
  Droplets, 
  Scissors, 
  Palette, 
  FileText,
  Wand2,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import OCRTool from "./OCRTool";
import QRCodeTool from "./QRCodeTool";
import WatermarkDesigner from "./WatermarkDesigner";

export default function ToolsView() {
  const [activeTab, setActiveTab] = useState("ocr");

  const tools = [
    {
      id: "ocr",
      title: "OCR Scanner",
      description: "Extract text from images and documents",
      icon: Eye,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      component: <OCRTool />
    },
    {
      id: "qrcode",
      title: "QR Code Generator",
      description: "Create customizable QR codes",
      icon: QrCode,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      component: <QRCodeTool />
    },
    {
      id: "watermark",
      title: "Watermark Designer",
      description: "Design and apply custom watermarks",
      icon: Droplets,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      component: <WatermarkDesigner />
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Advanced Tools
          </CardTitle>
          <CardDescription>
            Professional tools for advanced file processing and content creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              
              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`h-auto p-4 flex flex-col items-start gap-3 ${
                    isActive 
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveTab(tool.id)}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : tool.bgColor}`}>
                    <Icon className={`w-6 h-6 ${isActive ? "text-white" : tool.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{tool.title}</div>
                    <div className={`text-sm ${isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                      {tool.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="min-h-[600px]">
            {tools.find(tool => tool.id === activeTab)?.component}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
