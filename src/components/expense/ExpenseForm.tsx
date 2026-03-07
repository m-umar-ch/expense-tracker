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
import { Field, FieldLabel, FieldError } from "../ui/field";

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
      <DialogContent className="w-full max-w-full sm:max-w-[600px] h-dvh sm:h-auto sm:max-h-[90vh] flex flex-col p-0 sm:rounded-lg overflow-hidden border-none sm:border">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b sm:border-none">
          <DialogTitle className="text-xl">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      aria-invalid={isInvalid}
                      className="h-11 sm:h-10"
                    />
                    <FieldError errors={field.state.meta.errors} />
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
                      inputMode="decimal"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      className="h-11 sm:h-10 text-lg sm:text-base font-medium"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="h-11 sm:h-10"
                      >
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            <div className="flex items-center gap-2 shrink-0 py-1">
                              <div
                                className="w-4 h-4 rounded-full border border-black/10"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium text-base sm:text-sm">
                                {category.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
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
                      aria-invalid={isInvalid}
                      className="h-11 sm:h-10 dark:scheme-dark cursor-pointer"
                    />
                    <FieldError errors={field.state.meta.errors} />
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
                    className="resize-none min-h-[100px] text-base"
                    aria-invalid={isInvalid}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          />

          <Field className="space-y-2">
            <FieldLabel>Receipt</FieldLabel>
            {!selectedImage ? (
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 active:bg-muted transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base font-bold">Upload receipt</p>
                <p className="text-xs text-muted-foreground mt-1.5 px-4">
                  Tap to browse or take a photo • Max 5MB
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
              <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Receipt className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">
                      {selectedImage.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setSelectedImage(null)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            )}
          </Field>
        </form>

        <div className="p-6 pt-2 border-t bg-background shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="h-12 sm:h-10 text-base font-bold flex-1"
                  onClick={() => form.handleSubmit()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
            <Button
              type="button"
              variant="outline"
              className="h-12 sm:h-10 text-base font-bold sm:flex-none sm:px-8 border-border/50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
