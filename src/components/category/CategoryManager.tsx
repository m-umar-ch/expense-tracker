import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Category } from "../../types/expense";
import { formatCurrencyCompact } from "../../utils/currency";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
              <p className="text-sm text-gray-600 mt-1">Create and organize your expense categories</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Food & Dining"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Theme
                  </label>
                  
                  {/* Toggle between preset and custom colors */}
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowCustomColorPicker(false)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        !showCustomColorPicker
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      Preset Colors
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomColorPicker(true)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        showCustomColorPicker
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      Custom Color
                    </button>
                  </div>

                  {showCustomColorPicker ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Basic hex color validation
                            if (value.match(/^#[0-9A-Fa-f]{6}$/) || value.match(/^#[0-9A-Fa-f]{3}$/)) {
                              setFormData({ ...formData, color: value });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter a hex color code (e.g., #ff5733)</p>
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
                            formData.color === color ? "border-gray-800 shadow-lg" : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Budget Limit (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Optional budget limit"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set a monthly spending limit for this category</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    {editingCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Category Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              + Add New Category
            </button>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Categories ({categories.length})</h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📂</span>
                </div>
                <p className="text-gray-600">No categories yet. Create your first category above.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <div className="text-sm text-gray-600">
                          {category.budgetLimit ? (
                            <span>Monthly Budget: {formatCurrencyCompact(category.budgetLimit)}</span>
                          ) : (
                            <span>No budget limit set</span>
                          )}
                          {category.isDefault && (
                            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!category.isDefault && (
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
