import { CategorySpending } from "../../types/expense";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";
import { BarChart3, Database, TrendingUp } from "lucide-react";

interface CategorySummaryProps {
  categorySpending: CategorySpending[];
}

export function CategorySummary({ categorySpending }: CategorySummaryProps) {
  const totalSpent = categorySpending.reduce(
    (sum, item) => sum + item.totalSpent,
    0,
  );

  if (categorySpending.length === 0) {
    return null;
  }

  return (
    <div className="bg-black border-4 border-red-500 text-white font-mono">
      <div className="border-b-4 border-red-500 p-6">
        <div className="flex items-center gap-4 mb-2">
          <Database className="w-8 h-8 text-red-500" />
          <div className="text-3xl font-black uppercase tracking-wider text-red-500">
            SPENDING ANALYSIS
          </div>
        </div>
        <div className="text-white uppercase tracking-wide">
          TOTAL FINANCIAL OUTFLOW: {formatCurrencyCompact(totalSpent)}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorySpending
            .filter((item) => item.totalSpent > 0)
            .map((item) => {
              const percentage =
                totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;

              return (
                <div
                  key={item.category._id}
                  className="border-4 border-white bg-black hover:border-red-500 transition-colors duration-200"
                >
                  <div className="p-6">
                    {/* Header with Category */}
                    <div className="border-b-4 border-white pb-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-6 border-2 border-white"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <div className="text-lg font-black uppercase tracking-wider text-white">
                          {item.category.name}
                        </div>
                      </div>
                    </div>

                    {/* Financial Data Grid */}
                    <div className="space-y-4">
                      <div className="bg-white text-black p-3 border-2 border-white">
                        <div className="flex justify-between">
                          <span className="font-black uppercase tracking-wide text-xs">
                            AMOUNT SPENT
                          </span>
                          <span className="font-black tracking-wider">
                            {formatCurrency(item.totalSpent)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-red-500 text-black p-3 border-2 border-red-500">
                        <div className="flex justify-between items-center">
                          <span className="font-black uppercase tracking-wide text-xs">
                            TRANSACTIONS
                          </span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-black tracking-wider">
                              {item.expenseCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black border-2 border-white p-3">
                        <div className="flex justify-between">
                          <span className="font-black uppercase tracking-wide text-xs text-white">
                            % OF TOTAL
                          </span>
                          <span className="font-black tracking-wider text-red-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar - Brutal Style */}
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase tracking-wider text-white mb-1">
                          SPENDING RATIO
                        </div>
                        <div className="h-6 border-2 border-white relative overflow-hidden bg-black">
                          <div
                            className="h-full bg-red-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          {/* Progress indicator markers */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-white mix-blend-difference">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Status */}
                      <div className="bg-red-500 text-black p-2 border-2 border-red-500">
                        <div className="flex items-center gap-2 justify-center">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">
                            {percentage >= 30
                              ? "HIGH IMPACT"
                              : percentage >= 15
                                ? "MODERATE IMPACT"
                                : "LOW IMPACT"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 border-t-4 border-red-500 pt-6">
          <div className="bg-red-500 text-black p-4 border-4 border-red-500">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6" />
                <span className="text-lg font-black uppercase tracking-wider">
                  SYSTEM TOTALS
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-wider">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-xs font-black uppercase tracking-wider">
                  {
                    categorySpending.filter((item) => item.totalSpent > 0)
                      .length
                  }{" "}
                  ACTIVE CATEGORIES
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
