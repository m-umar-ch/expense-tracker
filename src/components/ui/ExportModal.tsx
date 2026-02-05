import { useState } from "react";
import { Expense, TimePeriod } from "../../types/expense";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Code } from "lucide-react";

interface ExportModalProps {
  expenses: Expense[];
  selectedPeriod: TimePeriod;
  onClose: () => void;
}

export function ExportModal({ expenses, selectedPeriod, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: Expense[]) => {
    const headers = ["Date", "Name", "Category", "Amount (₨)", "Notes"];
    const csvContent = [
      headers.join(","),
      ...data.map(expense => [
        new Date(expense.date).toLocaleDateString('en-PK'),
        `"${expense.name.replace(/"/g, '""')}"`,
        `"${expense.category?.name || 'Unknown'}"`,
        expense.amount.toString(),
        `"${(expense.notes || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\\n");

    return csvContent;
  };

  const exportToJSON = (data: Expense[]) => {
    const exportData = data.map(expense => ({
      date: new Date(expense.date).toISOString(),
      name: expense.name,
      category: expense.category?.name || 'Unknown',
      amount: expense.amount,
      notes: expense.notes || '',
      categoryColor: expense.category?.color
    }));

    return JSON.stringify(exportData, null, 2);
  };

  const handleExport = async () => {
    if (expenses.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === "csv") {
        content = exportToCSV(expenses);
        filename = `expenses-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = "text/csv";
      } else {
        content = exportToJSON(expenses);
        filename = `expenses-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = "application/json";
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatPeriodLabel = (period: TimePeriod) => {
    const labels: Record<TimePeriod, string> = {
      daily: "Today",
      weekly: "This Week", 
      monthly: "This Month",
      "3months": "Last 3 Months",
      "6months": "Last 6 Months",
      yearly: "This Year",
      all: "All Time"
    };
    return labels[period];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Expenses</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Exporting{" "}
              <Badge variant="secondary">{expenses.length} expenses</Badge> from{" "}
              <Badge variant="outline">{formatPeriodLabel(selectedPeriod)}</Badge>
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Export Format</Label>
            
            <div className="space-y-3">
              <Card 
                className={`cursor-pointer transition-colors ${exportFormat === "csv" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setExportFormat("csv")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === "csv"}
                      onChange={(e) => setExportFormat(e.target.value as "csv")}
                      className="text-primary"
                    />
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">CSV (Comma Separated Values)</div>
                      <div className="text-sm text-muted-foreground">
                        Compatible with Excel, Google Sheets
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${exportFormat === "json" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setExportFormat("json")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === "json"}
                      onChange={(e) => setExportFormat(e.target.value as "json")}
                      className="text-primary"
                    />
                    <Code className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">JSON</div>
                      <div className="text-sm text-muted-foreground">
                        For developers and data analysis
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || expenses.length === 0}
              className="flex-1"
            >
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isExporting ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}