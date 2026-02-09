import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "INR"
  | "CNY"
  | "BRL"
  | "MXN";

interface AppSettings {
  currency: Currency;
  language: string;
  dateFormat: string;
  numberFormat: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
}

const defaultSettings: AppSettings = {
  currency: "USD",
  language: "en",
  dateFormat: "MM/dd/yyyy",
  numberFormat: "en-US",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] =
  [
    { value: "USD", label: "US Dollar", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "GBP", label: "British Pound", symbol: "£" },
    { value: "JPY", label: "Japanese Yen", symbol: "¥" },
    { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { value: "AUD", label: "Australian Dollar", symbol: "A$" },
    { value: "INR", label: "Indian Rupee", symbol: "$" },
    { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
    { value: "BRL", label: "Brazilian Real", symbol: "R$" },
    { value: "MXN", label: "Mexican Peso", symbol: "MX$" },
  ];

export function SettingsProvider({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getCurrencySymbol = (): string => {
    return CURRENCIES.find((c) => c.value === settings.currency)?.symbol || "$";
  };

  const formatCurrency = (amount: number): string => {
    const symbol = getCurrencySymbol();
    try {
      return new Intl.NumberFormat(settings.numberFormat, {
        style: "currency",
        currency: settings.currency,
      }).format(amount);
    } catch {
      // Fallback if currency is not supported by Intl.NumberFormat
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        getCurrencySymbol,
        formatCurrency,
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
