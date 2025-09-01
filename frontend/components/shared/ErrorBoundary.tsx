import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Bug } from "lucide-react";
import { errorReporter } from "../../utils/errorReporting";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    errorReporter.reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle>Something went wrong</CardTitle>
                  <CardDescription>
                    An unexpected error occurred in the application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                >
                  Try Again
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                If the problem persists, please refresh the page or contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
