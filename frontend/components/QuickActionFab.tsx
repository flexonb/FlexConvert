import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Command, Sparkles } from "lucide-react";

interface QuickActionFabProps {
  onOpenPalette: () => void;
}

export default function QuickActionFab({ onOpenPalette }: QuickActionFabProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onOpenPalette}
            className="relative h-14 w-14 rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-110 group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-pulse opacity-30" />
            <Command className="h-6 w-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-200" />
            
            {/* Floating sparkle */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white border-gray-700">
          <div className="text-sm font-medium">Quick Actions</div>
          <div className="text-xs text-gray-300">⌘K or Ctrl+K</div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
