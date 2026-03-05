import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTheme, AVAILABLE_THEMES } from "../shared/ThemeProvider";
import { useSettings, CustomCurrency } from "../../contexts/SettingsContext";
import { Monitor, Sun, Moon, EyeOff, Palette, Plus } from "lucide-react";
import { Switch } from "../ui/switch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting, allCurrencies } = useSettings();

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case "system":
        return <Monitor className="w-4 h-4 mr-2" />;
      case "light":
      case "amber-light":
      case "clay-light":
        return <Sun className="w-4 h-4 mr-2" />;
      case "dark":
      case "blue-dark":
      case "amber-dark":
      case "clay-dark":
      case "modern-dark":
      case "neon-dark":
      case "midnight-dark":
        return <Moon className="w-4 h-4 mr-2" />;
      default:
        return <Palette className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme">Appearance</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="localization">Local</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4 py-4">
            <div className="space-y-4">
              <Label>Application Theme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AVAILABLE_THEMES.map(
                  (option: { value: string; label: string }) => (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      className="h-16 flex-col gap-1 px-2 text-center"
                      onClick={() => setTheme(option.value as any)}
                    >
                      <div className="flex items-center">
                        {getThemeIcon(option.value)}
                      </div>
                      <span className="text-[10px] font-bold uppercase truncate w-full">
                        {option.label}
                      </span>
                    </Button>
                  ),
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Active Base Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSetting("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Currency Management
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Add custom currencies or update existing symbols
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase text-muted-foreground px-1">
                  <div>Code (e.g. USD)</div>
                  <div>Label</div>
                  <div>Symbol</div>
                </div>

                {/* New Currency Form */}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="PKR"
                    className="h-8 text-xs"
                    id="new-curr-code"
                  />
                  <Input
                    placeholder="Rupee"
                    className="h-8 text-xs"
                    id="new-curr-label"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Rs"
                      className="h-8 text-xs"
                      id="new-curr-symbol"
                    />
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        const code = (
                          document.getElementById(
                            "new-curr-code",
                          ) as HTMLInputElement
                        ).value.toUpperCase();
                        const label = (
                          document.getElementById(
                            "new-curr-label",
                          ) as HTMLInputElement
                        ).value;
                        const symbol = (
                          document.getElementById(
                            "new-curr-symbol",
                          ) as HTMLInputElement
                        ).value;

                        if (!code || !label || !symbol) return;

                        const newCustoms = [
                          ...(settings.customCurrencies || []),
                        ];
                        newCustoms.push({ value: code, label, symbol });
                        updateSetting("customCurrencies", newCustoms);

                        // Clear inputs
                        (
                          document.getElementById(
                            "new-curr-code",
                          ) as HTMLInputElement
                        ).value = "";
                        (
                          document.getElementById(
                            "new-curr-label",
                          ) as HTMLInputElement
                        ).value = "";
                        (
                          document.getElementById(
                            "new-curr-symbol",
                          ) as HTMLInputElement
                        ).value = "";
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {allCurrencies.map((curr: CustomCurrency) => (
                    <div
                      key={curr.value}
                      className="grid grid-cols-3 gap-2 items-center p-2 rounded-lg bg-muted/20 border"
                    >
                      <div className="text-xs font-bold">{curr.value}</div>
                      <div className="text-xs truncate">{curr.label}</div>
                      <Input
                        value={curr.symbol}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newSymbol = e.target.value;
                          const newCustoms = [
                            ...(settings.customCurrencies || []),
                          ];
                          const idx = newCustoms.findIndex(
                            (c) => c.value === curr.value,
                          );

                          if (idx > -1) {
                            newCustoms[idx] = {
                              ...newCustoms[idx],
                              symbol: newSymbol,
                            };
                          } else {
                            // If it was a base currency, we add it to customs to override
                            newCustoms.push({ ...curr, symbol: newSymbol });
                          }
                          updateSetting("customCurrencies", newCustoms);
                        }}
                        className="h-7 text-xs px-2 w-16"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="localization" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => updateSetting("dateFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (US)</SelectItem>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (EU)</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (ISO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSetting("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold">
                    No-Bullshit Mode
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Instantly blurs all currency amounts and private financial
                  data. Perfect for using ExpenseTrack in cafes, airports, or
                  during screenshares.
                </p>
              </div>
              <Switch
                checked={settings.privacyMode}
                onCheckedChange={(checked) =>
                  updateSetting("privacyMode", checked)
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
