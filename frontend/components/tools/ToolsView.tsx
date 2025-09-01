import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Droplets, 
  Wand2,
} from "lucide-react";
import QRCodeTool from "./QRCodeTool";
import WatermarkDesigner from "./WatermarkDesigner";

export default function ToolsView() {
  const tools = [
    {
      id: "qrcode",
      title: "QR Code Generator",
      icon: QrCode,
      component: <QRCodeTool />
    },
    {
      id: "watermark",
      title: "Watermark Designer",
      icon: Droplets,
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
          <Tabs defaultValue="qrcode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tool.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {tools.map((tool) => (
              <TabsContent key={tool.id} value={tool.id} className="mt-6">
                {tool.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
