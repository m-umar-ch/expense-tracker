import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ExpenseForm, ExpenseList } from "./";
import { CategorySummary, CategoryManager } from "../category";
import { TimePeriodFilter, ExportModal, StatisticsOverview } from "../ui";
import { BudgetOverview, BudgetManager } from "../budget";
import { Category, Expense, CategorySpending, TimePeriod } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";

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
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total spent:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowBudgetManager(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Budgets
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={expenses.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Categories
            </button>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Expense
            </button>
          </div>
        </div>
      </div>

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
