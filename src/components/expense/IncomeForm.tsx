import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Income } from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "../ui/field";

interface IncomeFormProps {
  editingIncome?: Income;
  onClose: () => void;
}

const incomeSchema = z.object({
  name: z.string().min(1, "Source is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string(),
});

export function IncomeForm({ editingIncome, onClose }: IncomeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createIncome = useMutation(api.functions.incomes.createIncome);
  const updateIncome = useMutation(api.functions.incomes.updateIncome);

  const form = useForm({
    defaultValues: {
      name: editingIncome?.name || "",
      amount: editingIncome?.amount || 0,
      date: editingIncome?.date
        ? new Date(editingIncome.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: editingIncome?.notes || "",
    },
    validators: {
      onChange: incomeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const incomeData = {
          name: value.name.trim(),
          amount: value.amount,
          date: new Date(value.date).getTime(),
          notes: value.notes.trim() || undefined,
        };

        if (editingIncome) {
          await updateIncome({
            id: editingIncome._id,
            ...incomeData,
          });
          toast.success("Income updated successfully");
        } else {
          await createIncome(incomeData);
          toast.success("Income added successfully");
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingIncome ? "Edit Income" : "Add New Income"}
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
          <div className="grid grid-cols-1 gap-4">
            <form.Field
              name="name"
              children={(field) => {
                const current = field.state.meta;
                const isInvalid = current.isTouched && !current.isValid;

                return (
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Income Source</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Salary, Freelance project"
                      aria-invalid={isInvalid}
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
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                    />
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
                    <FieldLabel htmlFor={field.name}>Date Received</FieldLabel>
                    <Input
                      id={field.name}
                      type="date"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
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
                  <Field className="space-y-2" data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Notes (Optional)
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Add details..."
                      className="resize-none"
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>

          <DialogFooter>
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
                  ) : editingIncome ? (
                    "Update Income"
                  ) : (
                    "Add Income"
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
