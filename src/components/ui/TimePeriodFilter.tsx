import { TimePeriod } from "../../types/expense";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Time Period</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((period) => (
            <Button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
