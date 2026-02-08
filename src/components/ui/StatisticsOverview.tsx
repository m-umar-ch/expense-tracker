import { Expense, CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Database,
  Zap,
} from "lucide-react";

interface StatisticsOverviewProps {
  expenses: Expense[];
  categorySpending: CategorySpending[];
}

export function StatisticsOverview({
  expenses,
  categorySpending,
}: StatisticsOverviewProps) {
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
      label: "TOTAL RECORDS",
      value: totalExpenses.toString(),
      icon: Database,
    },
    {
      label: "TOTAL AMOUNT",
      value: formatCurrency(totalAmount),
      icon: DollarSign,
    },
    {
      label: "AVERAGE PER RECORD",
      value: formatCurrency(averagePerExpense),
      icon: TrendingUp,
    },
    {
      label: "ACTIVE CATEGORIES",
      value: categoriesWithSpending.toString(),
      icon: FolderOpen,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-black border-4 border-red-500 p-6 hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-8 w-8 text-red-500" />
              <Zap className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Top Category Highlight */}
      {topCategory ? (
        <div className="bg-red-500 border-4 border-black p-6">
          <h3 className="text-lg font-black uppercase text-black mb-4">
            TOP SPENDING CATEGORY
          </h3>
          <div className="bg-black border-4 border-red-500 p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 border-4 border-white flex-shrink-0"
                style={{ backgroundColor: topCategory.category.color }}
              />
              <div className="flex-1">
                <h4 className="text-xl font-black uppercase text-white">
                  {topCategory.category.name}
                </h4>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-black text-red-500">
                    {formatCurrency(topCategory.totalSpent)}
                  </span>
                  <Badge className="bg-white text-black font-black uppercase text-xs">
                    {topCategory.expenseCount} RECORDS
                  </Badge>
                  <span className="text-sm font-bold uppercase text-gray-400">
                    {topCategory.percentageOfTotal.toFixed(1)}% OF TOTAL
                  </span>
                </div>
              </div>
              <div className="text-right">
                <BarChart3 className="h-12 w-12 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-500 border-4 border-black p-6">
          <div className="bg-black border-4 border-red-500 p-8 text-center">
            <Database className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase text-red-500 mb-2">
              NO DATA AVAILABLE
            </h3>
            <p className="font-bold uppercase text-gray-400">
              ADD EXPENSES TO SEE STATISTICS
            </p>
          </div>
        </div>
      )}

      {/* System Status Indicators */}
      <div className="bg-white border-4 border-black p-6">
        <h3 className="text-lg font-black uppercase text-black mb-4">
          SYSTEM STATUS
        </h3>
        <div className="bg-black p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 ${totalExpenses > 0 ? "bg-green-400" : "bg-red-500"}`}
            />
            <span className="font-bold uppercase text-white text-sm">
              EXPENSE TRACKING: {totalExpenses > 0 ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 ${categoriesWithSpending > 0 ? "bg-green-400" : "bg-red-500"}`}
            />
            <span className="font-bold uppercase text-white text-sm">
              CATEGORIES: {categoriesWithSpending > 0 ? "CONFIGURED" : "EMPTY"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 ${totalAmount > 0 ? "bg-green-400" : "bg-red-500"}`}
            />
            <span className="font-bold uppercase text-white text-sm">
              FINANCIAL DATA: {totalAmount > 0 ? "RECORDED" : "NO DATA"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
