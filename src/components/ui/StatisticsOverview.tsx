import { Expense, CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, TrendingUp, FolderOpen } from "lucide-react";

interface StatisticsOverviewProps {
  expenses: Expense[];
  categorySpending: CategorySpending[];
}

export function StatisticsOverview({ expenses, categorySpending }: StatisticsOverviewProps) {
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averagePerExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  
  const topCategory = categorySpending.length > 0 ? categorySpending[0] : null;
  const categoriesWithSpending = categorySpending.filter(cat => cat.totalSpent > 0).length;

  const stats = [
    {
      label: "Total Expenses",
      value: totalExpenses.toString(),
      icon: BarChart3,
      className: "text-blue-600"
    },
    {
      label: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      className: "text-green-600"
    },
    {
      label: "Average per Expense",
      value: formatCurrency(averagePerExpense),
      icon: TrendingUp,
      className: "text-purple-600"
    },
    {
      label: "Active Categories",
      value: categoriesWithSpending.toString(),
      icon: FolderOpen,
      className: "text-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Statistics</CardTitle>
        <CardDescription>Overview of your expenses</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`h-5 w-5 ${stat.className}`} />
              </div>
              <div className={`text-xl font-bold ${stat.className}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {topCategory && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: topCategory.category.color }}
                />
                <div className="flex-1">
                  <div className="font-medium">Top Spending Category</div>
                  <div className="text-sm text-muted-foreground">
                    {topCategory.category.name} - {formatCurrency(topCategory.totalSpent)}
                    <Badge variant="secondary" className="ml-2">
                      {topCategory.expenseCount} expenses
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}