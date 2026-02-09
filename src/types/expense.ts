// Frontend types for Expense Tracker
// These types mirror the Convex backend types but are frontend-specific

/**
 * Generic ID type for Convex documents
 * This mirrors the Id<T> type from Convex but for frontend use
 */
export type ConvexId<TableName extends string> = string & {
  __tableName: TableName;
};

export interface Category {
  _id: ConvexId<"categories">;
  name: string;
  color?: string;
  budgetLimit?: number;
  isDefault: boolean;
  userId: string;
}

export interface Expense {
  _id: ConvexId<"expenses">;
  name: string;
  categoryId: ConvexId<"categories">;
  amount: number;
  date: number;
  notes?: string;
  receiptImageId?: ConvexId<"_storage">;
  userId: string;
  category?: Category | null;
  receiptUrl?: string | null;
  _creationTime?: number;
}

export interface CategorySpending {
  category: Category;
  totalSpent: number;
  expenseCount: number;
  budgetLimit: number;
  budgetUsed: number;
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
