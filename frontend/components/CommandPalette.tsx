import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FileText, Image, RefreshCcw, BarChart3, Scissors, Merge, RotateCw, Droplets, Search } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: "pdf" | "image" | "convert" | "stats") => void;
}

export default function CommandPalette({ open, onOpenChange, onSelect }: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const select = (val: "pdf" | "image" | "convert" | "stats") => {
    onSelect(val);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-lg">
        <Command>
          <div className="flex items-center gap-2 px-3 pt-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <CommandInput placeholder="Search tools and actions..." autoFocus />
          </div>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => select("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF Tools</span>
              </CommandItem>
              <CommandItem onSelect={() => select("image")}>
                <Image className="mr-2 h-4 w-4" />
                <span>Image Tools</span>
              </CommandItem>
              <CommandItem onSelect={() => select("convert")}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Convert</span>
              </CommandItem>
              <CommandItem onSelect={() => select("stats")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Quick PDF Actions">
              <CommandItem onSelect={() => select("pdf")}>
                <Merge className="mr-2 h-4 w-4" />
                <span>Merge PDFs</span>
              </CommandItem>
              <CommandItem onSelect={() => select("pdf")}>
                <Scissors className="mr-2 h-4 w-4" />
                <span>Split PDF</span>
              </CommandItem>
              <CommandItem onSelect={() => select("pdf")}>
                <RotateCw className="mr-2 h-4 w-4" />
                <span>Rotate Pages</span>
              </CommandItem>
              <CommandItem onSelect={() => select("pdf")}>
                <Droplets className="mr-2 h-4 w-4" />
                <span>Add Watermark</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
