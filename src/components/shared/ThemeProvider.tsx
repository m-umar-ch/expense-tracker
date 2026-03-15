import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Theme =
  | "light"
  | "dark"
  | "system"
  | "blue-dark"
  | "amber-light"
  | "amber-dark"
  | "clay-light"
  | "clay-dark"
  | "modern-dark"
  | "neon-dark"
  | "midnight-dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const backendSettings = useQuery(api.functions.settings.getSettings);
  const updateBackendSettings = useMutation(api.functions.settings.updateSettings);

  const [theme, setLocalTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    if (backendSettings !== undefined && backendSettings !== null) {
      if (backendSettings.theme && backendSettings.theme !== localStorage.getItem(storageKey)) {
        // Backend has a theme and it differs from local, sync DOWN
        setLocalTheme(backendSettings.theme as Theme);
        localStorage.setItem(storageKey, backendSettings.theme);
      } else if (!backendSettings.theme && theme) {
        // Backend DOES NOT have a theme, but we do locally. Sync UP
        updateBackendSettings({ theme }).catch(err => console.error("Failed to sync initial theme:", err));
      }
    }
  }, [backendSettings]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all possible theme classes
    const allThemes = AVAILABLE_THEMES.map((t) => t.value).filter(
      (v) => v !== "system",
    );
    root.classList.remove(...allThemes, "light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setLocalTheme(newTheme);
      if (updateBackendSettings) {
        updateBackendSettings({ theme: newTheme }).catch(err => console.error("Failed to sync theme:", err));
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export const AVAILABLE_THEMES = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "blue-dark", label: "Blue Dark" },
  { value: "amber-light", label: "Amber Light" },
  { value: "amber-dark", label: "Amber Dark" },
  { value: "clay-light", label: "Clay Light" },
  { value: "clay-dark", label: "Clay Dark" },
  { value: "modern-dark", label: "Modern Dark" },
  { value: "neon-dark", label: "Neon Dark" },
  { value: "midnight-dark", label: "Midnight Dark" },
];
