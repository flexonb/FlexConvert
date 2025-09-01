import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Eye, FileText, Image as ImageIcon, Music, Video, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  onDownload?: () => void;
  showPreview?: boolean;
  compact?: boolean;
}

export default function FilePreview({ 
  file, 
  onRemove, 
  onDownload, 
  showPreview = true,
  compact = false 
}: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!showPreview || !file.type.startsWith('image/')) return;
    
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setIsLoading(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, showPreview]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-gray-500 dark:text-gray-400">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
        {onRemove && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {preview ? (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {isLoading ? (
              <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ) : (
              <img
                src={preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              {onDownload && (
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={onDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {onRemove && (
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onRemove}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                {getFileIcon()}
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-medium truncate">{file.name}</h3>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span className="capitalize">{file.type.split('/')[0] || 'file'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
