export interface ShareConfig {
  toolCategory: "pdf" | "image" | "convert" | "tools";
  toolName: string;
  options: Record<string, any>;
  description?: string;
}

export interface CreateFileShareRequest {
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  maxDownloads?: number;
  expiresInHours?: number;
}

export interface CreateConfigShareRequest {
  title: string;
  description?: string;
  config: ShareConfig;
  maxDownloads?: number;
  expiresInHours?: number;
}

export interface ShareResponse {
  id: string;
  type: "file" | "config";
  title: string;
  description?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  config?: ShareConfig;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt?: string;
  createdAt: string;
  shareUrl: string;
}

export interface UploadResponse {
  uploadUrl: string;
  shareId: string;
}
