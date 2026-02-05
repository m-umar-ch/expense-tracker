import { CategorySpending } from "../../types/expense";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CategorySummaryProps {
  categorySpending: CategorySpending[];
}

export function CategorySummary({ categorySpending }: CategorySummaryProps) {
  const totalSpent = categorySpending.reduce((sum, item) => sum + item.totalSpent, 0);

  if (categorySpending.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Total: {formatCurrencyCompact(totalSpent)}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorySpending
            .filter(item => item.totalSpent > 0)
            .map((item) => {
              const percentage = totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;
              
              return (
                <Card key={item.category._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <h4 className="font-semibold">{item.category.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-semibold">{formatCurrency(item.totalSpent)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expenses</span>
                        <Badge variant="secondary">{item.expenseCount}</Badge>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">% of Total</span>
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      
                      {/* Progress bar for percentage */}
                      <div className="space-y-1">
                        <Progress value={percentage} className="w-full h-2" />
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
