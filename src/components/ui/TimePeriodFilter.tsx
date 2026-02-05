import { TimePeriod } from "../../types/expense";

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "6months", label: "Last 6 Months" },
  { value: "yearly", label: "This Year" },
  { value: "all", label: "All Time" },
];

export function TimePeriodFilter({ selectedPeriod, onPeriodChange }: TimePeriodFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Time Period</h3>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === period.value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
