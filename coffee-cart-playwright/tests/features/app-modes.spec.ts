import { test, expect } from '../../src/fixtures';
import { ALL_PRODUCTS, PRODUCTS, SLOW_ADD_TIMEOUT_MS } from '../../src/data/products';
import { sumPrices } from '../../src/utils/money';

// Special app behaviours documented in the app's README.
test.describe('Slow and broken modes', () => {
  test('adding all nine coffees still works despite the intentional slow-down', async ({ menuPage }) => {
    test.slow(); // 7+ distinct coffees make the app deliberately sluggish
    await menuPage.addItems(ALL_PRODUCTS, 'skip');

    await menuPage.nav.expectCartCount(ALL_PRODUCTS.length, SLOW_ADD_TIMEOUT_MS);
    await menuPage.expectTotal(sumPrices(ALL_PRODUCTS));
  });

  test('?ad=1 (slow page load) still lets the user add a coffee', async ({ menuPage }) => {
    test.slow();
    await menuPage.open({ ad: '1' });

    await menuPage.addToCart(PRODUCTS.espresso);
    await menuPage.expectTotal(PRODUCTS.espresso.price);
  });

  test('?breakable=1 logs a console error but the coffee is still added', async ({ page, menuPage }) => {
    await menuPage.open({ breakable: '1' });

    const loggedError = page.waitForEvent('console', {
      predicate: (msg) => msg.type() === 'error' && /workflow is broken/i.test(msg.text()),
    });
    await menuPage.card(PRODUCTS.espresso).click();

    await loggedError;
    await menuPage.nav.expectCartCount(1);
  });
});
