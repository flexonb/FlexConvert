import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ToolCategory } from "../utils/recentTools";

type SelectedCategory = ToolCategory | null;

interface SelectionContextValue {
  files: File[];
  category: SelectedCategory;
  setSelection: (files: File[], category: SelectedCategory) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

// Heuristic detector for category based on files
export function detectCategory(files: File[]): { category: ToolCategory; counts: { pdf: number; image: number; other: number } } {
  let pdf = 0, image = 0, other = 0;
  for (const f of files) {
    const name = f.name.toLowerCase();
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    if (f.type === "application/pdf" || ext === ".pdf") {
      pdf++;
    } else if (f.type.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(ext)) {
      image++;
    } else {
      other++;
    }
  }
  let category: ToolCategory = "convert";
  if (files.length > 0 && pdf > 0 && image === 0 && other === 0) category = "pdf";
  else if (files.length > 0 && image > 0 && pdf === 0 && other === 0) category = "image";
  else category = "convert";
  return { category, counts: { pdf, image, other } };
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<SelectedCategory>(null);

  const setSelection = useCallback((f: File[], c: SelectedCategory) => {
    setFiles(f);
    setCategory(c);
  }, []);

  const clearSelection = useCallback(() => {
    setFiles([]);
    setCategory(null);
  }, []);

  const value = useMemo<SelectionContextValue>(() => ({
    files,
    category,
    setSelection,
    clearSelection,
  }), [files, category, setSelection, clearSelection]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
