import { CategorySpending } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import { AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BudgetOverviewProps {
  categorySpending: CategorySpending[];
}

export function BudgetOverview({ categorySpending }: BudgetOverviewProps) {
  const { formatCurrency } = useSettings();
  const categoriesWithBudgets = categorySpending.filter(
    (item) => item.category.budgetLimit && item.category.budgetLimit > 0,
  );

  if (categoriesWithBudgets.length === 0) {
    return (
      <Alert className="bg-muted/30 border-dashed">
        <Info className="h-4 w-4" />
        <AlertTitle>No Budget Limits</AlertTitle>
        <AlertDescription>
          You haven't set any budget limits for your categories yet. Configure
          them in the Budgets manager to start tracking.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {categoriesWithBudgets.map((item) => {
          const budgetLimit = item.category.budgetLimit || 0;
          const isOverBudget = item.totalSpent > budgetLimit;
          const utilization = item.budgetUtilization || 0;
          const isNearLimit = utilization >= 80 && !isOverBudget;

          return (
            <Card
              key={item.category._id}
              className="shadow-none border-border/50"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <CardTitle className="text-sm font-bold truncate">
                      {item.category.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {isOverBudget ? (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-tighter"
                      >
                        Limit Exceeded
                      </Badge>
                    ) : isNearLimit ? (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-tighter bg-amber-500 text-white hover:bg-amber-600 border-none transition-none"
                      >
                        Near Limit
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-tighter border-primary/30 text-primary"
                      >
                        On Track
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Spending Status
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">
                        {formatCurrency(item.totalSpent)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of {formatCurrency(budgetLimit)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {isOverBudget ? "Overspent" : "Remaining"}
                    </div>
                    <div
                      className={cn(
                        "text-sm font-black",
                        isOverBudget ? "text-destructive" : "text-primary",
                      )}
                    >
                      {formatCurrency(Math.abs(budgetLimit - item.totalSpent))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground px-0.5">
                    <span>{utilization.toFixed(0)}% Utilized</span>
                    <div className="flex items-center gap-1">
                      {isOverBudget ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{isOverBudget ? "Critical" : "Safe"}</span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(utilization, 100)}
                    className={cn(
                      "h-1.5",
                      isOverBudget && "[&>div]:bg-destructive",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
