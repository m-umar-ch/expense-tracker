import { Expense, CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";

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
      icon: "📊",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: "💰",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Average per Expense",
      value: formatCurrency(averagePerExpense),
      icon: "📈",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      label: "Active Categories",
      value: categoriesWithSpending.toString(),
      icon: "📋",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Statistics</h3>
        <p className="text-sm text-gray-500 mt-1">Overview of your expenses</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`p-4 ${stat.bgColor} rounded-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center text-sm border ${stat.textColor} border-current`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {topCategory && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: topCategory.category.color }}
              />
              <div>
                <div className="font-medium text-gray-900">Top Spending Category</div>
                <div className="text-sm text-gray-600">
                  {topCategory.category.name} - {formatCurrency(topCategory.totalSpent)} 
                  ({topCategory.expenseCount} expenses)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}