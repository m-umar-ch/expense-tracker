import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Category, CategorySpending } from "../../types/expense";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetManagerProps {
  categories: Category[];
  categorySpending: CategorySpending[];
  onClose: () => void;
}

export function BudgetManager({
  categories,
  categorySpending,
  onClose,
}: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Record<string, string>>(
    categories.reduce(
      (acc, cat) => ({
        ...acc,
        [cat._id]: cat.budgetLimit?.toString() || "",
      }),
      {},
    ),
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateCategory = useMutation(api.categories.updateCategory);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(budgets).map(
        async ([categoryId, budget]) => {
          const budgetValue = budget ? parseFloat(budget) : undefined;
          await updateCategory({
            id: categoryId as any,
            budgetLimit: budgetValue,
          });
        },
      );

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
    const spending = categorySpending.find(
      (s) => s.category._id === category._id,
    );
    const budget = budgets[category._id]
      ? parseFloat(budgets[category._id])
      : 0;

    if (!budget || !spending)
      return { spent: 0, percentage: 0, status: "safe" as const };

    const percentage = (spending.totalSpent / budget) * 100;
    const status =
      percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "safe";

    return {
      spent: spending.totalSpent,
      percentage: Math.min(percentage, 100),
      status,
    };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Budget Manager</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set and manage monthly budget limits for your categories
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-primary">
                  Total Budget
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(getTotalBudget())}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-destructive">
                  Total Spent
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(getTotalSpent())}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Remaining
                </div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                  {formatCurrency(
                    Math.max(getTotalBudget() - getTotalSpent(), 0),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Budget List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Category Budgets</h3>

            <div className="grid gap-4">
              {categories.map((category) => {
                const progress = getBudgetProgress(category);

                return (
                  <Card key={category._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Spent: {formatCurrencyCompact(progress.spent)}{" "}
                              this month
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Label className="text-xs text-muted-foreground">
                              Monthly Limit
                            </Label>
                            <div className="flex mt-1">
                              <span className="flex items-center px-3 py-2 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm">
                                Rs.
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={budgets[category._id] || ""}
                                onChange={(e) =>
                                  handleBudgetChange(
                                    category._id,
                                    e.target.value,
                                  )
                                }
                                className="w-32 rounded-l-none border-l-0"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {budgets[category._id] &&
                        parseFloat(budgets[category._id]) > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <Badge
                                variant={
                                  progress.status === "over"
                                    ? "destructive"
                                    : progress.status === "warning"
                                      ? "outline"
                                      : "default"
                                }
                                className={
                                  progress.status === "warning"
                                    ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                    : ""
                                }
                              >
                                {progress.percentage.toFixed(1)}% used
                              </Badge>
                            </div>
                            <Progress
                              value={progress.percentage}
                              className={cn(
                                "w-full",
                                progress.status === "over" &&
                                  "[&>[data-state=complete]]:bg-destructive [&]:bg-destructive/20",
                              )}
                            />
                            {progress.status === "over" && (
                              <p className="text-sm text-destructive">
                                Over budget by{" "}
                                {formatCurrency(
                                  progress.spent -
                                    parseFloat(budgets[category._id]),
                                )}
                              </p>
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Budget Limits"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
