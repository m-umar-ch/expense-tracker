import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/shared/ThemeProvider";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <SettingsProvider>
      <ThemeProvider defaultTheme="amber-dark" storageKey="vite-ui-theme">
        <App />
        <Toaster
          richColors
          theme="dark"
          closeButton
          position="bottom-center"
          // duration={2000}
        />
      </ThemeProvider>
    </SettingsProvider>
  </ConvexAuthProvider>,
);
