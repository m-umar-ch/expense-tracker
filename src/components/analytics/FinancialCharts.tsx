import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  format,
  startOfDay,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
} from "date-fns";
import { Transaction } from "../../types/expense";
import { useSettings } from "../../contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialChartsProps {
  expenses: Transaction[];
  incomes: Transaction[];
  startDate: number;
  endDate: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const { formatCurrency } = useSettings();
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({
  expenses,
  incomes,
  startDate,
  endDate,
}) => {
  const { settings, formatCurrency } = useSettings();
  const blurClass = settings.privacyMode
    ? "blur-[8px] select-none pointer-events-none"
    : "";

  const { chartData, isMonthly } = useMemo(() => {
    if (startDate === undefined || endDate === undefined)
      return { chartData: [], isMonthly: false };

    let effectiveStart = startDate;
    let effectiveEnd = endDate;

    if (startDate === 0) {
      const allDates = [
        ...expenses.map((e) => e.date),
        ...incomes.map((i) => i.date),
      ];
      if (allDates.length > 0) {
        effectiveStart = Math.min(...allDates);
        effectiveEnd = Math.max(...allDates, Date.now());
      } else {
        effectiveStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
        effectiveEnd = Date.now();
      }
    }

    if (effectiveEnd < effectiveStart) {
      effectiveEnd = effectiveStart;
    }

    const durationDays =
      (effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24);
    const groupByMonth = durationDays > 93;

    const expensesByDate = new Map<string, number>();
    const incomeByDate = new Map<string, number>();

    expenses.forEach((e) => {
      const date = new Date(e.date);
      const key = groupByMonth
        ? format(date, "MMM yyyy")
        : format(date, "MMM dd");
      expensesByDate.set(key, (expensesByDate.get(key) || 0) + e.amount);
    });

    incomes.forEach((i) => {
      const date = new Date(i.date);
      const key = groupByMonth
        ? format(date, "MMM yyyy")
        : format(date, "MMM dd");
      incomeByDate.set(key, (incomeByDate.get(key) || 0) + i.amount);
    });

    let intervals: Date[] = [];
    try {
      if (groupByMonth) {
        intervals = eachMonthOfInterval({
          start: new Date(effectiveStart),
          end: new Date(effectiveEnd),
        });
      } else {
        intervals = eachDayOfInterval({
          start: new Date(effectiveStart),
          end: new Date(effectiveEnd),
        });
      }
    } catch (error) {
      return { chartData: [], isMonthly: false };
    }

    const data = intervals.map((date) => {
      const key = groupByMonth
        ? format(date, "MMM yyyy")
        : format(date, "MMM dd");
      const totalExpense = expensesByDate.get(key) || 0;
      const totalIncome = incomeByDate.get(key) || 0;

      return {
        date: key,
        expenses: totalExpense,
        income: totalIncome,
        net: totalIncome - totalExpense,
      };
    });

    return { chartData: data, isMonthly: groupByMonth };
  }, [expenses, incomes, startDate, endDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            {isMonthly ? "Monthly Spending Trend" : "Daily Spending Trend"}
            <span className="text-xs font-normal text-muted-foreground">
              Last {chartData.length} {isMonthly ? "months" : "days"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`h-[300px] w-full ${blurClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="var(--color-destructive)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`h-[300px] w-full ${blurClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-destructive)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-destructive)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="var(--color-destructive)"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
