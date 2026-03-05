import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { IncomeForm } from "./IncomeForm";
import { CategorySummary, CategoryManager } from "../category";
import { ExportModal } from "../modals/ExportModal";
import { StatisticsOverview } from "./StatisticsOverview";
import FinancialCharts from "../analytics/FinancialCharts";
import { BudgetOverview, BudgetManager } from "../budget";
import {
  Expense,
  CategorySpending,
  TimePeriod,
  Income,
} from "../../types/expense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsModal from "../modals/SettingsModal";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardActions } from "./DashboardActions";
import { getDateRange, getEffectiveDaysCount } from "../../utils/date";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ExpenseDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPeriod =
    (searchParams.get("period") as TimePeriod) || "monthly";
  const referenceDateString = searchParams.get("date");
  const referenceDate = referenceDateString
    ? parseInt(referenceDateString)
    : Date.now();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined,
  );
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(
    undefined,
  );

  const categories = useQuery(api.functions.categories.listCategories) || [];

  const { startDate, endDate } = useMemo(
    () => getDateRange(selectedPeriod, referenceDate),
    [selectedPeriod, referenceDate],
  );

  const handlePeriodChange = (period: TimePeriod) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("period", period);
    // Reset date when period changes to avoid confusion
    newParams.delete("date");
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
  };

  const handleDateShift = (newDate: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("date", newDate.toString());
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
  };

  const expenses = useQuery(api.functions.expenses.listExpenses, {
    startDate,
    endDate,
  });

  const financialSummary = useQuery(api.functions.incomes.getFinancialSummary, {
    startDate,
    endDate,
  });

  const evolution = useQuery(api.functions.incomes.getEvolution, {
    startDate,
    endDate,
  });

  const incomesData =
    useQuery(api.functions.incomes.listIncomes, {
      startDate,
      endDate,
    }) || [];

  const incomes = incomesData as Income[];

  const categorySpendingData = useQuery(
    api.functions.expenses.getCategorySpending,
    {
      startDate,
      endDate,
    },
  );

  const dateBoundaries = useQuery(api.functions.expenses.getDateBoundaries);

  const filteredExpenses = (expenses || []) as Expense[];

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

  const effectiveDaysCount = useMemo(() => {
    const hasData = filteredExpenses.length > 0 || incomes.length > 0;
    const minDate =
      hasData && selectedPeriod === "all"
        ? Math.min(
            ...filteredExpenses.map((e) => e.date),
            ...incomes.map((i) => i.date),
          )
        : undefined;

    return getEffectiveDaysCount(
      selectedPeriod,
      startDate,
      endDate,
      hasData,
      minDate,
    );
  }, [endDate, startDate, selectedPeriod, filteredExpenses, incomes]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "n" || e.key === "e") {
        e.preventDefault();
        setShowExpenseForm(true);
      } else if (e.key === "i") {
        e.preventDefault();
        setShowIncomeForm(true);
      } else if (e.key === "s") {
        e.preventDefault();
        setShowSettingsModal(true);
      } else if (e.key === "k") {
        e.preventDefault();
        setShowCategoryManager(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onShowSettings={() => setShowSettingsModal(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <DashboardActions
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          referenceDate={referenceDate}
          onDateShift={handleDateShift}
          onAddExpense={() => setShowExpenseForm(true)}
          onAddIncome={() => setShowIncomeForm(true)}
          onShowCategories={() => setShowCategoryManager(true)}
          onShowBudgets={() => setShowBudgetManager(true)}
          onShowExport={() => setShowExportModal(true)}
          isExportDisabled={!expenses || expenses.length === 0}
        />

        <StatisticsOverview
          expenses={filteredExpenses}
          categorySpending={categorySpending}
          financialSummary={financialSummary}
          daysCount={effectiveDaysCount}
        />

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
            <Card className="gap-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Transactions Table
                </CardTitle>
                <Button size="sm" onClick={() => setShowExpenseForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <ExpenseList
                  expenses={filteredExpenses}
                  onEditExpense={handleEditExpense}
                  selectedPeriod={selectedPeriod}
                  referenceDate={referenceDate}
                  onDateShift={handleDateShift}
                  dateBoundaries={dateBoundaries}
                  isLoading={expenses === undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BudgetOverview categorySpending={categorySpending} />
                  </CardContent>
                </Card>

                {evolution && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Period Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span
                          className={`text-2xl font-bold ${evolution.percentageChange > 0 ? "text-destructive" : "text-green-600"}`}
                        >
                          {evolution.percentageChange > 0 ? "+" : ""}
                          {evolution.percentageChange.toFixed(1)}%
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">
                          spending compared to previous period
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Spending Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategorySummary categorySpending={categorySpending} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <FinancialCharts
                  expenses={filteredExpenses}
                  incomes={incomes as Income[]}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {showExpenseForm && (
        <ExpenseForm
          onClose={handleCloseExpenseForm}
          categories={categories}
          editingExpense={editingExpense}
        />
      )}

      {showIncomeForm && (
        <IncomeForm
          onClose={() => {
            setShowIncomeForm(false);
            setEditingIncome(undefined);
          }}
          editingIncome={editingIncome}
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
          incomes={incomes}
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
