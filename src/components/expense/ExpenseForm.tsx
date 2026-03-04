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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, Receipt, Trash2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Field, FieldLabel } from "../ui/field";

interface ExpenseFormProps {
  categories: Category[];
  editingExpense?: Expense;
  onClose: () => void;
}

const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number(),
  date: z.string().min(1, "Date is required"),
  notes: z.string(),
});

export function ExpenseForm({
  categories,
  editingExpense,
  onClose,
}: ExpenseFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createExpense = useMutation(api.functions.expenses.createExpense);
  const updateExpense = useMutation(api.functions.expenses.updateExpense);
  const generateUploadUrl = useMutation(
    api.functions.expenses.generateUploadUrl,
  );

  const form = useForm({
    defaultValues: {
      name: editingExpense?.name || "",
      categoryId: editingExpense?.categoryId || "",
      amount: editingExpense?.amount || 0,
      date: editingExpense?.date
        ? new Date(editingExpense.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: editingExpense?.notes || "",
    },
    validators: {
      onChange: expenseSchema,
    },
    onSubmit: async ({ value }) => {
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
          name: value.name.trim(),
          categoryId: value.categoryId as Id<"categories">,
          amount: value.amount,
          date: new Date(value.date).getTime(),
          notes: value.notes.trim() || undefined,
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
        toast.error("An error occurred while saving");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="name"
              children={(field) => {
                const current = field.state.meta;
                const isInvalid = current.isTouched && !current.isValid;

                return (
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Expense Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Grocery Shopping"
                    />
                  </Field>
                );
              }}
            />

            <form.Field
              name="amount"
              children={(field) => {
                const current = field.state.meta;
                const isInvalid = current.isTouched && !current.isValid;

                return (
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  </Field>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="categoryId"
              children={(field) => {
                const current = field.state.meta;
                const isInvalid = current.isTouched && !current.isValid;

                return (
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            <form.Field
              name="date"
              children={(field) => {
                const current = field.state.meta;
                const isInvalid = current.isTouched && !current.isValid;

                return (
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <Input
                      id={field.name}
                      type="date"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                );
              }}
            />
          </div>

          <form.Field
            name="notes"
            children={(field) => {
              const current = field.state.meta;
              const isInvalid = current.isTouched && !current.isValid;

              return (
                <Field className="space-y-2" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Notes (Optional)</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Add details..."
                    className="resize-none"
                  />
                </Field>
              );
            }}
          />

          <Field className="space-y-2">
            <FieldLabel>Receipt</FieldLabel>
            {!selectedImage ? (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload receipt</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB • Image files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Receipt className="w-5 h-5 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {selectedImage.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            )}
          </Field>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingExpense ? (
                    "Update Expense"
                  ) : (
                    "Add Expense"
                  )}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
