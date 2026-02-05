import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Category, CategorySpending } from "../../types/expense";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";

interface BudgetManagerProps {
  categories: Category[];
  categorySpending: CategorySpending[];
  onClose: () => void;
}

export function BudgetManager({ categories, categorySpending, onClose }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Record<string, string>>(
    categories.reduce((acc, cat) => ({
      ...acc,
      [cat._id]: cat.budgetLimit?.toString() || ""
    }), {})
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const updateCategory = useMutation(api.categories.updateCategory);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(budgets).map(async ([categoryId, budget]) => {
        const budgetValue = budget ? parseFloat(budget) : undefined;
        await updateCategory({
          id: categoryId as any,
          budgetLimit: budgetValue
        });
      });

      await Promise.all(updates);
      toast.success("Budget limits updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update budget limits");
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalBudget = () => {
    return Object.values(budgets)
      .filter(Boolean)
      .reduce((sum, budget) => sum + parseFloat(budget), 0);
  };

  const getTotalSpent = () => {
    return categorySpending.reduce((sum, item) => sum + item.totalSpent, 0);
  };

  const getBudgetProgress = (category: Category) => {
    const spending = categorySpending.find(s => s.category._id === category._id);
    const budget = budgets[category._id] ? parseFloat(budgets[category._id]) : 0;
    
    if (!budget || !spending) return { spent: 0, percentage: 0, status: 'safe' as const };
    
    const percentage = (spending.totalSpent / budget) * 100;
    const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'safe';
    
    return {
      spent: spending.totalSpent,
      percentage: Math.min(percentage, 100),
      status
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Budget Manager</h2>
              <p className="text-sm text-gray-600 mt-1">Set and manage monthly budget limits for your categories</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-700">Total Budget</div>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(getTotalBudget())}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-red-700">Total Spent</div>
              <div className="text-2xl font-bold text-red-900">{formatCurrency(getTotalSpent())}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-700">Remaining</div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(Math.max(getTotalBudget() - getTotalSpent(), 0))}
              </div>
            </div>
          </div>

          {/* Categories Budget List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Category Budgets</h3>
            
            <div className="grid gap-4">
              {categories.map((category) => {
                const progress = getBudgetProgress(category);
                
                return (
                  <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">
                            Spent: {formatCurrencyCompact(progress.spent)} this month
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <label className="block text-xs text-gray-500 mb-1">Monthly Limit</label>
                          <div className="flex">
                            <span className="flex items-center px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                              ₨
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={budgets[category._id] || ""}
                              onChange={(e) => handleBudgetChange(category._id, e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {budgets[category._id] && parseFloat(budgets[category._id]) > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className={`font-medium ${
                            progress.status === 'over' ? 'text-red-600' :
                            progress.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {progress.percentage.toFixed(1)}% used
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress.status === 'over' ? 'bg-red-500' :
                              progress.status === 'warning' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        {progress.status === 'over' && (
                          <p className="text-sm text-red-600 mt-1">
                            Over budget by {formatCurrency((progress.spent - parseFloat(budgets[category._id])))}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? "Saving..." : "Save Budget Limits"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}