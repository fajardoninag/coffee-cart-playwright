/**
 * Product catalogue. Pure data: no Playwright imports, no logic.
 * Values mirror the app's own data (coffees.state / ListPage.vue in jecfish/coffee-cart).
 */
export interface Product {
  readonly name: string;
  readonly price: number;
  /** What the title becomes after a double-click. */
  readonly chineseName: string;
}

export const PRODUCTS = {
  espresso: { name: 'Espresso', price: 10, chineseName: '特浓咖啡' },
  espressoMacchiato: { name: 'Espresso Macchiato', price: 12, chineseName: '浓缩玛奇朵' },
  cappuccino: { name: 'Cappuccino', price: 19, chineseName: '卡布奇诺' },
  mocha: { name: 'Mocha', price: 8, chineseName: '摩卡' },
  flatWhite: { name: 'Flat White', price: 18, chineseName: '平白咖啡' },
  americano: { name: 'Americano', price: 7, chineseName: '美式咖啡' },
  cafeLatte: { name: 'Cafe Latte', price: 16, chineseName: '拿铁' },
  espressoConPanna: { name: 'Espresso Con Panna', price: 14, chineseName: '浓缩康宝蓝' },
  cafeBreve: { name: 'Cafe Breve', price: 15, chineseName: '半拿铁' },
} as const satisfies Record<string, Product>;

export const ALL_PRODUCTS: readonly Product[] = Object.values(PRODUCTS);

/** The promo offer. Not on the menu: it only exists inside the pop-up and the cart. */
export const PROMO_COFFEE = { name: '(Discounted) Mocha', price: 4 } as const;

/** Every 3rd item added to the cart triggers the promo pop-up. */
export const PROMO_EVERY_NTH_ITEM = 3;

/**
 * The app intentionally slows down once the cart holds 7+ DISTINCT coffees
 * (its cartList getter runs a heavy loop per line item).
 */
export const SLOW_DISTINCT_THRESHOLD = 7;
/** Allowed time for the cart badge to update on the slow path. */
export const SLOW_ADD_TIMEOUT_MS = 20_000;
