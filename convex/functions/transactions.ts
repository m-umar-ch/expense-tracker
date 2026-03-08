import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

export const listTransactions = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let transactions;

    if (args.startDate !== undefined && args.endDate !== undefined) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (query) =>
          query
            .eq("userId", userId)
            .gte("date", args.startDate!)
            .lte("date", args.endDate!),
        )
        .order("desc")
        .collect();
    } else if (args.type !== undefined) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_type", (query) =>
          query.eq("userId", userId).eq("type", args.type!),
        )
        .order("desc")
        .collect();
    } else {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .order("desc")
        .collect();
    }

    // Filter by type if index wasn't used
    if (
      args.type &&
      args.startDate !== undefined &&
      args.endDate !== undefined
    ) {
      transactions = transactions.filter((t) => t.type === args.type);
    }

    // Filter by category if specified
    if (args.categoryId) {
      transactions = transactions.filter(
        (t) => t.categoryId === args.categoryId,
      );
    }

    // Optimization: Fetch all categories once
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const categoryMap = new Map(categories.map((c) => [c._id, c]));

    const transactionsWithCategories = [];
    for (const transaction of transactions) {
      const category = categoryMap.get(transaction.categoryId);
      const receiptUrl = transaction.receiptImageId
        ? await ctx.storage.getUrl(transaction.receiptImageId)
        : null;

      transactionsWithCategories.push({
        ...transaction,
        category,
        receiptUrl,
      });
    }

    return transactionsWithCategories;
  },
});

export const createTransaction = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    categoryId: v.id("categories"),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify category belongs to user and matches type
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Invalid category");
    }

    // In the new system, categories have types too.
    if (category.type !== args.type) {
      throw new Error(
        `Category type (${category.type}) does not match transaction type (${args.type})`,
      );
    }

    return await ctx.db.insert("transactions", {
      name: args.name,
      type: args.type,
      categoryId: args.categoryId,
      amount: args.amount,
      date: args.date,
      notes: args.notes,
      receiptImageId: args.receiptImageId,
      userId,
    });
  },
});

export const updateTransaction = mutation({
  args: {
    id: v.id("transactions"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    categoryId: v.optional(v.id("categories")),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const type = args.type || transaction.type;

    // Verify category if being updated or if type is changed
    if (args.categoryId || args.type) {
      const catId = args.categoryId || transaction.categoryId;
      const category = await ctx.db.get(catId);
      if (!category || category.userId !== userId) {
        throw new Error("Invalid category");
      }
      if (category.type !== type) {
        throw new Error(
          `Category type (${category.type}) does not match transaction type (${type})`,
        );
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.type && { type: args.type }),
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

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const transactions = await ctx.db
      .query("transactions")
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
      const categoryTransactions = transactions.filter(
        (t) => t.categoryId === category._id,
      );
      const totalSpent = categoryTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      return {
        category,
        totalSpent,
        expenseCount: categoryTransactions.length,
        budgetLimit: category.budgetLimit || 0,
        budgetUsed: category.budgetLimit
          ? (totalSpent / category.budgetLimit) * 100
          : 0,
      };
    });

    return categorySpending.sort((a, b) => b.totalSpent - a.totalSpent);
  },
});

export const getFinancialSummary = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        totalExpenses: 0,
        totalIncome: 0,
        netBalance: 0,
        savingsRate: 0,
      };

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      savingsRate,
    };
  },
});

export const getEvolution = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const currentTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    const duration = args.endDate - args.startDate;
    const prevStartDate = args.startDate - duration;
    const prevEndDate = args.startDate - 1;

    const prevTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", prevStartDate)
          .lte("date", prevEndDate),
      )
      .collect();

    const currentTotal = currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevTotal = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    let percentageChange = 0;
    if (prevTotal > 0) {
      percentageChange = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
      percentageChange = 100;
    }

    return {
      currentTotal,
      prevTotal,
      percentageChange,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const getDateBoundaries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const first = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("asc")
      .first();

    const last = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!first || !last) return null;

    return {
      minDate: first.date,
      maxDate: last.date,
    };
  },
});
