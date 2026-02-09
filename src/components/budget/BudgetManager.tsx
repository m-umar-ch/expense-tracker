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
import {
  Loader2,
  Target,
  TrendingUp,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";
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
            id: category._id,
            budgetLimit: newBudget,
          });
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `BUDGET SYSTEM UPDATED - ${successCount} CATEGORIES MODIFIED!`,
        );
        onClose();
      } else {
        toast.success("NO CHANGES TO SAVE");
      }
    } catch (error) {
      toast.error("SYSTEM ERROR - BUDGET UPDATE FAILED");
    } finally {
      setIsSaving(false);
    }
  };

  const getBudgetStatus = (categoryId: string) => {
    const spending = categorySpending.find(
      (s) => s.category._id === categoryId,
    );
    const budgetLimit = parseFloat(budgets[categoryId]) || 0;

    if (!spending || !budgetLimit) return null;

    const utilization = (spending.totalSpent / budgetLimit) * 100;
    const isOverBudget = utilization > 100;
    const isNearLimit = utilization >= 80 && !isOverBudget;

    return {
      utilization,
      isOverBudget,
      isNearLimit,
      totalSpent: spending.totalSpent,
      remaining: budgetLimit - spending.totalSpent,
    };
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
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-black border-4 border-red-500 text-white font-mono">
        <DialogHeader className="border-b-4 border-red-500 pb-4 mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-wider text-red-500">
            BUDGET CONTROL SYSTEM
          </DialogTitle>
          <div className="flex items-center gap-4 mt-3">
            <Badge className="bg-white text-black font-black uppercase px-3 py-1">
              {categories.length} CATEGORIES
            </Badge>
            <Badge className="bg-red-500 text-black font-black uppercase px-3 py-1">
              {formatCurrency(totalBudgetSet)} BUDGETED
            </Badge>
            <Badge className="bg-red-500 text-black font-black uppercase px-3 py-1">
              {formatCurrency(totalSpent)} SPENT
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* System Overview */}
          <div className="bg-red-500 border-4 border-black p-6">
            <h3 className="text-xl font-black uppercase text-black mb-4">
              SYSTEM OVERVIEW
            </h3>
            <div className="bg-black p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-4 border-red-500 p-4 text-center">
                  <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(totalBudgetSet)}
                  </div>
                  <div className="font-bold uppercase text-gray-400 text-sm">
                    TOTAL BUDGET SET
                  </div>
                </div>
                <div className="border-4 border-red-500 p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(totalSpent)}
                  </div>
                  <div className="font-bold uppercase text-gray-400 text-sm">
                    TOTAL SPENT
                  </div>
                </div>
                <div className="border-4 border-red-500 p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div
                    className={`text-2xl font-black ${
                      totalBudgetSet - totalSpent >= 0
                        ? "text-green-400"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(Math.abs(totalBudgetSet - totalSpent))}
                  </div>
                  <div className="font-bold uppercase text-gray-400 text-sm">
                    {totalBudgetSet - totalSpent >= 0
                      ? "REMAINING"
                      : "OVER BUDGET"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Settings */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-xl font-black uppercase text-black mb-4">
              BUDGET CONFIGURATION
            </h3>

            <div className="bg-black p-4 space-y-6">
              {categories.map((category) => {
                const status = getBudgetStatus(category._id);
                const spending = categorySpending.find(
                  (s) => s.category._id === category._id,
                );

                return (
                  <div
                    key={category._id}
                    className="border-4 border-red-500 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-6 h-6 border-4 border-white"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="font-black uppercase text-white text-lg">
                            {category.name}
                          </h4>
                          {spending && (
                            <p className="font-bold uppercase text-gray-400 text-sm">
                              SPENT: {formatCurrency(spending.totalSpent)}
                            </p>
                          )}
                        </div>
                      </div>

                      {status && (
                        <div className="flex items-center gap-2">
                          {status.isOverBudget && (
                            <Badge className="bg-red-500 text-black font-black uppercase">
                              OVER BUDGET
                            </Badge>
                          )}
                          {status.isNearLimit && (
                            <Badge className="bg-yellow-500 text-black font-black uppercase">
                              NEAR LIMIT
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block font-black uppercase text-red-500 mb-2">
                          BUDGET LIMIT ($)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={budgets[category._id]}
                          onChange={(e) =>
                            handleBudgetChange(category._id, e.target.value)
                          }
                          placeholder="0.00"
                          className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4"
                        />
                      </div>

                      {status && (
                        <div className="space-y-2">
                          <Label className="block font-black uppercase text-red-500 mb-2">
                            BUDGET STATUS
                          </Label>
                          <div className="bg-red-500 border-4 border-black p-3">
                            <div className="bg-black p-2">
                              <Progress
                                value={Math.min(status.utilization, 100)}
                                className={cn(
                                  "w-full h-3 mb-2",
                                  status.isOverBudget &&
                                    "*:data-[state=complete]:bg-red-500",
                                )}
                              />
                              <div className="flex justify-between text-xs font-black uppercase">
                                <span className="text-white">
                                  {status.utilization.toFixed(1)}% USED
                                </span>
                                <span
                                  className={
                                    status.remaining >= 0
                                      ? "text-green-400"
                                      : "text-red-500"
                                  }
                                >
                                  {status.remaining >= 0
                                    ? `${formatCurrency(status.remaining)} LEFT`
                                    : `${formatCurrency(Math.abs(status.remaining))} OVER`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-4 border-red-500 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="bg-black border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide px-8 py-4 order-2 sm:order-1"
              >
                <X className="w-5 h-5 mr-2" />
                CANCEL
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-8 py-4 border-4 border-black order-1 sm:order-2 text-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    UPDATING SYSTEM...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    SAVE BUDGET SETTINGS
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
