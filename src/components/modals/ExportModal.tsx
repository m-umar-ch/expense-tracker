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
import { Loader2, Database } from "lucide-react";

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
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Export Data</DialogTitle>
        </DialogHeader>
        {expenses.length === 0 && incomes.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <Database className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No data to export</h3>
            <p className="text-muted-foreground">
              There are no records for the selected period.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Format Selection */}
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-4">
                <Label className="mb-2 block">Select Export Format</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as "csv" | "json")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            {/* Summary */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {expenses.length + incomes.length} Records
              </Badge>
              <Badge variant="outline" className="text-sm">
                {formatPeriodLabel(selectedPeriod).toUpperCase()}
              </Badge>
            </div>
            {/* Export Button */}
            <DialogFooter>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>Export {exportFormat.toUpperCase()}</>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
