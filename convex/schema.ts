import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  categories: defineTable({
    name: v.string(),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))), // Categorize by type (optional for migration)
    color: v.optional(v.string()),
    budgetLimit: v.optional(v.number()),
    isDefault: v.boolean(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  transactions: defineTable({
    name: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    categoryId: v.id("categories"),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_user_and_category", ["userId", "categoryId"]),
});
