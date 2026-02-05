import { CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";

interface BudgetOverviewProps {
  categorySpending: CategorySpending[];
}

export function BudgetOverview({ categorySpending }: BudgetOverviewProps) {
  const categoriesWithBudgets = categorySpending.filter(item => item.budgetLimit > 0);

  if (categoriesWithBudgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Budget Goals</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add budget limits to your categories to track spending goals and stay on top of your finances.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        <p className="text-sm text-gray-600 mt-1">{categoriesWithBudgets.length} categories with budget limits</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoriesWithBudgets.map((item) => {
            const isOverBudget = item.totalSpent > item.budgetLimit;
            const isNearLimit = item.budgetUsed >= 80 && !isOverBudget;
            
            return (
              <div key={item.category._id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <h4 className="font-semibold text-gray-900">{item.category.name}</h4>
                  {isOverBudget && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      Over Budget
                    </span>
                  )}
                  {isNearLimit && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      Near Limit
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                     <span className="font-semibold">{formatCurrency(item.totalSpent)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                     <span>{formatCurrency(item.budgetLimit)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                       {formatCurrency(Math.abs(item.budgetLimit - item.totalSpent))}
                      {isOverBudget && " over"}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isOverBudget
                          ? "bg-red-500"
                          : isNearLimit
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(item.budgetUsed, 100)}%`,
                      }}
                    />
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    {item.budgetUsed.toFixed(1)}% used
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
