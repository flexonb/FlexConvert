import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, Sparkles, Share2 } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: "blue" | "green" | "purple" | "amber";
  accepts?: string[];
  meta?: string;
  onClick: () => void;
  buttonText?: string;
  buttonVariant?: "default" | "secondary" | "outline";
  disabled?: boolean;
  onShare?: () => void;
  showShareButton?: boolean;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  accent = "blue",
  accepts,
  meta,
  onClick,
  buttonText = "Run",
  buttonVariant = "secondary",
  disabled = false,
  onShare,
  showShareButton = false
}: ToolCardProps) {
  const styles = {
    blue: {
      bg: "from-blue-500/10 to-indigo-500/20 dark:from-blue-500/20 dark:to-indigo-500/30",
      text: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
      stripe: "from-blue-500/50 via-indigo-500/50 to-transparent",
    },
    green: {
      bg: "from-emerald-500/10 to-green-500/20 dark:from-emerald-500/20 dark:to-green-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
      stripe: "from-emerald-500/50 via-green-500/50 to-transparent",
    },
    purple: {
      bg: "from-purple-500/10 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/30",
      text: "text-purple-600 dark:text-purple-400",
      ring: "ring-purple-500/20",
      stripe: "from-purple-500/50 via-pink-500/50 to-transparent",
    },
    amber: {
      bg: "from-amber-500/10 to-orange-500/20 dark:from-amber-500/20 dark:to-orange-500/30",
      text: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
      stripe: "from-amber-500/50 via-orange-500/50 to-transparent",
    },
  }[accent];

  const handleClick = () => {
    if (!disabled) onClick();
  };

  const disabledHint =
    disabled && (buttonText.toLowerCase().startsWith("need") || buttonText.toLowerCase().startsWith("max"))
      ? buttonText
      : undefined;

  const describedBy = disabledHint ? `${title.replace(/\s+/g, "-").toLowerCase()}-hint` : undefined;

  return (
    <div className="group relative">
      {/* animated accent stripe at top */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-x-6 -top-1 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          `bg-gradient-to-r ${styles.stripe}`
        )}
      />
      <Card
        role="button"
        title={title}
        aria-label={title}
        aria-disabled={disabled}
        aria-describedby={describedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "relative overflow-hidden transition-all duration-300 rounded-2xl border border-transparent backdrop-blur-xl",
          "bg-white/80 dark:bg-gray-900/80",
          "hover:shadow-2xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/40",
          "hover:-translate-y-1",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
        )}
      >
        {/* soft ring on hover */}
        <div className={cn("absolute inset-0 rounded-2xl pointer-events-none ring-0 group-hover:ring-4 transition-all", styles.ring)} />

        {/* subtle grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.5) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            maskImage: "radial-gradient(ellipse at 80% -20%, black 20%, transparent 60%)",
          }}
        />

        <CardContent className="relative p-5 space-y-4">
          {/* Icon and header */}
          <div className="flex items-start justify-between">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br",
              styles.bg
            )}>
              <Icon className={cn("w-6 h-6", styles.text)} />
            </div>

            <div className="flex items-center gap-1">
              {showShareButton && onShare && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  title="Share configuration"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                <Sparkles className="w-4 h-4 text-gray-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>

            {meta && (
              <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                {meta}
              </p>
            )}

            {accepts && accepts.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2 cursor-help inline-flex items-center gap-1">
                    <span>Supports {accepts.length} format{accepts.length > 1 ? "s" : ""}</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs text-xs">
                    {accepts.join(", ")}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Action button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={disabled}
            className={cn(
              "w-full h-10 rounded-xl transition-all duration-200 group/btn",
              buttonVariant === "default"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            )}
            variant={buttonVariant}
          >
            <span className="flex items-center justify-center gap-2">
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </span>
          </Button>

          {disabledHint && (
            <p id={describedBy} className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
              {disabledHint}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
