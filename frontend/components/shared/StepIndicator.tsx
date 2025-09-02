import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

export default function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center gap-3">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const dot =
            step.status === "complete" ? (
              <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </span>
            ) : step.status === "current" ? (
              <span className="h-6 w-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              </span>
            ) : (
              <span className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-700" />
            );

          return (
            <li key={step.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {dot}
                <span
                  className={cn(
                    "text-sm",
                    step.status === "current"
                      ? "text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-px w-8 sm:w-12",
                    step.status === "complete"
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
