import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Category } from "../../types/expense";
import { formatCurrencyCompact } from "../../utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Plus, Folder, Palette, X, Save } from "lucide-react";

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
}

export function CategoryManager({ categories, onClose }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#ff0000",
    budgetLimit: "",
  });
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const createCategory = useMutation(api.functions.categories.createCategory);
  const updateCategory = useMutation(api.functions.categories.updateCategory);
  const deleteCategory = useMutation(api.functions.categories.deleteCategory);

  // Scroll to top when form opens
  useEffect(() => {
    if (showForm && dialogContentRef.current) {
      dialogContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showForm]);

  const resetForm = () => {
    setFormData({ name: "", color: "#ff0000", budgetLimit: "" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color || "#ff0000",
      budgetLimit: category.budgetLimit?.toString() || "",
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        budgetLimit: formData.budgetLimit
          ? parseFloat(formData.budgetLimit)
          : undefined,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...categoryData,
        });
        toast.success("CATEGORY MODIFIED SUCCESSFULLY!");
      } else {
        await createCategory(categoryData);
        toast.success("CATEGORY ADDED TO SYSTEM!");
      }

      resetForm();
    } catch (error) {
      toast.error("SYSTEM ERROR - TRY AGAIN");
    }
  };

  const handleDelete = async (categoryId: Id<"categories">) => {
    if (!confirm("DELETE THIS CATEGORY PERMANENTLY?")) return;

    try {
      await deleteCategory({ id: categoryId });
      toast.success("CATEGORY DELETED FROM SYSTEM!");
    } catch (error) {
      toast.error("CANNOT DELETE - CATEGORY IN USE");
    }
  };

  const predefinedColors = [
    "#ff0000",
    "#ff3333",
    "#ff6666",
    "#cc0000",
    "#ffffff",
    "#cccccc",
    "#999999",
    "#666666",
    "#ffff00",
    "#ffcc00",
    "#ff9900",
    "#ff6600",
    "#00ff00",
    "#00cc00",
    "#009900",
    "#006600",
    "#0000ff",
    "#0066ff",
    "#0099ff",
    "#00ccff",
    "#ff00ff",
    "#cc00cc",
    "#9900cc",
    "#6600cc",
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        ref={dialogContentRef}
        className="sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-black border-4 border-red-500 text-white font-mono"
      >
        <DialogHeader className="border-b-4 border-red-500 pb-4 mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-wider text-red-500">
            CATEGORY MANAGEMENT SYSTEM
          </DialogTitle>
          <p className="text-sm font-bold uppercase text-gray-400 mt-2">
            {categories.length} CATEGORIES IN DATABASE
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-red-500 border-4 border-black p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black uppercase text-black">
                  {editingCategory ? "MODIFY CATEGORY" : "CREATE NEW CATEGORY"}
                </h3>
                <Button
                  type="button"
                  onClick={resetForm}
                  className="bg-black text-white border-4 border-white hover:bg-white hover:text-black font-black p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-black p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="block font-black uppercase text-red-500 mb-2">
                      CATEGORY NAME *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="FOOD & DINING"
                      required
                      className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4"
                    />
                  </div>

                  <div>
                    <Label className="block font-black uppercase text-red-500 mb-2">
                      COLOR SCHEME
                    </Label>
                    <div className="grid grid-cols-8 gap-2 mb-4">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-12 h-12 border-4 ${
                            formData.color === color
                              ? "border-white"
                              : "border-gray-600"
                          } hover:border-white transition-colors`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="font-black uppercase text-red-500">
                        CUSTOM:
                      </Label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className="w-16 h-12 border-4 border-red-500 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block font-black uppercase text-red-500 mb-2">
                      BUDGET LIMIT ($) - OPTIONAL
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.budgetLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetLimit: e.target.value,
                        })
                      }
                      placeholder="500.00"
                      className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide py-4 border-4 border-black"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {editingCategory ? "MODIFY CATEGORY" : "CREATE CATEGORY"}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      className="bg-black border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide py-4 px-8"
                    >
                      CANCEL
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white border-4 border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase text-black">
                CATEGORY DATABASE
              </h3>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-6 py-3 border-4 border-black"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  NEW CATEGORY
                </Button>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="bg-black border-4 border-red-500 p-12 text-center">
                <Folder className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-xl font-black uppercase text-red-500 mb-2">
                  NO CATEGORIES FOUND
                </h4>
                <p className="font-bold uppercase text-gray-400">
                  CREATE YOUR FIRST CATEGORY TO GET STARTED
                </p>
              </div>
            ) : (
              <div className="bg-black p-4 space-y-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="border-4 border-red-500 bg-black p-4 hover:border-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 border-4 border-white"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="font-black uppercase text-white text-lg">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            {category.budgetLimit && (
                              <span className="font-bold uppercase text-red-500 text-sm">
                                BUDGET:{" "}
                                {formatCurrencyCompact(category.budgetLimit)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(category)}
                          className="bg-red-500 hover:bg-red-600 text-black font-black uppercase p-3 border-2 border-black"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category._id)}
                          className="bg-white hover:bg-gray-200 text-black font-black uppercase p-3 border-2 border-black"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="bg-red-500 border-4 border-black p-6">
            <div className="bg-black p-4">
              <h3 className="text-lg font-black uppercase text-red-500 mb-4">
                SYSTEM STATUS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="border-4 border-red-500 p-4">
                  <div className="text-2xl font-black text-white">
                    {categories.length}
                  </div>
                  <div className="font-bold uppercase text-gray-400 text-sm">
                    TOTAL CATEGORIES
                  </div>
                </div>
                <div className="border-4 border-red-500 p-4">
                  <div className="text-2xl font-black text-white">
                    {categories.filter((c) => c.budgetLimit).length}
                  </div>
                  <div className="font-bold uppercase text-gray-400 text-sm">
                    WITH BUDGETS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="border-t-4 border-red-500 pt-6">
            <Button
              onClick={onClose}
              className="w-full bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide py-4 border-4 border-black text-xl"
            >
              CLOSE CATEGORY MANAGER
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
