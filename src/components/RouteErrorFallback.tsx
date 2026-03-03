import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred.";
  let errorDetail = "";

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetail = error.data?.message || error.data || "";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetail = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="max-w-md w-full bg-card border shadow-xl rounded-xl p-8 space-y-6 text-center transform transition-all animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Application Error
          </h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>

        {errorDetail && (
          <div className="text-left bg-muted p-4 rounded-lg overflow-hidden">
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2 tracking-widest">
              Technical Details
            </p>
            <pre className="text-xs font-mono text-destructive/80 overflow-auto max-h-32">
              {errorDetail}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="w-4 h-4" />
            Retry
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
