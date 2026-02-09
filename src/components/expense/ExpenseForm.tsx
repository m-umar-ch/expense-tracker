import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Category, Expense } from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2, Receipt, Trash2 } from "lucide-react";

interface ExpenseFormProps {
  categories: Category[];
  editingExpense?: Expense;
  onClose: () => void;
}

export function ExpenseForm({
  categories,
  editingExpense,
  onClose,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    name: editingExpense?.name || "",
    categoryId: editingExpense?.categoryId || "",
    amount: editingExpense?.amount || "",
    date: editingExpense?.date
      ? new Date(editingExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: editingExpense?.notes || "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createExpense = useMutation(api.functions.expenses.createExpense);
  const updateExpense = useMutation(api.functions.expenses.updateExpense);
  const generateUploadUrl = useMutation(
    api.functions.expenses.generateUploadUrl,
  );

  const selectedCategory = categories.find(
    (cat) => cat._id === formData.categoryId,
  );

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.amount) {
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptImageId: Id<"_storage"> | undefined;

      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: selectedImage,
        });

        if (response.ok) {
          const { storageId } = await response.json();
          receiptImageId = storageId;
        }
      }

      const expenseData = {
        name: formData.name.trim(),
        categoryId: formData.categoryId as Id<"categories">,
        amount: parseFloat(formData.amount.toString()),
        date: new Date(formData.date).getTime(),
        notes: formData.notes.trim() || undefined,
        receiptImageId,
      };

      if (editingExpense) {
        await updateExpense({
          id: editingExpense._id,
          ...expenseData,
        });
        toast.success("EXPENSE MODIFIED SUCCESSFULLY!");
      } else {
        await createExpense(expenseData);
        toast.success("EXPENSE ADDED TO SYSTEM!");
      }

      onClose();
    } catch (error) {
      toast.error("SYSTEM ERROR - TRY AGAIN");
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto bg-black border-4 border-red-500 text-white font-mono">
        <DialogHeader className="border-b-4 border-red-500 pb-4 mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-wider text-red-500">
            {editingExpense ? "MODIFY EXPENSE" : "ADD NEW EXPENSE"}
          </DialogTitle>
          <p className="text-sm font-bold uppercase text-gray-400 mt-2">
            FILL ALL REQUIRED FIELDS • NO BULLSHIT
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-red-500 border-4 border-black p-6">
            <h3 className="text-xl font-black uppercase mb-4 text-black">
              EXPENSE DETAILS
            </h3>
            <div className="bg-black p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block font-black uppercase text-red-500 mb-2">
                    EXPENSE NAME *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="GROCERY SHOPPING"
                    required
                    className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4"
                  />
                </div>

                <div>
                  <Label className="block font-black uppercase text-red-500 mb-2">
                    AMOUNT ($) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4 text-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block font-black uppercase text-red-500 mb-2">
                    CATEGORY *
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide focus:border-white focus:ring-0 p-4">
                      <SelectValue placeholder="SELECT CATEGORY">
                        {selectedCategory && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 border-2 border-white"
                              style={{
                                backgroundColor: selectedCategory.color,
                              }}
                            />
                            <span className="font-black uppercase">
                              {selectedCategory.name}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-black border-4 border-red-500 text-white font-bold">
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          className="text-white hover:bg-red-500 hover:text-black font-bold uppercase focus:bg-red-500 focus:text-black"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 border-2 border-white"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                            {category.isDefault && (
                              <Badge className="bg-white text-black text-xs font-black">
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block font-black uppercase text-red-500 mb-2">
                    DATE *
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide focus:border-white focus:ring-0 p-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-xl font-black uppercase mb-4 text-black">
              ADDITIONAL INFO
            </h3>
            <div className="bg-black border-4 border-red-500 p-4">
              <Label className="block font-black uppercase text-red-500 mb-2">
                NOTES (OPTIONAL)
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="ADD EXTRA DETAILS HERE..."
                rows={3}
                className="bg-black border-4 border-red-500 text-white font-bold uppercase tracking-wide placeholder-gray-500 focus:border-white focus:ring-0 p-4 resize-none"
              />
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div className="bg-red-500 border-4 border-black p-6">
            <h3 className="text-xl font-black uppercase mb-4 text-black">
              RECEIPT UPLOAD
            </h3>
            <div className="bg-black border-4 border-red-500 p-4">
              {!selectedImage ? (
                <div className="text-center space-y-4">
                  <div
                    className="border-4 border-dashed border-red-500 p-8 cursor-pointer hover:border-white transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="font-black uppercase text-red-500 text-lg">
                      CLICK TO UPLOAD RECEIPT
                    </p>
                    <p className="font-bold uppercase text-gray-400 text-sm mt-2">
                      MAX 5MB • JPG/PNG ONLY
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-4 border-red-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-black uppercase text-white">
                          {selectedImage.name}
                        </p>
                        <p className="font-bold uppercase text-gray-400 text-sm">
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="bg-red-500 hover:bg-red-600 text-black font-black uppercase p-3"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-4 border-red-500 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-black border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide px-8 py-4 order-2 sm:order-1"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wide px-8 py-4 border-4 border-black order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    PROCESSING...
                  </>
                ) : editingExpense ? (
                  "MODIFY EXPENSE"
                ) : (
                  "ADD EXPENSE"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
