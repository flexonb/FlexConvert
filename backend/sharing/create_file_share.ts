import { api } from "encore.dev/api";
import { sharingDB } from "./db";
import { sharesBucket } from "./storage";
import { CreateFileShareRequest, UploadResponse } from "./types";
import { generateShareId } from "./utils";

// Creates a file share and returns upload URL
export const createFileShare = api<CreateFileShareRequest, UploadResponse>(
  { expose: true, method: "POST", path: "/shares/files" },
  async (req) => {
    const shareId = generateShareId();
    const expiresAt = req.expiresInHours 
      ? new Date(Date.now() + req.expiresInHours * 60 * 60 * 1000)
      : null;

    // Insert share record
    await sharingDB.exec`
      INSERT INTO shares (
        id, type, title, description, file_name, file_type, file_size, 
        max_downloads, expires_at
      )
      VALUES (
        ${shareId}, 'file', ${req.title}, ${req.description}, ${req.fileName}, 
        ${req.fileType}, ${req.fileSize}, ${req.maxDownloads}, ${expiresAt}
      )
    `;

    // Generate upload URL (valid for 1 hour)
    const { url } = await sharesBucket.signedUploadUrl(`files/${shareId}`, {
      ttl: 3600, // 1 hour
    });

    return {
      uploadUrl: url,
      shareId,
    };
  }
);
