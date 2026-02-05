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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2, Receipt } from "lucide-react";

interface ExpenseFormProps {
  categories: Category[];
  editingExpense?: Expense;
  onClose: () => void;
}

export function ExpenseForm({ categories, editingExpense, onClose }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    name: editingExpense?.name || "",
    categoryId: editingExpense?.categoryId || "",
    amount: editingExpense?.amount || "",
    date: editingExpense?.date 
      ? new Date(editingExpense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: editingExpense?.notes || "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createExpense = useMutation(api.expenses.createExpense);
  const updateExpense = useMutation(api.expenses.updateExpense);
  const generateUploadUrl = useMutation(api.expenses.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptImageId: Id<"_storage"> | undefined;

      // Upload image if selected
      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        
        if (!result.ok) {
          throw new Error("Failed to upload image");
        }
        
        const { storageId } = await result.json();
        receiptImageId = storageId;
      }

      const expenseData = {
        name: formData.name,
        categoryId: formData.categoryId as Id<"categories">,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date + 'T00:00:00').getTime(), // Explicit local midnight
        notes: formData.notes || undefined,
        receiptImageId,
      };

      if (editingExpense) {
        await updateExpense({
          id: editingExpense._id,
          ...expenseData,
        });
        toast.success("Expense updated successfully");
      } else {
        await createExpense(expenseData);
        toast.success("Expense added successfully");
      }

      onClose();
    } catch (error) {
      toast.error("Failed to save expense");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedCategory = categories.find(cat => cat._id === formData.categoryId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Expense Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grocery shopping"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (Rs.) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category">
                    {selectedCategory && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        {selectedCategory.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                        {category.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details about this expense..."
              rows={3}
            />
          </div>

          {/* Receipt Upload Section */}
          <div className="space-y-3">
            <Label>Receipt (Optional)</Label>
            
            {!selectedImage ? (
              <Card 
                className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium">Click to upload receipt</span>
                    <br />
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selectedImage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {editingExpense?.receiptUrl && !selectedImage && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Current Receipt</p>
                        <p className="text-xs text-muted-foreground">
                          Click to view existing receipt
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(editingExpense.receiptUrl, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


