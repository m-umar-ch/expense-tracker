import { Expense, CategorySpending } from "../../types/expense";
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
  expenses: Expense[];
  categorySpending: CategorySpending[];
}

export function StatisticsOverview({
  expenses,
  categorySpending,
}: StatisticsOverviewProps) {
  const { formatCurrency } = useSettings();
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
      label: "Total Records",
      value: totalExpenses.toString(),
      icon: TrendingUp,
    },
    {
      label: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: DollarSign,
    },
    {
      label: "Avg. per Record",
      value: formatCurrency(averagePerExpense),
      icon: BarChart3,
    },
    {
      label: "Active Categories",
      value: categoriesWithSpending.toString(),
      icon: FolderOpen,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-none border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
                    <span className="text-xl font-bold text-primary">
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
                <div className="text-2xl font-black text-primary/20">
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
