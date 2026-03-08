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
import {
  Loader2,
  Receipt,
  Image as ImageIcon,
  X,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
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
import { Id } from "@convex/_generated/dataModel";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

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

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function TransactionForm({
  editingTransaction,
  defaultType = "expense",
  categories,
  onClose,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    editingTransaction?.date ? new Date(editingTransaction.date) : new Date(),
  );
  const [displayDate, setDisplayDate] = useState(
    formatDate(
      editingTransaction?.date ? new Date(editingTransaction.date) : new Date(),
    ),
  );
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
      onSubmit: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const transactionData = {
          name: value.name.trim(),
          type: value.type,
          amount: value.amount,
          categoryId: value.categoryId as any,
          date: new Date(value.date).getTime(),
          notes: value.notes.trim() || undefined,
          receiptImageId: receiptImageId as any,
        };

        if (editingTransaction) {
          await updateTransaction({
            id: editingTransaction._id as Id<"transactions">,
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

  const {
    values,
    isSubmitting: formSubmitting,
    canSubmit,
  } = useStore(form.store, (state) => state);

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
          <DialogTitle className="text-xl font-black italic tracking-tight uppercase">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Transaction Type Toggle */}
            <div className="sm:col-span-2">
              <Label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Transaction Type
              </Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => {
                    const nextType = "expense";
                    form.reset();
                    form.setFieldValue("type", nextType);
                    const expenseCats = categories.filter(
                      (c) => c.type === "expense" || !c.type,
                    );
                    if (expenseCats.length > 0) {
                      form.setFieldValue("categoryId", expenseCats[0]._id);
                    }
                  }}
                  className={cn(
                    "py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all transform active:scale-95",
                    values.type === "expense"
                      ? "bg-background shadow-md text-destructive scale-100"
                      : "text-muted-foreground hover:bg-background/30",
                  )}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextType = "income";
                    form.reset();
                    form.setFieldValue("type", nextType);
                    const incomeCats = categories.filter(
                      (c) => c.type === "income",
                    );
                    if (incomeCats.length > 0) {
                      form.setFieldValue("categoryId", incomeCats[0]._id);
                    }
                  }}
                  className={cn(
                    "py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all transform active:scale-95",
                    values.type === "income"
                      ? "bg-background shadow-md text-green-600 dark:text-green-400 scale-100"
                      : "text-muted-foreground hover:bg-background/30",
                  )}
                >
                  Income
                </button>
              </div>
            </div>

            <form.Field
              name="name"
              children={(field) => (
                <Field
                  className=" sm:col-span-2"
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={
                      values.type === "expense"
                        ? "e.g., Grocery Shopping"
                        : "e.g., Monthly Salary"
                    }
                    className=" text-base font-bold"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="amount"
              children={(field) => (
                <Field
                  className=""
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">
                      $
                    </span>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      className=" pl-8 text-xl font-black"
                    />
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="categoryId"
              children={(field) => {
                const filteredCategories = categories.filter(
                  (c) =>
                    c.type === values.type ||
                    (values.type === "expense" && !c.type),
                );

                return (
                  <Field
                    className=""
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className="font-bold">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <SelectItem
                              key={cat._id}
                              value={cat._id}
                              className="h-11 focus:bg-primary/5 focus:text-primary transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3.5 h-3.5 rounded-full border shadow-sm"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className="font-bold">{cat.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm font-bold text-muted-foreground italic">
                            No categories found for {values.type}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="date"
              children={(field) => (
                <Field
                  className=""
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      value={displayDate}
                      placeholder={formatDate(new Date())}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDisplayDate(val);
                        const parsed = new Date(val);
                        if (isValidDate(parsed)) {
                          setCalendarMonth(parsed);
                          field.handleChange(
                            parsed.toISOString().split("T")[0],
                          );
                        }
                      }}
                      onBlur={field.handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setPopoverOpen(true);
                        }
                      }}
                      className="font-bold"
                    />
                    <InputGroupAddon align="inline-end">
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <InputGroupButton
                            id="date-picker-trigger"
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Select date"
                          >
                            <CalendarIcon />
                            <span className="sr-only">Select date</span>
                          </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="end"
                          alignOffset={-8}
                          sideOffset={10}
                        >
                          <Calendar
                            mode="single"
                            selected={new Date(field.state.value)}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            onSelect={(date) => {
                              if (date) {
                                setCalendarMonth(date);
                                setDisplayDate(formatDate(date));
                                field.handleChange(
                                  date.toISOString().split("T")[0],
                                );
                                setPopoverOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="notes"
              children={(field) => (
                <Field
                  className=" sm:col-span-2"
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>Notes (Optional)</FieldLabel>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Add any extra details..."
                    className="resize-none min-h-[100px] text-base font-medium"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <div className="sm:col-span-2 space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Receipt Upload
              </Label>
              {!receiptUrl ? (
                <Label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all hover:border-primary/50 group"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <div className="flex bg-primary/10 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
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
                <Card className="relative overflow-hidden group border-primary/20 bg-primary/5 rounded-2xl">
                  <div className="flex items-center p-4 gap-4">
                    <div className="bg-primary/20 p-2.5 rounded-xl">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black italic tracking-tight uppercase">
                        Receipt Attached
                      </p>
                      <button
                        type="button"
                        onClick={() => window.open(receiptUrl, "_blank")}
                        className="text-[10px] font-black text-primary uppercase tracking-tight hover:underline flex items-center gap-1"
                      >
                        Open Preview
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={removeReceipt}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 pt-2 border-t bg-background shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={formSubmitting}
              onClick={() => form.handleSubmit()}
              className={cn(
                "h-14 sm:h-12 text-base font-black uppercase tracking-wider flex-2 rounded-xl shadow-xl transition-all active:scale-95",
                values.type === "income"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-600/20 dark:bg-green-700 dark:hover:bg-green-600"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : editingTransaction ? (
                "Update Transaction"
              ) : (
                `Save ${values.type}`
              )}
            </Button>

            {editingTransaction && (
              <Button
                type="button"
                variant="ghost"
                className="h-14 sm:h-12 text-destructive hover:bg-destructive/10 font-bold rounded-xl"
                onClick={async () => {
                  if (
                    confirm("Are you sure you want to delete this transaction?")
                  ) {
                    await deleteTransaction({
                      id: editingTransaction._id as Id<"transactions">,
                    });
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="h-14 sm:h-12 text-base font-bold sm:flex-1 border-border/50 rounded-xl"
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
