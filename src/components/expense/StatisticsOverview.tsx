import { Transaction, CategorySpending } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FolderOpen,
  PieChart,
} from "lucide-react";

interface StatisticsOverviewProps {
  expenses: Transaction[];
  categorySpending: CategorySpending[];
  financialSummary?: {
    totalExpenses: number;
    totalIncome: number;
    netBalance: number;
    savingsRate: number;
  };
  daysCount?: number;
  evolution?: {
    percentageChange: number;
    currentTotal: number;
    prevTotal: number;
  } | null;
}

export function StatisticsOverview({
  expenses,
  categorySpending,
  financialSummary,
  daysCount = 1,
  evolution,
}: StatisticsOverviewProps) {
  const { settings, formatCurrency } = useSettings();
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const averagePerExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  const topCategory = categorySpending
    .filter((cat) => cat.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)[0];
  const categoriesWithSpending = categorySpending.filter(
    (cat) => cat.totalSpent > 0,
  ).length;

  const stats = [
    {
      label: "Net Balance",
      value: financialSummary
        ? formatCurrency(financialSummary.netBalance)
        : formatCurrency(totalAmount * -1),
      icon: DollarSign,
      color:
        financialSummary && financialSummary.netBalance >= 0
          ? "text-green-600"
          : "text-destructive",
    },
    {
      label: "Total Income",
      value: financialSummary
        ? formatCurrency(financialSummary.totalIncome)
        : "--",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalAmount),
      icon: BarChart3,
      color: "text-destructive",
    },
    {
      label: "Savings Rate",
      value: financialSummary
        ? `${financialSummary.savingsRate.toFixed(1)}%`
        : "--",
      icon: PieChart,
      color: "text-primary",
    },
    ...(evolution
      ? [
          {
            label: "Period Comparison",
            value: `${evolution.percentageChange > 0 ? "+" : ""}${evolution.percentageChange.toFixed(1)}%`,
            icon: TrendingUp,
            color:
              evolution.percentageChange > 0
                ? "text-destructive"
                : "text-green-600",
            subtitle: "vs last period",
          },
        ]
      : []),
    {
      label: "Avg. Daily Spend",
      value: formatCurrency(totalAmount / (daysCount || 1)),
      icon: BarChart3,
      color: "text-muted-foreground",
    },
  ];

  const blurClass = settings.privacyMode
    ? "blur-[8px] select-none pointer-events-none"
    : "";

  return (
    <div className="w-full space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-none border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 text-muted-foreground ${blurClass}`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} ${blurClass}`}>
                {stat.value}
              </div>
              {stat.subtitle && (
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Highlights */}
      {topCategory && (
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Highest Spending Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full border border-background shadow-sm"
                  style={{ backgroundColor: topCategory.category.color }}
                />
                <div>
                  <h4 className="text-lg font-semibold">
                    {topCategory.category.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xl font-bold text-primary ${blurClass}`}
                    >
                      {formatCurrency(topCategory.totalSpent)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold"
                    >
                      {topCategory.expenseCount} Transactions
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div
                  className={`text-2xl font-black text-primary/80 ${blurClass}`}
                >
                  {topCategory.percentageOfTotal.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Of Total Spending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
