import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, Share2, FileText, Image, RefreshCw, Wand2, Calendar, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SharingService } from "../../utils/sharing";
import type { ShareResponse } from "~backend/sharing/types";

export default function ShareView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (shareId) {
      loadShare(shareId);
    }
  }, [shareId]);

  const loadShare = async (id: string) => {
    try {
      const shareData = await SharingService.getShare(id);
      setShare(shareData);
    } catch (error) {
      console.error("Load share error:", error);
      toast({
        title: "Share not found",
        description: error instanceof Error ? error.message : "Could not load share",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!share || share.type !== "file") return;

    setDownloading(true);
    try {
      const { downloadUrl, fileName } = await SharingService.downloadFile(share.id);
      
      // Create download link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      });

      // Reload share to update download count
      await loadShare(share.id);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not download file",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const getToolIcon = (category?: string) => {
    switch (category) {
      case "pdf": return <FileText className="w-5 h-5 text-blue-600" />;
      case "image": return <Image className="w-5 h-5 text-green-600" />;
      case "convert": return <RefreshCw className="w-5 h-5 text-purple-600" />;
      case "tools": return <Wand2 className="w-5 h-5 text-amber-600" />;
      default: return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading share...</p>
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Share not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This share may have expired or been removed.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go to FlexConvert
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">FlexConvert Share</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Someone shared this {share.type} with you
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {share.type === "file" ? (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Download className="w-6 h-6 text-blue-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      {getToolIcon(share.config?.toolCategory)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{share.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {share.description || `Shared ${share.type}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={share.type === "file" ? "default" : "secondary"}>
                  {share.type}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {share.type === "file" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File name:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{share.fileName}</p>
                    </div>
                    <div>
                      <span className="font-medium">File size:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {share.fileSize ? formatFileSize(share.fileSize) : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">File type:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{share.fileType}</p>
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {share.downloadCount}{share.maxDownloads ? ` / ${share.maxDownloads}` : ""}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    disabled={downloading || (share.maxDownloads && share.downloadCount >= share.maxDownloads)}
                    className="w-full"
                    size="lg"
                  >
                    {downloading ? (
                      <>
                        <Download className="w-5 h-5 mr-2 animate-pulse" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download File
                      </>
                    )}
                  </Button>
                </div>
              )}

              {share.type === "config" && share.config && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {getToolIcon(share.config.toolCategory)}
                      <span className="font-medium">
                        {share.config.toolCategory.toUpperCase()} • {share.config.toolName}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Tool:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{share.config.toolName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{share.config.toolCategory}</span>
                      </div>
                      {share.config.options && Object.keys(share.config.options).length > 0 && (
                        <div>
                          <span className="font-medium">Settings:</span>
                          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
{JSON.stringify(share.config.options, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      // This could navigate to the tool with pre-filled settings
                      const url = `/${share.config?.toolCategory}?config=${encodeURIComponent(JSON.stringify(share.config))}`;
                      window.location.href = url;
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Import Configuration
                  </Button>
                </div>
              )}

              <div className="border-t pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(share.createdAt)}</span>
                </div>
                {share.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {formatDate(share.expiresAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {share.downloadCount} download{share.downloadCount !== 1 ? "s" : ""}
                    {share.maxDownloads ? ` (${share.maxDownloads} max)` : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Try FlexConvert
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
