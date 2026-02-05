import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    budgetLimit: v.optional(v.number()),
    isDefault: v.boolean(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  expenses: defineTable({
    name: v.string(),
    categoryId: v.id("categories"),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_category", ["userId", "categoryId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
