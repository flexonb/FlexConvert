interface ErrorInfo {
  error: Error;
  errorInfo?: any;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private errors: ErrorInfo[] = [];
  private maxErrors = 50;

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  public reportError(error: Error, errorInfo?: any, userId?: string): void {
    const errorData: ErrorInfo = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.errors.unshift(errorData);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorData);
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('flexconvert_errors', JSON.stringify(this.errors.slice(0, 10)));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem('flexconvert_errors');
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

export const errorReporter = ErrorReporter.getInstance();

// Global error handler
window.addEventListener('error', (event) => {
  errorReporter.reportError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorReporter.reportError(
    new Error(event.reason?.message || 'Unhandled Promise Rejection'),
    { reason: event.reason }
  );
});
