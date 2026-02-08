import { Id } from "../../convex/_generated/dataModel";

export interface Category {
  _id: Id<"categories">;
  name: string;
  color?: string;
  budgetLimit?: number;
  isDefault: boolean;
  userId: Id<"users">;
}

export interface Expense {
  _id: Id<"expenses">;
  name: string;
  categoryId: Id<"categories">;
  amount: number;
  date: number;
  notes?: string;
  receiptImageId?: Id<"_storage">;
  userId: Id<"users">;
  category?: Category;
  receiptUrl?: string;
}

export interface CategorySpending {
  category: Category;
  totalSpent: number;
  expenseCount: number;
  percentageOfTotal: number;
  budgetUtilization: number | null;
}

export type TimePeriod =
  | "weekly"
  | "monthly"
  | "3months"
  | "6months"
  | "yearly"
  | "all";
