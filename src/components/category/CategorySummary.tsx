import { CategorySpending } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface CategorySummaryProps {
  categorySpending: CategorySpending[];
}

export function CategorySummary({ categorySpending }: CategorySummaryProps) {
  const { formatCurrency, formatCurrencyCompact } = useSettings();
  const totalSpent = categorySpending.reduce(
    (sum, item) => sum + item.totalSpent,
    0,
  );

  if (categorySpending.length === 0) {
    return null;
  }

  const activeCategories = categorySpending.filter(
    (item) => item.totalSpent > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Spending Analysis</h3>
        </div>
        <Badge variant="outline" className="text-xs font-medium">
          Total: {formatCurrencyCompact(totalSpent)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeCategories.map((item) => {
          const percentage =
            totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;

          return (
            <Card
              key={item.category._id}
              className="shadow-none border-border/50 overflow-hidden py-0"
            >
              <div
                className="h-1 w-full"
                style={{ backgroundColor: item.category.color }}
              />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold truncate">
                    {item.category.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                      Amount Spent
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(item.totalSpent)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                      Records
                    </div>
                    <div className="text-sm font-semibold flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {item.expenseCount}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                    <span>Spending impact</span>
                    <span>
                      {percentage >= 30
                        ? "High"
                        : percentage >= 15
                          ? "Medium"
                          : "Low"}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/30 border-dashed shadow-none">
        <CardContent className="p-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>
              Analysis includes {activeCategories.length} active categories
            </span>
          </div>
          <div className="font-bold">
            System Total:{" "}
            <span className="text-primary">{formatCurrency(totalSpent)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
