import { api } from "encore.dev/api";
import { sharingDB } from "./db";
import { CreateConfigShareRequest, ShareResponse } from "./types";
import { generateShareId, buildShareUrl } from "./utils";

// Creates a configuration share
export const createConfigShare = api<CreateConfigShareRequest, ShareResponse>(
  { expose: true, method: "POST", path: "/shares/configs" },
  async (req) => {
    const shareId = generateShareId();
    const expiresAt = req.expiresInHours 
      ? new Date(Date.now() + req.expiresInHours * 60 * 60 * 1000)
      : null;

    await sharingDB.exec`
      INSERT INTO shares (
        id, type, title, description, config_data, tool_category, tool_name,
        max_downloads, expires_at
      )
      VALUES (
        ${shareId}, 'config', ${req.title}, ${req.description}, ${JSON.stringify(req.config)}, 
        ${req.config.toolCategory}, ${req.config.toolName}, ${req.maxDownloads}, ${expiresAt}
      )
    `;

    return {
      id: shareId,
      type: "config",
      title: req.title,
      description: req.description,
      config: req.config,
      downloadCount: 0,
      maxDownloads: req.maxDownloads,
      expiresAt: expiresAt?.toISOString(),
      createdAt: new Date().toISOString(),
      shareUrl: buildShareUrl(shareId),
    };
  }
);
