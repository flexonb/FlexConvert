import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  status: "idle" | "processing" | "success" | "error";
  progress?: number;
  message?: string;
  className?: string;
}

export default function ProcessingStatus({
  status,
  progress = 0,
  message,
  className
}: ProcessingStatusProps) {
  if (status === "idle") return null;

  const getSubtitle = () => {
    if (message) return message;
    if (status === "processing") {
      if (progress < 25) return "Preparing files...";
      if (progress < 60) return "Processing...";
      if (progress < 90) return "Optimizing output...";
      return "Finalizing...";
    }
    if (status === "success") return "Your files are ready to download.";
    if (status === "error") return "Please try again or pick different files.";
    return "";
  };

  const role = status === "error" ? "alert" : "status";
  const ariaLive = status === "error" ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-busy={status === "processing" ? true : undefined}
      className={`rounded-lg p-3 border shadow-sm bg-white/70 dark:bg-gray-900/60 backdrop-blur ${className}`}
    >
      <div className="flex items-center space-x-3">
        {status === "processing" && (
          <div className="relative">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <div className="absolute inset-0 blur-md opacity-50 bg-blue-500/30 rounded-full" />
          </div>
        )}
        {status === "success" && (
          <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
        )}
        {status === "error" && (
          <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
        )}
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {status === "processing" && "Processing"}
            {status === "success" && "Completed successfully"}
            {status === "error" && "Processing failed"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {getSubtitle()}
          </p>
        </div>
      </div>
      
      {status === "processing" && (
        <div className="mt-2">
          <Progress value={progress} aria-label="Processing progress" />
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(progress)}% complete
          </div>
        </div>
      )}
    </div>
  );
}
