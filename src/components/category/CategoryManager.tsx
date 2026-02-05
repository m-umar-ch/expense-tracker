import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Category } from "../../types/expense";
import { formatCurrencyCompact } from "../../utils/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Plus, Folder, Palette } from "lucide-react";

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
}

export function CategoryManager({ categories, onClose }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#6b7280",
    budgetLimit: "",
  });
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        budgetLimit: formData.budgetLimit ? parseFloat(formData.budgetLimit) : undefined,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...categoryData,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategory(categoryData);
        toast.success("Category created successfully");
      }

      resetForm();
    } catch (error) {
      toast.error("Failed to save category");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const categoryColor = category.color || "#6b7280";
    setFormData({
      name: category.name,
      color: categoryColor,
      budgetLimit: category.budgetLimit?.toString() || "",
    });
    
    // Check if the category uses a custom color (not in preset options)
    setShowCustomColorPicker(!colorOptions.includes(categoryColor));
    setShowForm(true);
  };

  const handleDelete = async (categoryId: Id<"categories">) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCategory({ id: categoryId });
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#6b7280",
      budgetLimit: "",
    });
    setEditingCategory(null);
    setShowForm(false);
    setShowCustomColorPicker(false);
  };

  const colorOptions = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#a855f7", // purple
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create and organize your expense categories
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Add/Edit Form */}
          {showForm && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Category Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Food & Dining"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    
                    {/* Toggle between preset and custom colors */}
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        type="button"
                        onClick={() => setShowCustomColorPicker(false)}
                        variant={!showCustomColorPicker ? "default" : "outline"}
                        size="sm"
                      >
                        <Palette className="w-4 h-4 mr-1" />
                        Preset Colors
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCustomColorPicker(true)}
                        variant={showCustomColorPicker ? "default" : "outline"}
                        size="sm"
                      >
                        Custom Color
                      </Button>
                    </div>

                    {showCustomColorPicker ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-10 rounded-lg border border-input cursor-pointer"
                        />
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={formData.color}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Basic hex color validation
                              if (value.match(/^#[0-9A-Fa-f]{6}$/) || value.match(/^#[0-9A-Fa-f]{3}$/)) {
                                setFormData({ ...formData, color: value });
                              }
                            }}
                            placeholder="#000000"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Enter a hex color code (e.g., #ff5733)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                              formData.color === color ? "border-foreground shadow-lg" : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget Limit (Rs.)</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                      placeholder="Optional budget limit"
                    />
                    <p className="text-xs text-muted-foreground">Set a monthly spending limit for this category</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add Category Button */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </Button>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Categories</h3>
              <Badge variant="secondary">{categories.length} categories</Badge>
            </div>
            
            {categories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-muted-foreground/50 to-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground">No categories yet. Create your first category above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <Card
                    key={category._id}
                    className="hover:shadow-md transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-6 h-6 rounded-lg shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {category.name}
                              {category.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              {category.budgetLimit ? (
                                <span>Monthly Budget: {formatCurrencyCompact(category.budgetLimit)}</span>
                              ) : (
                                <span>No budget limit set</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!category.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
