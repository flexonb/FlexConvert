import { api, APIError } from "encore.dev/api";
import { sharingDB } from "./db";
import { ShareResponse } from "./types";
import { buildShareUrl } from "./utils";

interface GetShareParams {
  id: string;
}

// Retrieves a share by ID
export const getShare = api<GetShareParams, ShareResponse>(
  { expose: true, method: "GET", path: "/shares/:id" },
  async ({ id }) => {
    const share = await sharingDB.queryRow`
      SELECT id, type, title, description, file_name, file_type, file_size,
             config_data, tool_category, tool_name, download_count, max_downloads,
             expires_at, created_at
      FROM shares 
      WHERE id = ${id}
    `;

    if (!share) {
      throw APIError.notFound("Share not found");
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw APIError.notFound("Share has expired");
    }

    // Check download limit
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      throw APIError.resourceExhausted("Download limit reached");
    }

    return {
      id: share.id,
      type: share.type,
      title: share.title,
      description: share.description,
      fileName: share.file_name,
      fileType: share.file_type,
      fileSize: share.file_size,
      config: share.config_data ? JSON.parse(share.config_data) : undefined,
      downloadCount: share.download_count,
      maxDownloads: share.max_downloads,
      expiresAt: share.expires_at,
      createdAt: share.created_at,
      shareUrl: buildShareUrl(share.id),
    };
  }
);
