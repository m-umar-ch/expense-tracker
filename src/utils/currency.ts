/**
 * Format currency in Pakistani Rupee format: Rs. 72,000/-
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return "Rs. 0/-";
  
  const formatted = amount.toLocaleString('en-PK');
  return `Rs. ${formatted}/-`;
}

/**
 * Format currency for compact display (without /-)
 */
export function formatCurrencyCompact(amount: number): string {
  const formatted = amount.toLocaleString('en-PK');
  return `Rs. ${formatted}`;
}