export type ToolCategory = "pdf" | "image" | "convert";

export interface RecentTool {
  category: ToolCategory;
  name: string;
  usedAt: number;
  count: number;
}

const STORAGE_KEY = "flexconvert.recentTools";

function readAll(): RecentTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentTool[];
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

function writeAll(items: RecentTool[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function recordToolUsage(category: ToolCategory, name: string) {
  const items = readAll();
  const idx = items.findIndex((t) => t.category === category && t.name === name);
  const now = Date.now();
  if (idx >= 0) {
    items[idx].usedAt = now;
    items[idx].count = (items[idx].count || 0) + 1;
  } else {
    items.push({ category, name, usedAt: now, count: 1 });
  }
  const sorted = items
    .sort((a, b) => b.usedAt - a.usedAt)
    .slice(0, 20);
  writeAll(sorted);
}

export function getRecentTools(max = 6): RecentTool[] {
  return readAll().sort((a, b) => b.usedAt - a.usedAt).slice(0, max);
}

export function clearRecentTools() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Notify other tabs
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    // ignore
  }
}
