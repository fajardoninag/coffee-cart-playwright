/** Formats a number the way the app displays totals: 10 -> "$10.00" */
export const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;

export const sumPrices = (items: readonly { price: number }[]): number =>
  items.reduce((total, item) => total + item.price, 0);
