import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export type Currency = string;

export interface CustomCurrency {
  value: string;
  label: string;
  symbol: string;
}

interface AppSettings {
  currency: Currency;
  language: string;
  dateFormat: string;
  numberFormat: string;
  privacyMode: boolean;
  customCurrencies: CustomCurrency[];
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
  formatCurrencyCompact: (amount: number) => string;
  allCurrencies: CustomCurrency[];
}

const defaultSettings: AppSettings = {
  currency: "USD",
  language: "en",
  dateFormat: "MM/dd/yyyy",
  numberFormat: "en-US",
  privacyMode: false,
  customCurrencies: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const CURRENCIES: CustomCurrency[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { value: "BRL", label: "Brazilian Real", symbol: "R$" },
  { value: "MXN", label: "Mexican Peso", symbol: "MX$" },
];

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const backendSettings = useQuery(api.functions.settings.getSettings);
  const updateBackendSettings = useMutation(api.functions.settings.updateSettings);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem("app-settings");
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Sync from backend to local state when backend data loads
  useEffect(() => {
    if (backendSettings) {
      setSettings((prev) => ({
        ...prev,
        currency: backendSettings.currency || prev.currency,
        language: backendSettings.language || prev.language,
        dateFormat: backendSettings.dateFormat || prev.dateFormat,
        numberFormat: backendSettings.numberFormat || prev.numberFormat,
        privacyMode: backendSettings.privacyMode !== undefined ? backendSettings.privacyMode : prev.privacyMode,
        customCurrencies: backendSettings.customCurrencies || prev.customCurrencies,
      }));
    }
  }, [backendSettings]);

  // Keep local storage as a fallback for guest users or initial load
  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    
    // Sync to backend
    if (updateBackendSettings) {
      updateBackendSettings({
        currency: nextSettings.currency,
        language: nextSettings.language,
        dateFormat: nextSettings.dateFormat,
        numberFormat: nextSettings.numberFormat,
        privacyMode: nextSettings.privacyMode,
        customCurrencies: nextSettings.customCurrencies,
      }).catch(err => console.error("Failed to sync settings:", err));
    }
  };

  const allCurrencies = useMemo(() => {
    const base = [...CURRENCIES];
    const customs = settings.customCurrencies || [];

    // Combine them, customs override base if values match
    const map = new Map<string, CustomCurrency>();
    base.forEach((c) => map.set(c.value, c));
    customs.forEach((c) => map.set(c.value, c));

    return Array.from(map.values());
  }, [settings.customCurrencies]);

  const getCurrencySymbol = (): string => {
    return (
      allCurrencies.find((c) => c.value === settings.currency)?.symbol || "$"
    );
  };

  const formatCurrency = (amount: number): string => {
    const symbol = getCurrencySymbol();
    try {
      // Check if it's a standard 3-letter currency code for Intl
      const isStandard = /^[A-Z]{3}$/.test(settings.currency);

      if (isStandard) {
        // We use parts to replace the symbol with our custom one if needed
        const formatter = new Intl.NumberFormat(settings.numberFormat, {
          style: "currency",
          currency: settings.currency,
        });

        const parts = formatter.formatToParts(amount);
        return parts
          .map((part) => {
            if (part.type === "currency") return symbol;
            return part.value;
          })
          .join("");
      }

      throw new Error("Generic format");
    } catch {
      // Fallback for custom or unsupported currencies
      return `${symbol}${new Intl.NumberFormat(settings.numberFormat).format(amount)}`;
    }
  };

  const formatCurrencyCompact = (amount: number) => {
    const symbol = getCurrencySymbol();
    try {
      const isStandard = /^[A-Z]{3}$/.test(settings.currency);
      if (isStandard) {
        const formatter = new Intl.NumberFormat(settings.numberFormat, {
          style: "currency",
          currency: settings.currency,
          notation: "compact",
        });
        const parts = formatter.formatToParts(amount);
        return parts
          .map((part) => {
            if (part.type === "currency") return symbol;
            return part.value;
          })
          .join("");
      }
      throw new Error("Generic format");
    } catch {
      return `${symbol}${new Intl.NumberFormat(settings.numberFormat, { notation: "compact" }).format(amount)}`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        getCurrencySymbol,
        formatCurrency,
        formatCurrencyCompact,
        allCurrencies,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
