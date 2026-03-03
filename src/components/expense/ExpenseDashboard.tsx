import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ExpenseForm, ExpenseList } from "./";
import { CategorySummary, CategoryManager } from "../category";
import { TimePeriodFilter, ExportModal, StatisticsOverview } from "../ui";
import { BudgetOverview, BudgetManager } from "../budget";
import {
  Category,
  Expense,
  CategorySpending,
  TimePeriod,
} from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

export function ExpenseDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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

  const categorySpendingData = useQuery(
    api.functions.expenses.getCategorySpending,
    {
      startDate,
      endDate,
    },
  );

  const filteredExpenses = (expenses || []) as Expense[];

  // BUG FIX: Calculate total once outside the map to avoid O(N*E)
  const categorySpending: CategorySpending[] = useMemo(() => {
    if (!categorySpendingData) return [];

    const totalAllExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return categorySpendingData.map((item) => ({
      ...item,
      percentageOfTotal:
        totalAllExpenses > 0 ? (item.totalSpent / totalAllExpenses) * 100 : 0,
      budgetUtilization: item.category.budgetLimit
        ? (item.totalSpent / item.category.budgetLimit) * 100
        : null,
    }));
  }, [categorySpendingData, filteredExpenses]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  const { signOut } = useAuthActions();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Shadcn Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Financial Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Period selection and primary actions */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex-1 w-full md:w-auto">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Time Period Select
            </h2>
            <TimePeriodFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-4 md:pt-0">
            <Button onClick={() => setShowExpenseForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
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
              disabled={!expenses || expenses.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatisticsOverview
          expenses={filteredExpenses}
          categorySpending={categorySpending}
        />

        {/* Tab Navigation */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="expenses" className="text-base">
              Transaction Log
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-base">
              Analytics & Budgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList
                  expenses={filteredExpenses}
                  onEditExpense={handleEditExpense}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetOverview categorySpending={categorySpending} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategorySummary categorySpending={categorySpending} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
