import { api, APIError } from "encore.dev/api";
import { sharingDB } from "./db";
import { sharesBucket } from "./storage";

interface DownloadFileParams {
  id: string;
}

interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Downloads a shared file
export const downloadFile = api<DownloadFileParams, DownloadResponse>(
  { expose: true, method: "POST", path: "/shares/:id/download" },
  async ({ id }) => {
    const share = await sharingDB.queryRow`
      SELECT id, type, file_name, file_type, file_size, download_count, 
             max_downloads, expires_at
      FROM shares 
      WHERE id = ${id} AND type = 'file'
    `;

    if (!share) {
      throw APIError.notFound("File share not found");
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw APIError.notFound("Share has expired");
    }

    // Check download limit
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      throw APIError.resourceExhausted("Download limit reached");
    }

    // Check if file exists
    const exists = await sharesBucket.exists(`files/${id}`);
    if (!exists) {
      throw APIError.notFound("File not found");
    }

    // Generate download URL (valid for 1 hour)
    const { url } = await sharesBucket.signedDownloadUrl(`files/${id}`, {
      ttl: 3600,
    });

    // Increment download count
    await sharingDB.exec`
      UPDATE shares 
      SET download_count = download_count + 1, updated_at = NOW()
      WHERE id = ${id}
    `;

    return {
      downloadUrl: url,
      fileName: share.file_name,
      fileType: share.file_type,
      fileSize: share.file_size,
    };
  }
);
