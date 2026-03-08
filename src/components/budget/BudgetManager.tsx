import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Category, CategorySpending } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Target,
  TrendingUp,
  AlertTriangle,
  Save,
  Info,
  ChevronRight,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";

interface BudgetManagerProps {
  categories: Category[];
  categorySpending: CategorySpending[];
  onClose: () => void;
}

export function BudgetManager({
  categories: allCategories,
  categorySpending: allCategorySpending,
  onClose,
}: BudgetManagerProps) {
  const categories = allCategories.filter((c) => c.type === "expense");
  const categorySpending = allCategorySpending.filter(
    (s) => s.category.type === "expense",
  );
  const { formatCurrency, formatCurrencyCompact } = useSettings();
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

  const updateCategory = useMutation(api.functions.categories.updateCategory);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    let successCount = 0;

    try {
      for (const [categoryId, budgetValue] of Object.entries(budgets)) {
        const category = categories.find((c) => c._id === categoryId);
        if (!category) continue;

        const currentBudget = category.budgetLimit;
        const newBudget = budgetValue ? parseFloat(budgetValue) : undefined;

        if (currentBudget !== newBudget) {
          await updateCategory({
            id: category._id as Id<"categories">,
            budgetLimit: newBudget,
          });
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Configured ${successCount} budget limits`);
        onClose();
      } else {
        toast.success("No changes detected");
      }
    } catch (error) {
      toast.error("Error updating system budgets");
    } finally {
      setIsSaving(false);
    }
  };

  const totalBudgetSet = Object.values(budgets).reduce(
    (sum, budget) => sum + (parseFloat(budget) || 0),
    0,
  );

  const totalSpent = categorySpending.reduce(
    (sum, spending) => sum + spending.totalSpent,
    0,
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] shadow-none border-border">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Budget Settings
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2 pt-2">
            <Badge
              variant="outline"
              className="font-semibold text-[10px] uppercase tracking-tighter text-muted-foreground border-border bg-muted/30 h-6"
            >
              {categories.length} CATEGORIES
            </Badge>
            <Badge
              variant="outline"
              className="font-semibold text-[10px] uppercase tracking-tighter text-primary border-primary/20 bg-primary/5 h-6"
            >
              {formatCurrency(totalBudgetSet)} TOTAL BUDGET
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Summary Banner */}
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Target className="w-3 h-3" />
                Global Status
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-black">
                    {formatCurrency(totalSpent)}
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    Total current spending
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-lg font-bold",
                      totalSpent > totalBudgetSet
                        ? "text-destructive"
                        : "text-primary",
                    )}
                  >
                    {formatCurrency(Math.abs(totalBudgetSet - totalSpent))}
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    {totalSpent > totalBudgetSet
                      ? "EXCEEDED BY"
                      : "REMAINING FUNDS"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              Configure category limits
            </h3>
            <div className="grid grid-cols-1 gap-2 border rounded-xl overflow-hidden divide-y">
              {categories.map((category) => {
                const spending = categorySpending.find(
                  (s) => s.category._id === category._id,
                );
                const currentBudget = parseFloat(budgets[category._id]) || 0;
                const utilization =
                  currentBudget > 0
                    ? ((spending?.totalSpent || 0) / currentBudget) * 100
                    : 0;
                const isOver = utilization > 100;

                return (
                  <div
                    key={category._id}
                    className="p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full border border-background shadow-xs shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
                            Spent:{" "}
                            <span className="font-bold text-foreground">
                              {formatCurrency(spending?.totalSpent || 0)}
                            </span>
                            {currentBudget > 0 && (
                              <>
                                <ChevronRight className="w-3 h-3 opacity-30" />
                                <span
                                  className={cn(
                                    "font-black",
                                    isOver
                                      ? "text-destructive"
                                      : "text-primary",
                                  )}
                                >
                                  {utilization.toFixed(0)}% used
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative group/input">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={budgets[category._id]}
                            onChange={(e) =>
                              handleBudgetChange(category._id, e.target.value)
                            }
                            className="w-32 h-10 pl-7 text-sm font-bold shadow-none border-border group-hover/input:border-primary transition-colors"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Discard
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="font-bold px-8 shadow-md"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Budgets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
