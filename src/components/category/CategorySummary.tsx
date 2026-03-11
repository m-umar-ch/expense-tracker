import { CategorySpending } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySummaryProps {
  categorySpending: CategorySpending[];
  isIncome?: boolean;
}

export function CategorySummary({
  categorySpending,
  isIncome = false,
}: CategorySummaryProps) {
  const { formatCurrency, formatCurrencyCompact } = useSettings();
  const totalAmount = categorySpending.reduce(
    (sum, item) => sum + item.totalSpent,
    0,
  );

  if (categorySpending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-xl">
        <TrendingUp className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm">No data available for this period</p>
      </div>
    );
  }

  const activeCategories = categorySpending.filter(
    (item) => item.totalSpent > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isIncome ? "bg-green-500/10" : "bg-primary/10"
          )}>
            {isIncome ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 rotate-90" />
            ) : (
              <PieChart className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isIncome ? "Income Distribution" : "Spending Analysis"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
              {isIncome ? "Total Income Recorded" : "Total Relative Spending"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-bold border-muted transition-colors",
              isIncome ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
            )}
          >
            ~{formatCurrencyCompact(totalAmount)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeCategories.map((item) => {
          const percentage =
            totalAmount > 0 ? (item.totalSpent / totalAmount) * 100 : 0;

          return (
            <Card
              key={item.category._id}
              className="group shadow-none border-primary/20 overflow-hidden hover:border-primary/50 transition-all duration-300 py-0"
            >
              <div
                className="h-2 w-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: item.category.color }}
              />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold truncate">
                    {item.category.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5 font-black">
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">
                      {isIncome ? "Revenue" : "Spent"}
                    </div>
                    <div className="text-lg font-black leading-none">
                      {formatCurrency(item.totalSpent)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">
                      Ops.
                    </div>
                    <div className="text-sm font-bold flex items-center justify-end gap-1">
                      <TrendingUp
                        className={cn(
                          "w-3 h-3",
                          isIncome ? "text-green-500 rotate-90" : "text-primary",
                        )}
                      />
                      {item.expenseCount}
                    </div>
                  </div>
                </div>

                {!isIncome && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-0.5">
                      <span>Impact</span>
                      <span className={cn(
                        percentage >= 30 ? "text-destructive" : percentage >= 15 ? "text-amber-500" : "text-primary"
                      )}>
                        {percentage >= 30
                          ? "Critical"
                          : percentage >= 15
                            ? "Significant"
                            : "Low"}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/30 border border-dashed rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <BarChart3 className="w-4 h-4 opacity-50" />
          <span>
            Aggregated from {activeCategories.length} active categories
          </span>
        </div>
        <div className="font-bold border-l sm:pl-4 border-border/50 uppercase tracking-tighter">
          {isIncome ? "Combined Income: " : "Combined Spending: "}
          <span className={cn(
            "text-sm font-black transition-colors",
            isIncome ? "text-green-600 dark:text-green-400" : "text-destructive"
          )}>
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
