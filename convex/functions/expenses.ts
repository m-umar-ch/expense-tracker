import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";

export const listExpenses = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];
    const userId = user._id;

    let query = ctx.db.query("expenses").withIndex("by_user_and_date", (q) => {
      if (args.startDate && args.endDate) {
        return q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate);
      }
      return q.eq("userId", userId);
    });

    const expenses = await query.collect();

    // Filter by category if specified
    const filteredExpenses = args.categoryId
      ? expenses.filter((expense) => expense.categoryId === args.categoryId)
      : expenses;

    // Get categories for each expense
    const expensesWithCategories = await Promise.all(
      filteredExpenses.map(async (expense) => {
        const category = await ctx.db.get(expense.categoryId);
        const receiptUrl = expense.receiptImageId
          ? await ctx.storage.getUrl(expense.receiptImageId)
          : null;

        return {
          ...expense,
          category,
          receiptUrl,
        };
      }),
    );

    return expensesWithCategories.sort((a, b) => b.date - a.date);
  },
});

export const createExpense = mutation({
  args: {
    name: v.string(),
    categoryId: v.id("categories"),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id;

    // Verify category belongs to user
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Invalid category");
    }

    return await ctx.db.insert("expenses", {
      name: args.name,
      categoryId: args.categoryId,
      amount: args.amount,
      date: args.date,
      notes: args.notes,
      receiptImageId: args.receiptImageId,
      userId,
    });
  },
});

export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    name: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id;

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found");
    }

    // Verify category if being updated
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.userId !== userId) {
        throw new Error("Invalid category");
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.categoryId && { categoryId: args.categoryId }),
      ...(args.amount !== undefined && { amount: args.amount }),
      ...(args.date && { date: args.date }),
      ...(args.notes !== undefined && { notes: args.notes }),
      ...(args.receiptImageId !== undefined && {
        receiptImageId: args.receiptImageId,
      }),
    });
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id;

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getCategorySpending = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];
    const userId = user._id;

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const categorySpending = categories.map((category) => {
      const categoryExpenses = expenses.filter(
        (expense) => expense.categoryId === category._id,
      );
      const totalSpent = categoryExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      return {
        category,
        totalSpent,
        expenseCount: categoryExpenses.length,
        budgetLimit: category.budgetLimit || 0,
        budgetUsed: category.budgetLimit
          ? (totalSpent / category.budgetLimit) * 100
          : 0,
      };
    });

    return categorySpending.sort((a, b) => b.totalSpent - a.totalSpent);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});
