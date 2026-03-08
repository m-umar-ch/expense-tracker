import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { CategorySummary, CategoryManager } from "../category";
import { ExportModal } from "../modals/ExportModal";
import { StatisticsOverview } from "./StatisticsOverview";
import FinancialCharts from "../analytics/FinancialCharts";
import { BudgetOverview, BudgetManager } from "../budget";
import { Transaction, CategorySpending, TimePeriod } from "../../types/expense";
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

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const categories =
    useQuery(api.functions.categories.listCategories, {}) || [];

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

  const transactions =
    useQuery(api.functions.transactions.listTransactions, {
      startDate,
      endDate,
    }) || [];

  const financialSummary = useQuery(
    api.functions.transactions.getFinancialSummary,
    {
      startDate,
      endDate,
    },
  );

  const evolution = useQuery(api.functions.transactions.getEvolution, {
    startDate,
    endDate,
  });

  const categorySpendingData = useQuery(
    api.functions.transactions.getCategorySpending,
    {
      startDate,
      endDate,
    },
  );

  const dateBoundaries = useQuery(api.functions.transactions.getDateBoundaries);

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  const categorySpending: CategorySpending[] = useMemo(() => {
    if (!categorySpendingData) return [];

    const totalAllExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    const mapping: CategorySpending[] = categorySpendingData.map((item) => ({
      ...item,
      percentageOfTotal:
        totalAllExpenses > 0 ? (item.totalSpent / totalAllExpenses) * 100 : 0,
      budgetUtilization: item.category.budgetLimit
        ? (item.totalSpent / item.category.budgetLimit) * 100
        : null,
      expenseCount: item.expenseCount || 0,
      budgetUsed: item.budgetUsed || 0,
      budgetLimit: item.budgetLimit || 0,
    }));

    return mapping;
  }, [categorySpendingData, expenses]);

  const effectiveDaysCount = useMemo(() => {
    const hasData = transactions.length > 0;
    const minDate =
      hasData && selectedPeriod === "all"
        ? Math.min(...transactions.map((t) => t.date))
        : undefined;

    return getEffectiveDaysCount(
      selectedPeriod,
      startDate,
      endDate,
      hasData,
      minDate,
    );
  }, [endDate, startDate, selectedPeriod, transactions]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleAddTransaction = (type: "expense" | "income") => {
    setTransactionType(type);
    setEditingTransaction(undefined);
    setShowTransactionForm(true);
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
        handleAddTransaction("expense");
      } else if (e.key === "i") {
        e.preventDefault();
        handleAddTransaction("income");
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
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader onShowSettings={() => setShowSettingsModal(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <DashboardActions
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          referenceDate={referenceDate}
          onDateShift={handleDateShift}
          onAddTransaction={handleAddTransaction}
          onShowCategories={() => setShowCategoryManager(true)}
          onShowBudgets={() => setShowBudgetManager(true)}
          onShowExport={() => setShowExportModal(true)}
          isExportDisabled={transactions.length === 0}
          dateBoundaries={dateBoundaries}
        />

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="flex w-full mb-8">
            <TabsTrigger value="transactions" className="flex-1">
              Transaction Log
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">
              Analytics & Budgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="gap-5 border-none shadow-none sm:border sm:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Transactions Table
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddTransaction("expense")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <TransactionList
                  transactions={transactions}
                  onEditTransaction={handleEditTransaction}
                  isLoading={transactions === undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <StatisticsOverview
              expenses={expenses}
              categorySpending={categorySpending}
              financialSummary={financialSummary}
              daysCount={effectiveDaysCount}
              evolution={evolution}
            />

            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetOverview categorySpending={categorySpending} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Spending Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySummary categorySpending={categorySpending} />
              </CardContent>
            </Card>

            <FinancialCharts
              expenses={expenses}
              incomes={incomes}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
        </Tabs>
      </main>

      {showTransactionForm && (
        <TransactionForm
          onClose={() => {
            setShowTransactionForm(false);
            setEditingTransaction(undefined);
          }}
          categories={categories}
          editingTransaction={editingTransaction}
          defaultType={transactionType}
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
          expenses={expenses}
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
