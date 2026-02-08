/**
 * Format currency in US Dollar format: $72,000
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return "$0";

  const formatted = amount.toLocaleString("en-US");
  return `$${formatted}`;
}

/**
 * Format currency for compact display
 */
export function formatCurrencyCompact(amount: number): string {
  const formatted = amount.toLocaleString("en-US");
  return `$${formatted}`;
}
