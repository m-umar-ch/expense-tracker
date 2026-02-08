import { TimePeriod } from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "weekly", label: "WEEK" },
  { value: "monthly", label: "MONTH" },
  { value: "3months", label: "3M" },
  { value: "6months", label: "6M" },
  { value: "yearly", label: "YEAR" },
  { value: "all", label: "ALL" },
];

export function TimePeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodFilterProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <Clock className="w-8 h-8 text-red-500" />
        <h3 className="text-xl font-black uppercase text-red-500">
          TIME FILTER
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {PERIODS.map((period) => (
          <Button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`font-black uppercase tracking-wide px-6 py-3 border-4 transition-all ${
              selectedPeriod === period.value
                ? "bg-red-500 text-black border-black hover:bg-red-600"
                : "bg-black text-red-500 border-red-500 hover:bg-red-500 hover:text-black hover:border-black"
            }`}
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
