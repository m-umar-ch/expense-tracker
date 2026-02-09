import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
  {
    // Don't pause queries for unauthenticated users since we have public routes
    expectAuth: false,
  },
);
createRoot(document.getElementById("root")!).render(
  <ConvexBetterAuthProvider client={convex} authClient={authClient}>
    <SettingsProvider>
      <ThemeProvider defaultTheme="brutalist" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </SettingsProvider>
  </ConvexBetterAuthProvider>,
);
