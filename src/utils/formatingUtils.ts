// Format currency function
export function formatCurrency(
  amount: number,
  locale = "en-US",
  currency = "USD",
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  // Format the amount
  return formatter.format(amount);
}

// Format units function
export function formatDecimals(
  amount: number,
  locale = "en-US",
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
  });

  // Format the amount
  return formatter.format(amount);
}
