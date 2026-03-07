import { TimePeriod } from "../../types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "3months", label: "3 Months" },
  { value: "6months", label: "6 Months" },
  { value: "yearly", label: "Yearly" },
  { value: "all", label: "All Time" },
];

export function TimePeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodFilterProps) {
  return (
    <Select
      value={selectedPeriod}
      onValueChange={(value) => onPeriodChange(value as TimePeriod)}
    >
      <SelectTrigger className="w-[140px] h-9">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
