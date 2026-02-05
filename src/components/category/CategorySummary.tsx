import { CategorySpending } from "../../types/expense";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";

interface CategorySummaryProps {
  categorySpending: CategorySpending[];
}

export function CategorySummary({ categorySpending }: CategorySummaryProps) {
  const totalSpent = categorySpending.reduce((sum, item) => sum + item.totalSpent, 0);

  if (categorySpending.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
        <p className="text-sm text-gray-600 mt-1">Total: {formatCurrencyCompact(totalSpent)}</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorySpending
            .filter(item => item.totalSpent > 0)
            .map((item) => {
              const percentage = totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;
              
              return (
                <div key={item.category._id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <h4 className="font-semibold text-gray-900">{item.category.name}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-semibold">{formatCurrency(item.totalSpent)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expenses</span>
                      <span>{item.expenseCount}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">% of Total</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    
                    {/* Progress bar for percentage */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: item.category.color,
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
