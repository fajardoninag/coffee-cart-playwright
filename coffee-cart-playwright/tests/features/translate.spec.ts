import { test, expect } from '../../src/fixtures';
import { ALL_PRODUCTS, PRODUCTS } from '../../src/data/products';

// Special feature: double-click on the coffee title translates it to Chinese.
test.describe('Coffee title translation', () => {
  // Data-driven: one generated test per coffee, so a wrong translation names the coffee in the report.
  for (const product of ALL_PRODUCTS) {
    test(`double-clicking "${product.name}" translates it to Chinese`, async ({ menuPage }) => {
      const title = menuPage.title(product);
      await expect(title).toContainText(product.name); // the title block also shows the price

      await menuPage.translateTitle(product);

      await expect(title).toContainText(product.chineseName);
      await expect(title).not.toContainText(product.name);
    });
  }

  test('double-clicking again switches back to English', async ({ menuPage }) => {
    const { cappuccino } = PRODUCTS;
    await menuPage.translateTitle(cappuccino);
    await expect(menuPage.title(cappuccino)).toContainText(cappuccino.chineseName);

    await menuPage.translateTitle(cappuccino);
    await expect(menuPage.title(cappuccino)).toContainText(cappuccino.name);
  });

  test('translating one title leaves the others untouched', async ({ menuPage }) => {
    await menuPage.translateTitle(PRODUCTS.espresso);
    await expect(menuPage.title(PRODUCTS.espresso)).toContainText(PRODUCTS.espresso.chineseName);

    for (const other of ALL_PRODUCTS.filter((p) => p !== PRODUCTS.espresso)) {
      await expect(menuPage.title(other)).toContainText(other.name);
    }
  });

  test('translation keeps the price visible and does not add to the cart', async ({ menuPage }) => {
    await menuPage.translateTitle(PRODUCTS.mocha);
    await expect(menuPage.title(PRODUCTS.mocha)).toContainText('$8.00');
    await menuPage.nav.expectCartCount(0);
  });
});
