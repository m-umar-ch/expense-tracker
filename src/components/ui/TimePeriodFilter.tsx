import { TimePeriod } from "../../types/expense";
import { Button } from "@/components/ui/button";

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  // { value: "daily", label: "Daily" },
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
  { value: "3months", label: "3M" },
  { value: "6months", label: "6M" },
  { value: "yearly", label: "Year" },
  { value: "all", label: "All" },
];

export function TimePeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border/50">
      {PERIODS.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 h-8 text-xs font-semibold rounded-md transition-shadow ${
            selectedPeriod === period.value
              ? "bg-background shadow-sm text-foreground hover:bg-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
