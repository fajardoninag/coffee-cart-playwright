import { test as base, expect } from '@playwright/test';
import { MenuPage } from '../pages/MenuPage';
import { CartPage } from '../pages/CartPage';
import { buildCustomer, type Customer } from '../data/customers';
import type { Product } from '../data/products';
import type { PromoDecision } from '../components/PromoDialog';

type Fixtures = {
  /** A MenuPage that is already open and interactive. */
  menuPage: MenuPage;
  cartPage: CartPage;
  /** A fresh, valid customer for every test. */
  customer: Customer;
  /** Factory: await seedCart([a, b, c]) gives a cart in a known state (handles the promo). */
  seedCart: (products: readonly Product[], promo?: PromoDecision) => Promise<void>;
  /** Auto fixture: collects uncaught page errors and attaches them to failing tests. */
  pageErrorCapture: void;
};

export const test = base.extend<Fixtures>({
  menuPage: async ({ page }, use) => {
    const menuPage = new MenuPage(page);
    await menuPage.open();
    await use(menuPage);
    // Teardown: cart state lives in the page and every test gets a fresh browser
    // context, so there is nothing to clean up. Add API/DB cleanup here if that changes.
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  // eslint-disable-next-line no-empty-pattern
  customer: async ({}, use) => {
    await use(buildCustomer());
  },

  seedCart: async ({ menuPage }, use) => {
    await use((products, promo = 'skip') => menuPage.addItems(products, promo));
  },

  pageErrorCapture: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await use();
      if (errors.length && testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('page-errors', { body: errors.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],
});

export { expect };
