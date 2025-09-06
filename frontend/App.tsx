import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./components/Dashboard";
import ShareView from "./components/sharing/ShareView";
import SharesList from "./components/sharing/SharesList";
import { ThemeProvider } from "./theme/ThemeProvider";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import "./utils/errorReporting"; // Initialize error reporting
import { SelectionProvider } from "./context/SelectionContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SelectionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={150}>
              <Router>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/share/:shareId" element={<ShareView />} />
                    <Route path="/shares" element={<SharesList />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </TooltipProvider>
          </QueryClientProvider>
        </SelectionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
