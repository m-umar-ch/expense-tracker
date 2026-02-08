import { CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import {
  AlertTriangle,
  Database,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetOverviewProps {
  categorySpending: CategorySpending[];
}

export function BudgetOverview({ categorySpending }: BudgetOverviewProps) {
  const categoriesWithBudgets = categorySpending.filter(
    (item) => item.category.budgetLimit && item.category.budgetLimit > 0,
  );

  if (categoriesWithBudgets.length === 0) {
    return (
      <div className="bg-black border-4 border-red-500 text-white font-mono p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 flex items-center justify-center mx-auto mb-6">
            <Database className="h-10 w-10 text-black" />
          </div>
          <div className="text-2xl font-black uppercase tracking-wider text-red-500 mb-4">
            NO BUDGET LIMITS CONFIGURED
          </div>
          <div className="text-white max-w-md mx-auto uppercase text-sm tracking-wide">
            SYSTEM ERROR: NO BUDGET CONSTRAINTS DETECTED. CONFIGURE SPENDING
            LIMITS TO ENABLE FINANCIAL MONITORING.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-4 border-red-500 text-white font-mono">
      <div className="border-b-4 border-red-500 p-6">
        <div className="text-3xl font-black uppercase tracking-wider text-red-500 mb-2">
          BUDGET CONTROL SYSTEM
        </div>
        <div className="text-white uppercase tracking-wide">
          {categoriesWithBudgets.length} CATEGORIES UNDER FINANCIAL SURVEILLANCE
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoriesWithBudgets.map((item) => {
            const budgetLimit = item.category.budgetLimit || 0;
            const isOverBudget = item.totalSpent > budgetLimit;
            const isNearLimit =
              (item.budgetUtilization || 0) >= 80 && !isOverBudget;

            return (
              <div
                key={item.category._id}
                className={cn(
                  "border-4 p-6 font-mono",
                  isOverBudget
                    ? "border-red-500 bg-red-500"
                    : isNearLimit
                      ? "border-red-300 bg-black"
                      : "border-white bg-black",
                )}
              >
                {/* Header Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="w-6 h-6 border-2 border-white"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <div
                      className={cn(
                        "text-xl font-black uppercase tracking-wider",
                        isOverBudget ? "text-black" : "text-white",
                      )}
                    >
                      {item.category.name}
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex gap-3">
                    {isOverBudget && (
                      <div className="flex items-center gap-2 bg-black text-red-500 px-3 py-1 border-2 border-black">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          BUDGET EXCEEDED
                        </span>
                      </div>
                    )}
                    {isNearLimit && (
                      <div className="flex items-center gap-2 bg-red-500 text-black px-3 py-1 border-2 border-red-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          APPROACHING LIMIT
                        </span>
                      </div>
                    )}
                    {!isOverBudget && !isNearLimit && (
                      <div className="flex items-center gap-2 bg-white text-black px-3 py-1 border-2 border-white">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          WITHIN BUDGET
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Data Grid */}
                <div className="space-y-4">
                  <div
                    className={cn(
                      "flex justify-between p-3 border-2",
                      isOverBudget
                        ? "border-black bg-black text-white"
                        : "border-white bg-white text-black",
                    )}
                  >
                    <span className="font-black uppercase tracking-wide text-xs">
                      SPENT
                    </span>
                    <span className="font-black tracking-wider">
                      {formatCurrency(item.totalSpent)}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex justify-between p-3 border-2",
                      isOverBudget
                        ? "border-black bg-black text-white"
                        : "border-white bg-white text-black",
                    )}
                  >
                    <span className="font-black uppercase tracking-wide text-xs">
                      BUDGET LIMIT
                    </span>
                    <span className="font-black tracking-wider">
                      {formatCurrency(budgetLimit)}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex justify-between p-3 border-2",
                      isOverBudget
                        ? "border-black bg-black text-red-500"
                        : "border-white bg-white text-black",
                    )}
                  >
                    <span className="font-black uppercase tracking-wide text-xs">
                      {isOverBudget ? "OVERSPENT" : "REMAINING"}
                    </span>
                    <span className="font-black tracking-wider">
                      {formatCurrency(Math.abs(budgetLimit - item.totalSpent))}
                      {isOverBudget && " OVER"}
                    </span>
                  </div>

                  {/* Progress Bar - Brutal Style */}
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "h-6 border-2 relative overflow-hidden",
                        isOverBudget ? "border-black" : "border-white",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          isOverBudget ? "bg-red-500" : "bg-red-500",
                        )}
                        style={{
                          width: `${Math.min(item.budgetUtilization || 0, 100)}%`,
                        }}
                      />
                      {item.budgetUtilization &&
                        item.budgetUtilization > 100 && (
                          <div className="absolute top-0 right-0 h-full w-1 bg-black" />
                        )}
                    </div>

                    <div
                      className={cn(
                        "text-center text-sm font-black uppercase tracking-wider",
                        isOverBudget ? "text-black" : "text-white",
                      )}
                    >
                      {(item.budgetUtilization || 0).toFixed(1)}% UTILIZED
                    </div>
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
