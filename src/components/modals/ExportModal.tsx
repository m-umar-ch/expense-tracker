import { useState } from "react";
import { Expense, TimePeriod, Income } from "../../types/expense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Database,
  FileSpreadsheet,
  FileJson,
  Download,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface ExportModalProps {
  expenses: Expense[];
  incomes: Income[];
  selectedPeriod: TimePeriod;
  onClose: () => void;
}

export function ExportModal({
  expenses,
  incomes,
  selectedPeriod,
  onClose,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: Expense[], incomeData: Income[]) => {
    const expenseHeaders = [
      "Type",
      "Date",
      "Name",
      "Category",
      "Amount ($)",
      "Notes",
    ];
    const expenseRows = data.map((item) => [
      "Expense",
      new Date(item.date).toLocaleDateString("en-US"),
      `${item.name.replace(/"/g, '\\"')}`,
      `${item.category?.name || "Unknown"}`,
      item.amount.toString(),
      `${(item.notes || "").replace(/"/g, '\\"')}`,
    ]);
    const incomeRows = incomeData.map((item) => [
      "Income",
      new Date(item.date).toLocaleDateString("en-US"),
      `${item.name.replace(/"/g, '\\"')}`,
      "N/A",
      item.amount.toString(),
      `${(item.notes || "").replace(/"/g, '\\"')}`,
    ]);
    return [
      expenseHeaders.join(","),
      ...expenseRows.map((r) => r.join(",")),
      ...incomeRows.map((r) => r.join(",")),
    ].join("\n");
  };

  const exportToJSON = (data: Expense[], incomeData: Income[]) => {
    const exportData = {
      expenses: data.map((e) => ({
        date: new Date(e.date).toISOString(),
        name: e.name,
        category: e.category?.name || "Unknown",
        amount: e.amount,
        notes: e.notes || "",
      })),
      incomes: incomeData.map((i) => ({
        date: new Date(i.date).toISOString(),
        name: i.name,
        amount: i.amount,
        notes: i.notes || "",
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const formatPeriodLabel = (period: TimePeriod) => {
    const labels: Record<TimePeriod, string> = {
      weekly: "This Week",
      monthly: "This Month",
      "3months": "Last 3 Months",
      "6months": "Last 6 Months",
      yearly: "This Year",
      all: "All Time",
    } as Record<TimePeriod, string>;
    return labels[period];
  };

  const { formatCurrency } = useSettings();

  const handleExport = async () => {
    if (expenses.length === 0 && incomes.length === 0) return;
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      if (exportFormat === "csv") {
        content = exportToCSV(expenses, incomes);
        filename = `financial-data-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      } else {
        content = exportToJSON(expenses, incomes);
        filename = `financial-data-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      }
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Simulation of work
      await new Promise((resolve) => setTimeout(resolve, 800));
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomeAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Export Financial Data
          </DialogTitle>
        </DialogHeader>

        {expenses.length === 0 && incomes.length === 0 ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Database className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No data found</h3>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                There are no financial records to export for the{" "}
                <span className="font-bold text-foreground">
                  {formatPeriodLabel(selectedPeriod)}
                </span>{" "}
                period.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full px-8 font-bold"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="p-6 space-y-6">
              {/* Period & Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/30 border border-border p-3 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Time Range
                    </div>
                    <div className="text-sm font-bold truncate">
                      {formatPeriodLabel(selectedPeriod)}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 border border-border p-3 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Total Records
                    </div>
                    <div className="text-sm font-bold truncate">
                      {expenses.length + incomes.length} Documents
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-card/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-destructive">
                    <TrendingDown className="w-3 h-3" />
                    Total Expenses
                  </div>
                  <div className="text-xl font-black">
                    {formatCurrency(totalExpenseAmount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {expenses.length} transactions
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-card/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    Total Incomes
                  </div>
                  <div className="text-xl font-black">
                    {formatCurrency(totalIncomeAmount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {incomes.length} payments
                  </div>
                </div>
              </div>

              {/* Format Selection Cards */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Select Export Format
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={cn(
                      "relative group p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3",
                      exportFormat === "csv"
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-border/80 bg-card hover:bg-muted/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        exportFormat === "csv"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                      )}
                    >
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">CSV Spreadsheet</div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        Best for Excel & Google Sheets
                      </div>
                    </div>
                    {exportFormat === "csv" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-4 h-4 text-primary fill-primary-foreground" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setExportFormat("json")}
                    className={cn(
                      "relative group p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3",
                      exportFormat === "json"
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-border/80 bg-card hover:bg-muted/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        exportFormat === "json"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                      )}
                    >
                      <FileJson className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">JSON Data</div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        Best for developers & backup
                      </div>
                    </div>
                    {exportFormat === "json" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-4 h-4 text-primary fill-primary-foreground" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer / Action */}
            <div className="bg-muted/30 p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-medium text-muted-foreground sm:max-w-[240px]">
                By exporting, you will download a {exportFormat.toUpperCase()}{" "}
                file containing your financial data for the current view.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isExporting}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2 font-bold min-w-[140px] shadow-lg shadow-primary/20"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      Confirm Export
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
