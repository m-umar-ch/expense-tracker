import { CategorySpending } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetOverviewProps {
  categorySpending: CategorySpending[];
}

export function BudgetOverview({ categorySpending }: BudgetOverviewProps) {
  const categoriesWithBudgets = categorySpending.filter(
    (item) => item.budgetLimit > 0,
  );

  if (categoriesWithBudgets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="mb-2">Set Budget Goals</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Add budget limits to your categories to track spending goals and
            stay on top of your finances.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>
          {categoriesWithBudgets.length} categories with budget limits
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoriesWithBudgets.map((item) => {
            const isOverBudget = item.totalSpent > item.budgetLimit;
            const isNearLimit = item.budgetUsed >= 80 && !isOverBudget;

            return (
              <Card
                key={item.category._id}
                className={cn(
                  "hover:shadow-md transition-shadow",
                  isOverBudget && "border-destructive bg-destructive/5",
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <h4 className="font-semibold">{item.category.name}</h4>
                    {isOverBudget && (
                      <Badge variant="destructive">Over Budget</Badge>
                    )}
                    {isNearLimit && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-700 bg-yellow-50"
                      >
                        Near Limit
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-semibold">
                        {formatCurrency(item.totalSpent)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span>{formatCurrency(item.budgetLimit)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span
                        className={
                          isOverBudget ? "text-destructive" : "text-green-600"
                        }
                      >
                        {formatCurrency(
                          Math.abs(item.budgetLimit - item.totalSpent),
                        )}
                        {isOverBudget && " over"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <Progress
                      value={Math.min(item.budgetUsed, 100)}
                      className={cn(
                        "w-full",
                        isOverBudget &&
                          "[&>[data-state=complete]]:bg-destructive [&]:bg-destructive/20",
                      )}
                    />

                    <div
                      className={cn(
                        "text-center text-sm",
                        isOverBudget
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.budgetUsed.toFixed(1)}% used
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
