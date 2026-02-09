import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ExpenseForm, ExpenseList } from "./";
import { CategorySummary, CategoryManager } from "../category";
import { TimePeriodFilter, ExportModal, StatisticsOverview } from "../ui";
import { BudgetOverview, BudgetManager } from "../budget";
import { SignOutButton } from "../auth";
import {
  Category,
  Expense,
  CategorySpending,
  TimePeriod,
} from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsModal from "../ui/SettingsModal";
import {
  BarChart3,
  Download,
  FolderOpen,
  Plus,
  DollarSign,
  ArrowLeft,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export function BrutalistExpenseTracker() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "analytics">(
    "expenses",
  );
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined,
  );

  const categories = useQuery(api.functions.categories.listCategories) || [];

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
          endDate: Date.now() + 24 * 60 * 60 * 1000,
        };
      default:
        const dailyStart = new Date(today);
        dailyStart.setHours(0, 0, 0, 0);
        const dailyEnd = new Date(today);
        dailyEnd.setHours(23, 59, 59, 999);
        return {
          startDate: dailyStart.getTime(),
          endDate: dailyEnd.getTime(),
        };
    }
  };

  const { startDate, endDate } = getDateRange(selectedPeriod);
  const expenses = useQuery(api.functions.expenses.listExpenses, {
    startDate,
    endDate,
  });

  // Use the dedicated API endpoint for category spending
  const categorySpendingData = useQuery(
    api.functions.expenses.getCategorySpending,
    {
      startDate,
      endDate,
    },
  );

  const filteredExpenses = (expenses || []) as Expense[];

  // Process category spending data to include additional calculated fields
  const categorySpending: CategorySpending[] = (categorySpendingData || []).map(
    (item) => {
      const totalAllExpenses = filteredExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      return {
        ...item,
        percentageOfTotal:
          totalAllExpenses > 0 ? (item.totalSpent / totalAllExpenses) * 100 : 0,
        budgetUtilization: item.category.budgetLimit
          ? (item.totalSpent / item.category.budgetLimit) * 100
          : null,
      };
    },
  );

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Brutalist Header */}
      <header className="border-b-4 border-red-500 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 flex items-center justify-center transform rotate-12">
                <DollarSign className="w-8 h-8 text-black font-bold" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">
                  EXPENSE<span className="text-red-500">TRACK</span>
                </h1>
                <p className="text-xs font-bold uppercase text-gray-400">
                  DASHBOARD
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSignOut}
                className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-4 py-3 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                LOGOUT
              </Button>
              <Button
                onClick={() => setShowSettingsModal(true)}
                className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-4 py-3 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                SETTINGS
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-6 py-3 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                HOME
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              onClick={() => setShowExpenseForm(true)}
              className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-6 py-3 border-4 border-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD EXPENSE
            </Button>
            <Button
              onClick={() => setShowCategoryManager(true)}
              className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-6 py-3"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              CATEGORIES
            </Button>
            <Button
              onClick={() => setShowBudgetManager(true)}
              className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-6 py-3"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              BUDGETS
            </Button>
            <Button
              onClick={() => setShowExportModal(true)}
              disabled={!expenses || expenses.length === 0}
              className="bg-black border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-wide px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              EXPORT
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Time Period Filter */}
        <div className="bg-red-500 border-4 border-black p-6">
          <div className="bg-black p-4">
            <TimePeriodFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-black border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black uppercase mb-4 text-red-500 border-b-2 border-red-500 pb-2">
            SYSTEM OVERVIEW
          </h2>
          <StatisticsOverview
            expenses={filteredExpenses}
            categorySpending={categorySpending}
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-black border-4 border-red-500">
          <div className="flex border-b-4 border-red-500">
            <Button
              onClick={() => setActiveTab("expenses")}
              className={`flex-1 font-black uppercase py-4 ${
                activeTab === "expenses"
                  ? "bg-red-500 text-black"
                  : "bg-black text-red-500 border-r-2 border-red-500"
              }`}
              style={{ borderRadius: 0 }}
            >
              EXPENSE HISTORY
            </Button>
            <Button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 font-black uppercase py-4 ${
                activeTab === "analytics"
                  ? "bg-red-500 text-black"
                  : "bg-black text-red-500 border-l-2 border-red-500"
              }`}
              style={{ borderRadius: 0 }}
            >
              ANALYTICS
            </Button>
          </div>

          <div className="p-6">
            {activeTab === "expenses" && (
              <div>
                <h3 className="text-xl font-black uppercase mb-4 text-white">
                  TRANSACTION LOG
                </h3>
                <ExpenseList
                  expenses={filteredExpenses}
                  onEditExpense={handleEditExpense}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase mb-4 text-white">
                    BUDGET STATUS
                  </h3>
                  <BudgetOverview categorySpending={categorySpending} />
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase mb-4 text-white">
                    CATEGORY BREAKDOWN
                  </h3>
                  <CategorySummary categorySpending={categorySpending} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          onClose={handleCloseExpenseForm}
          categories={categories}
          editingExpense={editingExpense}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
          categories={categories}
        />
      )}

      {showBudgetManager && (
        <BudgetManager
          onClose={() => setShowBudgetManager(false)}
          categories={categories}
          categorySpending={categorySpending}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          expenses={filteredExpenses}
          selectedPeriod={selectedPeriod}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
