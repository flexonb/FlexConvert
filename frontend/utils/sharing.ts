import backend from '~backend/client';
import type { ShareConfig, CreateFileShareRequest, CreateConfigShareRequest, ShareResponse } from '~backend/sharing/types';

export class SharingService {
  // Create a file share
  static async createFileShare(request: CreateFileShareRequest): Promise<{ uploadUrl: string; shareId: string }> {
    return backend.sharing.createFileShare(request);
  }

  // Upload file to share
  static async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }

  // Create a config share
  static async createConfigShare(request: CreateConfigShareRequest): Promise<ShareResponse> {
    return backend.sharing.createConfigShare(request);
  }

  // Get a share by ID
  static async getShare(id: string): Promise<ShareResponse> {
    return backend.sharing.getShare({ id });
  }

  // Download a shared file
  static async downloadFile(id: string): Promise<{ downloadUrl: string; fileName: string; fileType: string; fileSize: number }> {
    return backend.sharing.downloadFile({ id });
  }

  // List public shares
  static async listShares(type?: "file" | "config", limit = 20, offset = 0): Promise<{
    shares: ShareResponse[];
    total: number;
    hasMore: boolean;
  }> {
    return backend.sharing.listShares({ type, limit, offset });
  }

  // Helper to create a complete file share (create + upload)
  static async shareFile(
    file: File,
    options: {
      title: string;
      description?: string;
      maxDownloads?: number;
      expiresInHours?: number;
    }
  ): Promise<string> {
    const { uploadUrl, shareId } = await this.createFileShare({
      title: options.title,
      description: options.description,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      maxDownloads: options.maxDownloads,
      expiresInHours: options.expiresInHours,
    });

    await this.uploadFile(uploadUrl, file);
    return shareId;
  }

  // Helper to share a configuration
  static async shareConfig(
    config: ShareConfig,
    options: {
      title: string;
      description?: string;
      maxDownloads?: number;
      expiresInHours?: number;
    }
  ): Promise<string> {
    const share = await this.createConfigShare({
      title: options.title,
      description: options.description,
      config,
      maxDownloads: options.maxDownloads,
      expiresInHours: options.expiresInHours,
    });

    return share.id;
  }
}
