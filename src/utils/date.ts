import { TimePeriod } from "../types/expense";

/**
 * Returns the start and end timestamps for a given time period
 */
export const getDateRange = (
  period: TimePeriod,
  referenceDate: number = Date.now(),
) => {
  const now = new Date(referenceDate);
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
      return {
        startDate: 0,
        endDate: now.getTime() + 86400000, // Include tomorrow for safety
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
 * Get the next/previous date based on the period
 */
export const getNextPeriodDate = (period: TimePeriod, currentDate: number) => {
  const date = new Date(currentDate);
  switch (period) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }
  return date.getTime();
};

export const getPrevPeriodDate = (period: TimePeriod, currentDate: number) => {
  const date = new Date(currentDate);
  switch (period) {
    case "daily":
      date.setDate(date.getDate() - 1);
      break;
    case "weekly":
      date.setDate(date.getDate() - 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() - 1);
      break;
    case "3months":
      date.setMonth(date.getMonth() - 3);
      break;
    case "6months":
      date.setMonth(date.getMonth() - 6);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      break;
  }
  return date.getTime();
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
