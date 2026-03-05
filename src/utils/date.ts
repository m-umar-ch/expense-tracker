import { TimePeriod } from "../types/expense";

/**
 * Returns the start and end timestamps for a given time period
 */
export const getDateRange = (period: TimePeriod) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "weekly":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return {
        startDate: weekStart.getTime(),
        endDate: weekEnd.getTime(),
      };
    case "monthly":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return {
        startDate: monthStart.getTime(),
        endDate: monthEnd.getTime(),
      };
    case "3months":
      const threeMonthsStart = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1,
      );
      const threeMonthsEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return {
        startDate: threeMonthsStart.getTime(),
        endDate: threeMonthsEnd.getTime(),
      };
    case "6months":
      const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const sixMonthsEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return {
        startDate: sixMonthsStart.getTime(),
        endDate: sixMonthsEnd.getTime(),
      };
    case "yearly":
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        startDate: yearStart.getTime(),
        endDate: yearEnd.getTime(),
      };
    case "all":
      const allEnd = new Date(today);
      allEnd.setDate(today.getDate() + 1);
      allEnd.setHours(23, 59, 59, 999);
      return {
        startDate: 0,
        endDate: allEnd.getTime(),
      };
    default:
      const dailyStart = new Date(today);
      dailyStart.setHours(0, 0, 0, 0);
      const dailyEnd = new Date(today);
      dailyEnd.setHours(23, 59, 59, 999);
      return {
        startDate: dailyStart.getTime(),
        endDate: dailyEnd.getTime(),
      };
  }
};

/**
 * Calculates effective days count for a given period
 */
export const getEffectiveDaysCount = (
  period: TimePeriod,
  startDate: number,
  endDate: number,
  hasExpensesOrIncomes: boolean,
  minDate?: number,
) => {
  if (period === "all") {
    if (hasExpensesOrIncomes && minDate) {
      return Math.max(
        1,
        Math.round((Date.now() - minDate) / (1000 * 60 * 60 * 24)),
      );
    }
    return 30; // default if no data
  }
  return Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
};
