import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ExpenseForm, ExpenseList } from "./";
import { CategorySummary, CategoryManager } from "../category";
import { TimePeriodFilter, ExportModal, StatisticsOverview } from "../ui";
import { BudgetOverview, BudgetManager } from "../budget";
import { Category, Expense, CategorySpending, TimePeriod } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Download, FolderOpen, Plus } from "lucide-react";

export function ExpenseTracker() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined,
  );

  const categories =
    (useQuery(api.categories.listCategories) as Category[]) || [];

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case "weekly":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          startDate: weekStart.getTime(),
          endDate: weekEnd.getTime(),
        };
      case "monthly":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        return {
          startDate: monthStart.getTime(),
          endDate: monthEnd.getTime(),
        };
      case "3months":
        const threeMonthsStart = new Date(
          now.getFullYear(),
          now.getMonth() - 2,
          1,
        );
        const threeMonthsEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        return {
          startDate: threeMonthsStart.getTime(),
          endDate: threeMonthsEnd.getTime(),
        };
      case "6months":
        const sixMonthsStart = new Date(
          now.getFullYear(),
          now.getMonth() - 5,
          1,
        );
        const sixMonthsEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        return {
          startDate: sixMonthsStart.getTime(),
          endDate: sixMonthsEnd.getTime(),
        };
      case "yearly":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return {
          startDate: yearStart.getTime(),
          endDate: yearEnd.getTime(),
        };
      case "all":
        return {
          startDate: 0,
          endDate: new Date(2099, 11, 31, 23, 59, 59, 999).getTime(), // Far future date
        };
      default:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
          endDate: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ).getTime(),
        };
    }
  };

  const dateRange = getDateRange(selectedPeriod);
  const expenses =
    (useQuery(api.expenses.listExpenses, dateRange) as Expense[]) || [];
  const categorySpending =
    (useQuery(
      api.expenses.getCategorySpending,
      dateRange,
    ) as CategorySpending[]) || [];

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">Dashboard</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total spent:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBudgetManager(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Budgets
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowExportModal(true)}
                disabled={expenses.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCategoryManager(true)}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Categories
              </Button>
              <Button 
                onClick={() => setShowExpenseForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Period Filter */}
      <TimePeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Statistics Overview */}
      <StatisticsOverview
        expenses={expenses}
        categorySpending={categorySpending}
      />

      {/* Budget Overview */}
      <BudgetOverview categorySpending={categorySpending} />

      {/* Category Summary */}
      <CategorySummary categorySpending={categorySpending} />

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        onEditExpense={(expense) => {
          setEditingExpense(expense);
          setShowExpenseForm(true);
        }}
      />

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          categories={categories}
          editingExpense={editingExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(undefined);
          }}
        />
      )}

      {/* Budget Manager Modal */}
      {showBudgetManager && (
        <BudgetManager
          categories={categories}
          categorySpending={categorySpending}
          onClose={() => setShowBudgetManager(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          expenses={expenses}
          selectedPeriod={selectedPeriod}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}
