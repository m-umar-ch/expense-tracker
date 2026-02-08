import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Monitor,
  Sun,
  Moon,
  Zap,
  Crown,
  Leaf,
  Waves,
  Sunrise,
  Cpu,
} from "lucide-react";
import { useTheme, AVAILABLE_THEMES } from "../theme-provider";
import { useSettings, CURRENCIES } from "../../contexts/SettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const [activeTab, setActiveTab] = useState<"theme" | "currency" | "other">(
    "theme",
  );

  if (!isOpen) return null;

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case "system":
        return Monitor;
      case "light":
        return Sun;
      case "dark":
        return Moon;
      case "brutalist":
        return Zap;
      case "cyberpunk":
        return Cpu;
      case "luxury":
        return Crown;
      case "organic":
        return Leaf;
      case "ocean":
        return Waves;
      case "sunset":
        return Sunrise;
      default:
        return Monitor;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black border-4 border-red-500 p-8 w-full max-w-2xl mx-4 font-mono">
        {/* Header */}
        <div className="border-b-4 border-red-500 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-wider text-red-500">
              SYSTEM SETTINGS
            </h2>
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-black p-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-red-500 mb-6">
          {[
            { key: "theme", label: "THEME" },
            { key: "currency", label: "CURRENCY" },
            { key: "other", label: "OTHER" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-black uppercase tracking-wider border-r-2 border-red-500 last:border-r-0 ${
                activeTab === tab.key
                  ? "bg-red-500 text-black"
                  : "bg-black text-white hover:bg-red-500/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-4">
              SELECT THEME
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_THEMES.map((themeOption) => {
                const Icon = getThemeIcon(themeOption.value);
                const isActive = theme === themeOption.value;

                return (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value)}
                    className={`p-4 border-2 text-left transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-500/20"
                        : "border-gray-600 hover:border-red-500/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-red-500" : "text-white"}`}
                      />
                      <span
                        className={`font-bold uppercase ${isActive ? "text-red-500" : "text-white"}`}
                      >
                        {themeOption.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {themeOption.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Currency Tab */}
        {activeTab === "currency" && (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-4">
              SELECT CURRENCY
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {CURRENCIES.map((currency) => {
                const isActive = settings.currency === currency.value;

                return (
                  <button
                    key={currency.value}
                    onClick={() => updateSetting("currency", currency.value)}
                    className={`p-4 border-2 text-left transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-500/20"
                        : "border-gray-600 hover:border-red-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`font-bold uppercase block ${isActive ? "text-red-500" : "text-white"}`}
                        >
                          {currency.label}
                        </span>
                        <span className="text-sm text-gray-400">
                          {currency.value}
                        </span>
                      </div>
                      <span
                        className={`text-2xl font-black ${isActive ? "text-red-500" : "text-white"}`}
                      >
                        {currency.symbol}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Tab */}
        {activeTab === "other" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white mb-4">
              OTHER SETTINGS
            </h3>

            {/* Date Format */}
            <div>
              <label className="block text-white font-bold uppercase mb-2">
                DATE FORMAT
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting("dateFormat", e.target.value)}
                className="bg-gray-800 text-white border-2 border-gray-600 focus:border-red-500 p-3 w-full font-mono"
              >
                <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
                <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-white font-bold uppercase mb-2">
                LANGUAGE
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
                className="bg-gray-800 text-white border-2 border-gray-600 focus:border-red-500 p-3 w-full font-mono"
              >
                <option value="en">ENGLISH</option>
                <option value="es">ESPAÑOL</option>
                <option value="fr">FRANÇAIS</option>
                <option value="de">DEUTSCH</option>
                <option value="it">ITALIANO</option>
                <option value="pt">PORTUGUÊS</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-4 border-red-500 pt-6 mt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 font-bold uppercase text-sm">
              SETTINGS SAVED AUTOMATICALLY
            </p>
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-black font-black uppercase px-6 py-3"
            >
              CLOSE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
