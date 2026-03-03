import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listIncomes = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("incomes")
      .withIndex("by_user_and_date", (q) => {
        if (args.startDate && args.endDate) {
          return q
            .eq("userId", userId)
            .gte("date", args.startDate)
            .lte("date", args.endDate);
        }
        return q.eq("userId", userId);
      })
      .order("desc");

    return await query.collect();
  },
});

export const createIncome = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("incomes", {
      name: args.name,
      amount: args.amount,
      date: args.date,
      notes: args.notes,
      userId,
    });
  },
});

export const updateIncome = mutation({
  args: {
    id: v.id("incomes"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const income = await ctx.db.get(args.id);
    if (!income || income.userId !== userId) {
      throw new Error("Income not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.amount !== undefined && { amount: args.amount }),
      ...(args.date && { date: args.date }),
      ...(args.notes !== undefined && { notes: args.notes }),
    });
  },
});

export const deleteIncome = mutation({
  args: { id: v.id("incomes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const income = await ctx.db.get(args.id);
    if (!income || income.userId !== userId) {
      throw new Error("Income not found");
    }

    await ctx.db.delete(args.id);
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

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    const incomes = await ctx.db
      .query("incomes")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
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

    const currentExpenses = await ctx.db
      .query("expenses")
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

    const prevExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", prevStartDate)
          .lte("date", prevEndDate),
      )
      .collect();

    const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

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
