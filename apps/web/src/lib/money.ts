const formatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/** API amounts are integer kopecks. */
export function formatMoney(kopecks: number): string {
  return formatter.format(kopecks / 100);
}
