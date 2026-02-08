import { createContext, useContext, useEffect, useState } from "react";

type Theme =
  | "system"
  | "brutalist"
  | "cyberpunk"
  | "luxury"
  | "organic"
  | "ocean"
  | "sunset";

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

    // Remove all theme classes
    root.classList.remove(
      "brutalist",
      "cyberpunk",
      "luxury",
      "organic",
      "ocean",
      "sunset",
    );

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

// Export available themes for use in components
export const AVAILABLE_THEMES: {
  value: Theme;
  label: string;
  description: string;
}[] = [
  { value: "system", label: "System", description: "Follow system preference" },
  {
    value: "brutalist",
    label: "Brutalist",
    description: "Bold black & red design",
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    description: "Neon green & pink vibes",
  },
  { value: "luxury", label: "Luxury", description: "Elegant gold accents" },
  { value: "organic", label: "Organic", description: "Natural green tones" },
  { value: "ocean", label: "Ocean", description: "Deep blue serenity" },
  { value: "sunset", label: "Sunset", description: "Warm purple & orange" },
];
