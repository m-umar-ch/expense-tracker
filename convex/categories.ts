import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#ef4444" },
  { name: "Transportation", color: "#3b82f6" },
  { name: "Shopping", color: "#8b5cf6" },
  { name: "Bills & Utilities", color: "#f59e0b" },
  { name: "Entertainment", color: "#10b981" },
  { name: "Healthcare", color: "#ec4899" },
  { name: "Groceries", color: "#06b6d4" },
  { name: "Personal Care", color: "#84cc16" },
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
        isDefault: true,
        userId,
      });
    }
  },
});

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    budgetLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("categories", {
      name: args.name,
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

    // Check if category has expenses
    const hasExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", userId).eq("categoryId", args.id)
      )
      .first();

    if (hasExpenses) {
      throw new Error("Cannot delete category with existing expenses");
    }

    await ctx.db.delete(args.id);
  },
});
