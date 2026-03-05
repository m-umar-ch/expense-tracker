import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error);
    console.error("Error info:", errorInfo);

    // Check if it's an authentication error
    if (
      error.message.includes("Unauthenticated") ||
      error.message.includes("ConvexError")
    ) {
      // For auth errors, redirect to auth page
      window.location.href = "/auth";
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
            <div className="border-4 border-red-500 p-8 max-w-lg text-center">
              <h1 className="text-2xl font-bold mb-4 text-red-500">
                Something went wrong!
              </h1>
              <p className="mb-4 text-gray-300">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 border-2 border-white font-bold transition-colors"
              >
                REFRESH PAGE
              </button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-red-400">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
