import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { sharingDB } from "./db";
import { ShareResponse } from "./types";
import { buildShareUrl } from "./utils";

interface ListSharesParams {
  type?: Query<"file" | "config">;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListSharesResponse {
  shares: ShareResponse[];
  total: number;
  hasMore: boolean;
}

// Lists recent public shares
export const listShares = api<ListSharesParams, ListSharesResponse>(
  { expose: true, method: "GET", path: "/shares" },
  async ({ type, limit = 20, offset = 0 }) => {
    const limitNum = Math.min(100, Math.max(1, limit));
    const offsetNum = Math.max(0, offset);

    let whereClause = "WHERE expires_at IS NULL OR expires_at > NOW()";
    const params: any[] = [];

    if (type) {
      whereClause += " AND type = $" + (params.length + 1);
      params.push(type);
    }

    // Get total count
    const countResult = await sharingDB.rawQueryRow(
      `SELECT COUNT(*) as total FROM shares ${whereClause}`,
      ...params
    );
    const total = countResult?.total || 0;

    // Get shares
    const shares = await sharingDB.rawQueryAll(
      `SELECT id, type, title, description, file_name, file_type, file_size,
              config_data, tool_category, tool_name, download_count, max_downloads,
              expires_at, created_at
       FROM shares 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      ...params,
      limitNum,
      offsetNum
    );

    const shareResponses: ShareResponse[] = shares.map((share) => ({
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
    }));

    return {
      shares: shareResponses,
      total,
      hasMore: offsetNum + limitNum < total,
    };
  }
);
