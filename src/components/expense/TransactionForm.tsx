import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Transaction, Category } from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Receipt, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSettings } from "../../contexts/SettingsContext";

interface TransactionFormProps {
  editingTransaction?: Transaction;
  defaultType?: "expense" | "income";
  categories: Category[];
  onClose: () => void;
}

const transactionSchema = z.object({
  name: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string(),
  type: z.union([z.literal("expense"), z.literal("income")]),
});

export function TransactionForm({
  editingTransaction,
  defaultType = "expense",
  categories,
  onClose,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptImageId, setReceiptImageId] = useState<string | undefined>(
    editingTransaction?.receiptImageId,
  );
  const [receiptUrl, setReceiptUrl] = useState<string | null>(
    editingTransaction?.receiptUrl || null,
  );

  const createTransaction = useMutation(
    api.functions.transactions.createTransaction,
  );
  const updateTransaction = useMutation(
    api.functions.transactions.updateTransaction,
  );
  const deleteTransaction = useMutation(
    api.functions.transactions.deleteTransaction,
  );
  const generateUploadUrl = useMutation(
    api.functions.transactions.generateUploadUrl,
  );

  const form = useForm({
    defaultValues: {
      name: editingTransaction?.name || "",
      amount: editingTransaction?.amount || 0,
      categoryId: editingTransaction?.categoryId || "",
      type: (editingTransaction?.type || defaultType) as "expense" | "income",
      date: editingTransaction?.date
        ? new Date(editingTransaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: editingTransaction?.notes || "",
    },
    validators: {
      onChange: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const transactionData = {
          name: value.name.trim(),
          type: value.type,
          amount: value.amount,
          categoryId: value.categoryId as any, // categoryId is string from schema, needs cast to ID for convex
          date: new Date(value.date).getTime(),
          notes: value.notes.trim() || undefined,
          receiptImageId: receiptImageId as any,
        };

        if (editingTransaction) {
          await updateTransaction({
            id: editingTransaction._id,
            ...transactionData,
          });
          toast.success("Transaction updated successfully");
        } else {
          await createTransaction(transactionData);
          toast.success("Transaction added successfully");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();
      setReceiptImageId(storageId);
      setReceiptUrl(URL.createObjectURL(file));
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload receipt");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeReceipt = () => {
    setReceiptImageId(undefined);
    setReceiptUrl(null);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-[600px] h-dvh sm:h-auto sm:max-h-[90vh] flex flex-col p-0 sm:rounded-lg overflow-hidden border-none sm:border">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b sm:border-none">
          <DialogTitle className="text-xl">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form.Subscribe
          selector={(state) => state.values.type}
          children={(currentType) => {
            const filteredCategories = categories.filter(
              (c) => c.type === currentType,
            );

            return (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Transaction Type Toggle */}
                    <div className="sm:col-span-2">
                      <Label className="mb-2 block text-sm font-medium">
                        Transaction Type
                      </Label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            form.setFieldValue("type", "expense");
                            const expenseCats = categories.filter(
                              (c) => c.type === "expense",
                            );
                            if (expenseCats.length > 0) {
                              form.setFieldValue(
                                "categoryId",
                                expenseCats[0]._id,
                              );
                            }
                          }}
                          className={cn(
                            "py-2 text-sm font-bold rounded-md transition-all",
                            currentType === "expense"
                              ? "bg-background shadow-sm text-destructive"
                              : "text-muted-foreground hover:bg-background/50",
                          )}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            form.setFieldValue("type", "income");
                            const incomeCats = categories.filter(
                              (c) => c.type === "income",
                            );
                            if (incomeCats.length > 0) {
                              form.setFieldValue(
                                "categoryId",
                                incomeCats[0]._id,
                              );
                            }
                          }}
                          className={cn(
                            "py-2 text-sm font-bold rounded-md transition-all",
                            currentType === "income"
                              ? "bg-background shadow-sm text-green-600"
                              : "text-muted-foreground hover:bg-background/50",
                          )}
                        >
                          Income
                        </button>
                      </div>
                    </div>

                    <form.Field
                      name="name"
                      children={(field) => {
                        const current = field.state.meta;
                        const isInvalid = current.isTouched && !current.isValid;

                        return (
                          <Field
                            className="space-y-2 sm:col-span-2"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Description
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={
                                currentType === "expense"
                                  ? "e.g., Grocery Shopping"
                                  : "e.g., Monthly Salary"
                              }
                              aria-invalid={isInvalid}
                              className="h-11 sm:h-10 text-base"
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

                    <form.Field
                      name="categoryId"
                      children={(field) => {
                        const current = field.state.meta;
                        const isInvalid = current.isTouched && !current.isValid;

                        return (
                          <Field className="space-y-2" data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Category
                            </FieldLabel>
                            <Select
                              value={field.state.value}
                              onValueChange={field.handleChange}
                            >
                              <SelectTrigger className="h-11 sm:h-10 text-base">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCategories.map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                      />
                                      {cat.name}
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
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              className="h-11 sm:h-10 dark:scheme-dark cursor-pointer text-base"
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </Field>
                        );
                      }}
                    />

                    <form.Field
                      name="notes"
                      children={(field) => {
                        const current = field.state.meta;
                        const isInvalid = current.isTouched && !current.isValid;

                        return (
                          <Field
                            className="space-y-2 sm:col-span-2"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Notes (Optional)
                            </FieldLabel>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="Add any extra details..."
                              className="resize-none min-h-[80px] text-base"
                              aria-invalid={isInvalid}
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </Field>
                        );
                      }}
                    />

                    <div className="sm:col-span-2 space-y-3">
                      <Label className="text-sm font-medium">
                        Receipt Upload
                      </Label>
                      {!receiptUrl ? (
                        <Label
                          htmlFor="receipt-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          ) : (
                            <>
                              <div className="flex bg-primary/10 p-2.5 rounded-full mb-2">
                                <ImageIcon className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Capture or select image
                              </span>
                            </>
                          )}
                          <Input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </Label>
                      ) : (
                        <Card className="relative overflow-hidden group border-primary/20 bg-primary/5">
                          <div className="flex items-center p-3 gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">
                                Receipt Attached
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(receiptUrl, "_blank")
                                }
                                className="text-[10px] font-bold text-primary uppercase tracking-tight hover:underline"
                              >
                                View Full Image
                              </button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={removeReceipt}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </form>

                <div className="p-6 pt-2 border-t bg-background shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                      children={([canSubmit, isSubmitting]) => (
                        <Button
                          type="submit"
                          disabled={!canSubmit || (isSubmitting as boolean)}
                          onClick={() => form.handleSubmit()}
                          className={cn(
                            "h-12 sm:h-10 text-base font-bold flex-[2]",
                            currentType === "income"
                              ? "bg-green-600 hover:bg-green-700"
                              : "",
                          )}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : editingTransaction ? (
                            "Update Transaction"
                          ) : (
                            `Add ${currentType === "expense" ? "Expense" : "Income"}`
                          )}
                        </Button>
                      )}
                    />

                    {editingTransaction && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-12 sm:h-10 text-destructive hover:bg-destructive/10 font-bold"
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this transaction?",
                            )
                          ) {
                            await deleteTransaction({
                              id: editingTransaction._id,
                            });
                            onClose();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 sm:h-10 text-base font-bold sm:flex-1 border-border/50"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            );
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
