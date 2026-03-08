import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Category } from "../../types/expense";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Trash2,
  Plus,
  Folder,
  Palette,
  X,
  Save,
  ChevronRight,
  PlusCircle,
  Hash,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatCurrencyCompact } from "@/utils/currency";

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
}

export function CategoryManager({ categories, onClose }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    budgetLimit: "",
    type: "expense" as "expense" | "income",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCategory = useMutation(api.functions.categories.createCategory);
  const updateCategory = useMutation(api.functions.categories.updateCategory);
  const deleteCategory = useMutation(api.functions.categories.deleteCategory);

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3b82f6",
      budgetLimit: "",
      type: "expense",
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color || "#3b82f6",
      budgetLimit: category.budgetLimit?.toString() || "",
      type: category.type || "expense",
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        type: formData.type,
        budgetLimit: formData.budgetLimit
          ? parseFloat(formData.budgetLimit)
          : undefined,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id as Id<"categories">,
          ...categoryData,
        });
        toast.success("Category updated");
      } else {
        await createCategory(categoryData);
        toast.success("Category created");
      }

      resetForm();
    } catch (error) {
      toast.error("Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: Id<"categories">) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory({ id: categoryId });
      toast.success("Category removed");
    } catch (error) {
      toast.error("Cannot delete category in use");
    }
  };

  const predefinedColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#64748b",
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto w-[95vw] shadow-none border-border">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Manage Categories
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className="text-[10px] font-bold uppercase tracking-widest px-2 h-5"
            >
              {categories.length} Total
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {showForm ? (
            <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {editingCategory ? (
                      <Edit className="w-4 h-4" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    {editingCategory ? "Edit Category" : "New Category"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetForm}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="cat_name"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Category Name
                      </Label>
                      <Input
                        id="cat_name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Subscriptions"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Type
                      </Label>
                      <div className="flex p-1 bg-background border rounded-lg h-10">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "expense" })
                          }
                          className={cn(
                            "flex-1 text-[10px] font-bold uppercase rounded-md transition-all",
                            formData.type === "expense"
                              ? "bg-destructive text-destructive-foreground shadow-xs"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "income" })
                          }
                          className={cn(
                            "flex-1 text-[10px] font-bold uppercase rounded-md transition-all",
                            formData.type === "income"
                              ? "bg-green-600 dark:bg-green-700 text-white shadow-xs"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          Income
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Pick a Color
                    </Label>
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={cn(
                            "w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                            formData.color === color
                              ? "border-foreground scale-110 shadow-sm"
                              : "border-transparent",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 hover:border-primary hover:text-primary transition-all gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </Button>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
              Your Categories
            </h3>
            <div className="grid grid-cols-1 gap-2 border rounded-xl overflow-hidden divide-y">
              {categories.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No categories found.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="p-3 hover:bg-muted/30 transition-colors group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full shadow-xs shrink-0 border border-background"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">
                            {category.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] h-3.5 px-1 font-bold uppercase",
                              category.type === "income"
                                ? "border-green-500/50 text-green-600 dark:text-green-400 dark:border-green-400/30"
                                : "border-destructive/30 text-destructive",
                            )}
                          >
                            {category.type || "expense"}
                          </Badge>
                        </div>
                        {category.budgetLimit && (
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mt-0.5">
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[9px] uppercase font-bold tracking-tighter"
                            >
                              Budget Focus
                            </Badge>
                            <span>
                              Limit:{" "}
                              {formatCurrencyCompact(category.budgetLimit)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(category._id as Id<"categories">)
                        }
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
