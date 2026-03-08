import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: "Food", color: "#ef4444", type: "expense" as const },
  { name: "Transportation", color: "#3b82f6", type: "expense" as const },
  { name: "Shopping", color: "#8b5cf6", type: "expense" as const },
  { name: "Bills", color: "#f59e0b", type: "expense" as const },
  { name: "Entertainment", color: "#10b981", type: "expense" as const },
  { name: "Healthcare", color: "#ec4899", type: "expense" as const },
  { name: "Other Expenses", color: "#6b7280", type: "expense" as const },
  // Income Categories
  { name: "Salary", color: "#22c55e", type: "income" as const },
  { name: "Business / Freelance", color: "#10b981", type: "income" as const },
  { name: "Investment", color: "#3b82f6", type: "income" as const },
  { name: "Refunds", color: "#ec4899", type: "income" as const },
  { name: "Other Income", color: "#6b7280", type: "income" as const },
];

export const initializeDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has categories
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingCategories) return;

    // Create default categories
    for (const category of DEFAULT_CATEGORIES) {
      await ctx.db.insert("categories", {
        name: category.name,
        color: category.color,
        type: category.type,
        isDefault: true,
        userId,
      });
    }
  },
});

export const listCategories = query({
  args: {
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db.query("categories");

    if (args.type) {
      return await q
        .withIndex("by_user_and_type", (query) =>
          query.eq("userId", userId).eq("type", args.type!),
        )
        .collect();
    }

    return await q
      .withIndex("by_user", (query) => query.eq("userId", userId))
      .collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    color: v.optional(v.string()),
    budgetLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("categories", {
      name: args.name,
      type: args.type,
      color: args.color || "#6b7280",
      budgetLimit: args.budgetLimit,
      isDefault: false,
      userId,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    budgetLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.color && { color: args.color }),
      ...(args.budgetLimit !== undefined && { budgetLimit: args.budgetLimit }),
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    // Check if category has transactions
    const hasTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_category", (q) =>
        q.eq("userId", userId).eq("categoryId", args.id),
      )
      .first();

    if (hasTransactions) {
      throw new Error("Cannot delete category with existing transactions");
    }

    await ctx.db.delete(args.id);
  },
});
