import React from "react";
import { Sun, Moon, Laptop2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../theme/ThemeProvider";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme, toggle } = useTheme();

  const icon =
    theme === "dark" ? (
      <Moon className="w-4.5 h-4.5" />
    ) : theme === "light" ? (
      <Sun className="w-4.5 h-4.5" />
    ) : (
      <Laptop2 className="w-4.5 h-4.5" />
    );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label="Toggle theme"
              onDoubleClick={(e) => {
                e.preventDefault();
                toggle();
              }}
              title="Double-click to toggle quickly"
            >
              <span className="sr-only">Theme</span>
              {icon}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Laptop2 className="w-4 h-4" /> System
          </span>
          <Check
            className={cn(
              "w-4 h-4 transition-opacity",
              theme === "system" ? "opacity-100" : "opacity-0"
            )}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Sun className="w-4 h-4" /> Light
          </span>
          <Check
            className={cn(
              "w-4 h-4 transition-opacity",
              theme === "light" ? "opacity-100" : "opacity-0"
            )}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Moon className="w-4 h-4" /> Dark
          </span>
          <Check
            className={cn(
              "w-4 h-4 transition-opacity",
              theme === "dark" ? "opacity-100" : "opacity-0"
            )}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
