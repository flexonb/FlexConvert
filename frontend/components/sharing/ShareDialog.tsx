import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Check, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SharingService } from "../../utils/sharing";
import type { ShareConfig } from "~backend/sharing/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file?: File;
  config?: ShareConfig;
  type: "file" | "config";
}

export default function ShareDialog({ open, onOpenChange, file, config, type }: ShareDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [hasDownloadLimit, setHasDownloadLimit] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your share",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      let shareId: string;

      if (type === "file" && file) {
        shareId = await SharingService.shareFile(file, {
          title: title.trim(),
          description: description.trim() || undefined,
          maxDownloads: hasDownloadLimit ? maxDownloads : undefined,
          expiresInHours: hasExpiration ? expiresInHours : undefined,
        });
      } else if (type === "config" && config) {
        shareId = await SharingService.shareConfig(config, {
          title: title.trim(),
          description: description.trim() || undefined,
          maxDownloads: hasDownloadLimit ? maxDownloads : undefined,
          expiresInHours: hasExpiration ? expiresInHours : undefined,
        });
      } else {
        throw new Error("Invalid share type or missing data");
      }

      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);

      toast({
        title: "Share created successfully",
        description: "Your share link is ready to use",
      });
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Failed to create share",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setHasExpiration(false);
    setExpiresInHours(24);
    setHasDownloadLimit(false);
    setMaxDownloads(10);
    setShareUrl("");
    setCopied(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  if (shareUrl) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              Share Created
            </DialogTitle>
            <DialogDescription>
              Your {type} has been shared successfully. Copy the link below to share with others.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="share-url">Share URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Share Settings:</p>
              <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                <li>• Title: {title}</li>
                {hasExpiration && <li>• Expires in: {expiresInHours} hours</li>}
                {hasDownloadLimit && <li>• Max downloads: {maxDownloads}</li>}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share {type === "file" ? "File" : "Configuration"}
          </DialogTitle>
          <DialogDescription>
            Create a shareable link for your {type === "file" ? "processed file" : "tool configuration"}.
            {type === "file" ? " The file will be uploaded to our secure storage." : " Others can import your settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "file" ? file?.name || "My shared file" : "My tool configuration"}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="expiration">Set expiration</Label>
              <Switch
                id="expiration"
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
            </div>

            {hasExpiration && (
              <div>
                <Label>Expires in (hours)</Label>
                <Select value={expiresInHours.toString()} onValueChange={(v) => setExpiresInHours(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                    <SelectItem value="720">1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="download-limit">Limit downloads</Label>
              <Switch
                id="download-limit"
                checked={hasDownloadLimit}
                onCheckedChange={setHasDownloadLimit}
              />
            </div>

            {hasDownloadLimit && (
              <div>
                <Label>Max downloads</Label>
                <Select value={maxDownloads.toString()} onValueChange={(v) => setMaxDownloads(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 download</SelectItem>
                    <SelectItem value="5">5 downloads</SelectItem>
                    <SelectItem value="10">10 downloads</SelectItem>
                    <SelectItem value="25">25 downloads</SelectItem>
                    <SelectItem value="100">100 downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {type === "file" && file && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
              <p className="font-medium">File: {file.name}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB • Type: {file.type}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!title.trim() || isSharing}>
            {isSharing ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                {type === "file" ? "Uploading..." : "Creating..."}
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Create Share
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
