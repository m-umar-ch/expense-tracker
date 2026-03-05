import {
  Plus,
  Wallet,
  FolderOpen,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimePeriodFilter } from "../shared/TimePeriodFilter";
import { TimePeriod } from "../../types/expense";
import { getNextPeriodDate, getPrevPeriodDate } from "../../utils/date";

interface DashboardActionsProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  referenceDate: number;
  onDateShift: (newDate: number) => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onShowCategories: () => void;
  onShowBudgets: () => void;
  onShowExport: () => void;
  isExportDisabled: boolean;
}

export function DashboardActions({
  selectedPeriod,
  onPeriodChange,
  referenceDate,
  onDateShift,
  onAddExpense,
  onAddIncome,
  onShowCategories,
  onShowBudgets,
  onShowExport,
  isExportDisabled,
}: DashboardActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex-1 w-full md:w-auto space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Time Period Select
        </h2>
        <div className="flex items-center gap-2">
          <TimePeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 md:pt-0">
        <Button onClick={onAddExpense} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
        <Button
          onClick={onAddIncome}
          variant="outline"
          className="gap-2 border-green-500/50 text-green-600 hover:text-green-600 hover:border-green-500/50 hover:bg-transparent"
        >
          <Wallet className="h-4 w-4" />
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
