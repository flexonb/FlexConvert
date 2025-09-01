import React from "react";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import LinkMenu from "./LinkMenu";
import CategoryDropdownMenu from "./CategoryDropdownMenu";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onOpenSidebar?: () => void;
  onNavigate?: (tab: "pdf" | "image" | "convert" | "stats" | "tools") => void;
}

export default function Header({ onOpenSidebar, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[0_1px_0_0_rgba(0,0,0,0.3)]">
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

            <a href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-lg">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                <div className="absolute inset-[2px] rounded-lg bg-white dark:bg-gray-900 grid place-items-center">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                </div>
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlexConvert
                </h1>
                <p className="hidden xl:block text-[11px] leading-none text-gray-500 dark:text-gray-400 mt-0.5">
                  Offline-first file toolkit
                </p>
              </div>
              <span className="sr-only">FlexConvert Home</span>
            </a>
          </div>

          <div className="hidden lg:flex items-center justify-center flex-1">
            <CategoryDropdownMenu onNavigate={onNavigate} />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LinkMenu />
          </div>
        </div>
      </div>
      {/* subtle bottom gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent dark:via-blue-400/20"
      />
    </header>
  );
}
