import { useState } from "react";
import { Expense, TimePeriod } from "../../types/expense";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Export Expenses</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Exporting <span className="font-semibold">{expenses.length}</span> expenses from{" "}
                <span className="font-semibold">{formatPeriodLabel(selectedPeriod)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === "csv"}
                    onChange={(e) => setExportFormat(e.target.value as "csv")}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">CSV (Comma Separated Values)</div>
                    <div className="text-xs text-gray-500">Compatible with Excel, Google Sheets</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="json"
                    checked={exportFormat === "json"}
                    onChange={(e) => setExportFormat(e.target.value as "json")}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">JSON</div>
                    <div className="text-xs text-gray-500">For developers and data analysis</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || expenses.length === 0}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isExporting ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}