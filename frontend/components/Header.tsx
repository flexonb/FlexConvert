import React from "react";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import LinkMenu from "./LinkMenu";
import CategoryDropdownMenu from "./CategoryDropdownMenu";

interface HeaderProps {
  onOpenSidebar?: () => void;
  onNavigate?: (tab: "pdf" | "image" | "convert" | "stats") => void;
}

export default function Header({ onOpenSidebar, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-1 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
              onClick={onOpenSidebar}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                <div className="absolute inset-[2px] rounded-lg bg-white dark:bg-gray-900 grid place-items-center">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlexConvert
                </h2>
              </div>
            </div>
          </div>

          {/* Centered Category Dropdown Menus */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <CategoryDropdownMenu onNavigate={onNavigate} />
          </div>

          <div className="flex items-center gap-3">
            <LinkMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
