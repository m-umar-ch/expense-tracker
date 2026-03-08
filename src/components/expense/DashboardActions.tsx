import {
  Plus,
  Wallet,
  FolderOpen,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePeriod } from "../../types/expense";
import {
  getNextPeriodDate,
  getPrevPeriodDate,
  getDateRange,
  formatPeriodRange,
} from "../../utils/date";

interface DashboardActionsProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  referenceDate: number;
  onDateShift: (newDate: number) => void;
  onAddTransaction: (type: "expense" | "income") => void;
  onShowCategories: () => void;
  onShowBudgets: () => void;
  onShowExport: () => void;
  isExportDisabled: boolean;
  dateBoundaries?: { minDate: number; maxDate: number } | null;
}

export function DashboardActions({
  selectedPeriod,
  onPeriodChange,
  referenceDate,
  onDateShift,
  onAddTransaction,
  onShowCategories,
  onShowBudgets,
  onShowExport,
  isExportDisabled,
  dateBoundaries,
}: DashboardActionsProps) {
  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "weekly":
        return "Week";
      case "monthly":
        return "Month";
      case "3months":
        return "3 Months";
      case "6months":
        return "6 Months";
      case "yearly":
        return "Year";
      default:
        return "";
    }
  };

  const periodLabel = getPeriodLabel(selectedPeriod);
  const { startDate, endDate } = getDateRange(selectedPeriod, referenceDate);
  const formattedRange = formatPeriodRange(selectedPeriod, startDate, endDate);

  const now = Date.now();
  const isCurrentPeriod = now >= startDate && now <= endDate;

  // Navigation bounds logic
  const hasPrev = !dateBoundaries || dateBoundaries.minDate < startDate;
  const maxAllowedDate = Math.max(now, dateBoundaries?.maxDate || 0);
  const hasNext = !dateBoundaries || endDate < maxAllowedDate;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex-1 w-full md:w-auto space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Time Period Select
        </h2>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriod}
            onValueChange={(value) => onPeriodChange(value as TimePeriod)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "3months", label: "3 Months" },
                { value: "6months", label: "6 Months" },
                { value: "yearly", label: "Yearly" },
                { value: "all", label: "All Time" },
              ].map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPeriod !== "all" && (
            <div className="flex items-center gap-2 shrink-0 bg-background/50 backdrop-blur rounded-lg p-1 border">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 font-medium hover:bg-background"
                onClick={() =>
                  onDateShift(getPrevPeriodDate(selectedPeriod, referenceDate))
                }
                title={`Previous ${periodLabel}`}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
              {!isCurrentPeriod && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-primary hover:bg-background shrink-0"
                  onClick={() => onDateShift(Date.now())}
                  title={`Go to Current ${periodLabel}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
              <div className="px-2 font-semibold text-sm min-w-[120px] text-center whitespace-nowrap text-foreground shrink-0 overflow-hidden text-ellipsis">
                {formattedRange}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 font-medium hover:bg-background"
                onClick={() =>
                  onDateShift(getNextPeriodDate(selectedPeriod, referenceDate))
                }
                title={`Next ${periodLabel}`}
                disabled={!hasNext}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 md:pt-0">
        <Button onClick={() => onAddTransaction("expense")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
        <Button
          onClick={() => onAddTransaction("income")}
          variant="outline"
          className="gap-2 border-green-500/50 text-green-600 hover:text-green-600 hover:border-green-500/50 hover:bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
        <Button variant="outline" onClick={onShowCategories} className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Categories
        </Button>
        <Button variant="outline" onClick={onShowBudgets} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Budgets
        </Button>
        <Button
          variant="outline"
          onClick={onShowExport}
          disabled={isExportDisabled}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
