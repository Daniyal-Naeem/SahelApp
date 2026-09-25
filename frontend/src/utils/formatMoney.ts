/**
 * Round money to 2 decimal places for display and totals.
 */
export const roundMoney = (value: number | string | null | undefined): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

/** e.g. 22.56 — always two digits after the point */
export const formatMoney = (value: number | string | null | undefined): string => {
  return roundMoney(value).toFixed(2);
};

/** Group thousands: 1,234.56 */
export const formatMoneyGrouped = (
  value: number | string | null | undefined,
): string => {
  const fixed = formatMoney(value);
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${grouped}.${frac}`;
};

export default formatMoney;
