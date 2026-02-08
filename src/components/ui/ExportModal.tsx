import { useState } from "react";
import { Expense, TimePeriod } from "../../types/expense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Code, Download, Database } from "lucide-react";

interface ExportModalProps {
  expenses: Expense[];
  selectedPeriod: TimePeriod;
  onClose: () => void;
}

export function ExportModal({
  expenses,
  selectedPeriod,
  onClose,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: Expense[]) => {
    const headers = ["Date", "Name", "Category", "Amount ($)", "Notes"];
    const csvContent = [
      headers.join(","),
      ...data.map((expense) =>
        [
          new Date(expense.date).toLocaleDateString("en-US"),
          `"${expense.name.replace(/"/g, '""')}"`,
          `"${expense.category?.name || "Unknown"}"`,
          expense.amount.toString(),
          `"${(expense.notes || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\\n");

    return csvContent;
  };

  const exportToJSON = (data: Expense[]) => {
    const exportData = data.map((expense) => ({
      date: new Date(expense.date).toISOString(),
      name: expense.name,
      category: expense.category?.name || "Unknown",
      amount: expense.amount,
      notes: expense.notes || "",
      categoryColor: expense.category?.color,
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
        filename = `expenses-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      } else {
        content = exportToJSON(expenses);
        filename = `expenses-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.json`;
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

  const formatPeriodLabel = (period: TimePeriod) => {
    const labels: Record<TimePeriod, string> = {
      weekly: "This Week",
      monthly: "This Month",
      "3months": "Last 3 Months",
      "6months": "Last 6 Months",
      yearly: "This Year",
      all: "All Time",
    };
    return labels[period];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-black border-4 border-red-500 text-white font-mono">
        <DialogHeader className="border-b-4 border-red-500 pb-4 mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-wider text-red-500">
            EXPORT SYSTEM
          </DialogTitle>
          <div className="flex items-center gap-4 mt-3">
            <Badge className="bg-white text-black font-black uppercase px-3 py-1">
              {expenses.length} RECORDS
            </Badge>
            <Badge className="bg-red-500 text-black font-black uppercase px-3 py-1">
              {formatPeriodLabel(selectedPeriod).toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        {expenses.length === 0 ? (
          <div className="bg-red-500 border-4 border-black p-12 text-center">
            <Database className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-2xl font-black uppercase text-black mb-2">
              NO DATA TO EXPORT
            </h3>
            <p className="font-bold uppercase text-black">
              NO EXPENSES FOUND FOR SELECTED PERIOD
            </p>
            <Button
              onClick={onClose}
              className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-black uppercase mt-6 px-8 py-3"
            >
              CLOSE SYSTEM
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Format Selection */}
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-xl font-black uppercase text-black mb-4">
                SELECT EXPORT FORMAT
              </h3>

              <div className="bg-black p-4 space-y-4">
                {/* CSV Option */}
                <Card
                  className={`cursor-pointer transition-colors border-4 ${
                    exportFormat === "csv"
                      ? "border-red-500 bg-red-500"
                      : "border-gray-600 bg-black hover:border-red-500"
                  }`}
                  onClick={() => setExportFormat("csv")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="radio"
                          value="csv"
                          checked={exportFormat === "csv"}
                          onChange={(e) =>
                            setExportFormat(e.target.value as "csv")
                          }
                          className="w-6 h-6 accent-red-500"
                        />
                      </div>
                      <FileText
                        className={`h-8 w-8 ${exportFormat === "csv" ? "text-black" : "text-red-500"}`}
                      />
                      <div className="flex-1">
                        <div
                          className={`font-black uppercase text-lg ${exportFormat === "csv" ? "text-black" : "text-white"}`}
                        >
                          CSV FORMAT
                        </div>
                        <div
                          className={`text-sm font-bold uppercase ${exportFormat === "csv" ? "text-black" : "text-gray-400"}`}
                        >
                          EXCEL • GOOGLE SHEETS • SPREADSHEET COMPATIBLE
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* JSON Option */}
                <Card
                  className={`cursor-pointer transition-colors border-4 ${
                    exportFormat === "json"
                      ? "border-red-500 bg-red-500"
                      : "border-gray-600 bg-black hover:border-red-500"
                  }`}
                  onClick={() => setExportFormat("json")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="radio"
                          value="json"
                          checked={exportFormat === "json"}
                          onChange={(e) =>
                            setExportFormat(e.target.value as "json")
                          }
                          className="w-6 h-6 accent-red-500"
                        />
                      </div>
                      <Code
                        className={`h-8 w-8 ${exportFormat === "json" ? "text-black" : "text-red-500"}`}
                      />
                      <div className="flex-1">
                        <div
                          className={`font-black uppercase text-lg ${exportFormat === "json" ? "text-black" : "text-white"}`}
                        >
                          JSON FORMAT
                        </div>
                        <div
                          className={`text-sm font-bold uppercase ${exportFormat === "json" ? "text-black" : "text-gray-400"}`}
                        >
                          STRUCTURED DATA • API READY • DEVELOPER FRIENDLY
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Export Preview */}
            <div className="bg-red-500 border-4 border-black p-6">
              <h3 className="text-xl font-black uppercase text-black mb-4">
                EXPORT PREVIEW
              </h3>
              <div className="bg-black border-4 border-red-500 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="border-4 border-red-500 p-4">
                    <div className="text-3xl font-black text-white">
                      {expenses.length}
                    </div>
                    <div className="font-bold uppercase text-gray-400 text-sm">
                      TOTAL RECORDS
                    </div>
                  </div>
                  <div className="border-4 border-red-500 p-4">
                    <div className="text-3xl font-black text-white">
                      $
                      {expenses
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </div>
                    <div className="font-bold uppercase text-gray-400 text-sm">
                      TOTAL AMOUNT
                    </div>
                  </div>
                  <div className="border-4 border-red-500 p-4">
                    <div className="text-3xl font-black text-white uppercase">
                      {exportFormat}
                    </div>
                    <div className="font-bold uppercase text-gray-400 text-sm">
                      FILE FORMAT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t-4 border-red-500 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="bg-black border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide px-8 py-4 order-2 sm:order-1"
                >
                  CANCEL EXPORT
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-8 py-4 border-4 border-black order-1 sm:order-2 text-lg"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      EXPORTING...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      DOWNLOAD {exportFormat.toUpperCase()}
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
