import { api } from "encore.dev/api";
import { sharingDB } from "./db";
import { sharesBucket } from "./storage";

interface CleanupResponse {
  deletedShares: number;
  deletedFiles: number;
}

// Cleans up expired shares (admin endpoint)
export const cleanupExpired = api<void, CleanupResponse>(
  { expose: false, method: "POST", path: "/admin/cleanup" },
  async () => {
    // Get expired file shares to delete files from storage
    const expiredFileShares = await sharingDB.queryAll`
      SELECT id FROM shares 
      WHERE type = 'file' AND expires_at IS NOT NULL AND expires_at < NOW()
    `;

    let deletedFiles = 0;
    for (const share of expiredFileShares) {
      try {
        await sharesBucket.remove(`files/${share.id}`);
        deletedFiles++;
      } catch (error) {
        // File might not exist, continue with cleanup
        console.warn(`Failed to delete file for share ${share.id}:`, error);
      }
    }

    // Delete expired shares from database
    const result = await sharingDB.queryRow`
      DELETE FROM shares 
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
      RETURNING count(*) as deleted_count
    `;

    return {
      deletedShares: result?.deleted_count || 0,
      deletedFiles,
    };
  }
);
