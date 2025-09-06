import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SharingService } from "../../utils/sharing";
import type { ShareResponse } from "~backend/sharing/types";
import { Download, FileText, Image, RefreshCw, Wand2, Share2, Link, Calendar, Users, Loader2, Search } from "lucide-react";

type ShareType = "all" | "file" | "config";

export default function SharesList() {
  const [type, setType] = useState<ShareType>("all");
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<ShareResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const pageSize = 20;

  const load = async (reset = false) => {
    setLoading(true);
    try {
      const reqType = type === "all" ? undefined : type;
      const resp = await SharingService.listShares(reqType as any, pageSize, reset ? 0 : offset);
      setShares((prev) => reset ? resp.shares : [...prev, ...resp.shares]);
      setHasMore(resp.hasMore);
      setOffset((prev) => reset ? pageSize : prev + pageSize);
    } catch (err) {
      console.error("Failed to load shares:", err);
      toast({
        title: "Failed to load shares",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filteredShares = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shares;
    return shares.filter((s) => {
      const hay = [
        s.title,
        s.description || "",
        s.fileName || "",
        s.config?.toolName || "",
        s.config?.toolCategory || "",
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [shares, query]);

  const iconForCategory = (cat?: string) => {
    switch (cat) {
      case "pdf": return <FileText className="w-4 h-4 text-blue-600" />;
      case "image": return <Image className="w-4 h-4 text-green-600" />;
      case "convert": return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case "tools": return <Wand2 className="w-4 h-4 text-amber-600" />;
      default: return <Share2 className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes && bytes !== 0) return "—";
    const mb = bytes / 1024 / 1024;
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
    };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const openShare = (s: ShareResponse) => {
    window.location.href = `/share/${s.id}`;
  };

  const copyLink = async (s: ShareResponse) => {
    const url = `${window.location.origin}/share/${s.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share URL copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Public Shares</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse shared files and tool configurations from FlexConvert.
            </p>
          </div>

          <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Discover</CardTitle>
                  <CardDescription>Find shared files and reusable tool configurations</CardDescription>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search shares..."
                    className="pl-8 w-72"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={type} onValueChange={(v: string) => setType(v as ShareType)} className="w-full">
                <TabsList className="grid grid-cols-3 max-w-md">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="file">Files</TabsTrigger>
                  <TabsTrigger value="config">Configs</TabsTrigger>
                </TabsList>

                <TabsContent value={type} className="mt-5">
                  {loading && shares.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Loading shares...
                    </div>
                  ) : filteredShares.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-gray-500">
                      No shares found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredShares.map((s) => (
                        <ShareCard key={s.id} share={s} onOpen={() => openShare(s)} onCopy={() => copyLink(s)} />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    {hasMore && (
                      <Button onClick={() => load(false)} disabled={loading} variant="secondary">
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</> : "Load more"}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ShareCard({ share, onOpen, onCopy }: { share: ShareResponse; onOpen: () => void; onCopy: () => void }) {
  const isFile = share.type === "file";

  const icon = isFile ? (
    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
      <Download className="w-5 h-5 text-blue-600" />
    </div>
  ) : (
    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
      {iconForCategory(share.config?.toolCategory)}
    </div>
  );

  const fileInfo = isFile ? `${share.fileType || "file"} • ${formatBytes(share.fileSize)}` : `${share.config?.toolName || "Tool config"}`;

  return (
    <Card className="border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-base line-clamp-1">{share.title}</CardTitle>
              <CardDescription className="line-clamp-2">{share.description || (isFile ? "Shared file" : "Shared configuration")}</CardDescription>
            </div>
          </div>
          <Badge variant={isFile ? "default" : "secondary"} className="capitalize">
            {share.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">{fileInfo}</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created: {formatDate(share.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Users className="w-3.5 h-3.5" />
            <span>{share.downloadCount}{share.maxDownloads ? ` / ${share.maxDownloads}` : ""} downloads</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onOpen}>
            <Share2 className="w-4 h-4 mr-2" />
            Open
          </Button>
          <Button variant="outline" onClick={onCopy}>
            <Link className="w-4 h-4 mr-2" />
            Copy link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function iconForCategory(cat?: string) {
  switch (cat) {
    case "pdf":
      return <FileText className="w-5 h-5 text-blue-600" />;
    case "image":
      return <Image className="w-5 h-5 text-green-600" />;
    case "convert":
      return <RefreshCw className="w-5 h-5 text-purple-600" />;
    case "tools":
      return <Wand2 className="w-5 h-5 text-amber-600" />;
    default:
      return <Share2 className="w-5 h-5 text-gray-600" />;
  }
}

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "—";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${sizes[i]}`;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
