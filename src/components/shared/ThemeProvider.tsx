import { createContext, useContext, useEffect, useState } from "react";

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
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

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
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
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
