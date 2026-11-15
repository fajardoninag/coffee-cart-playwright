import { test, expect } from '../../src/fixtures';
import { PRODUCTS, PROMO_COFFEE, PROMO_EVERY_NTH_ITEM } from '../../src/data/products';

// Special feature: a promo coffee pop-up appears when adding every 3rd item (3, 6, 9...).
test.describe('Promo pop-up on every 3rd item', () => {
  test('does not appear for the 1st and 2nd item', async ({ menuPage }) => {
    await menuPage.card(PRODUCTS.espresso).click();
    await menuPage.nav.expectCartCount(1);
    await menuPage.promo.expectHidden();

    await menuPage.card(PRODUCTS.mocha).click();
    await menuPage.nav.expectCartCount(2);
    await menuPage.promo.expectHidden();
  });

  test('appears on the 3rd item and can be skipped', async ({ menuPage, seedCart }) => {
    await seedCart([PRODUCTS.espresso, PRODUCTS.mocha]);

    await menuPage.card(PRODUCTS.americano).click();
    await menuPage.promo.expectVisible();
    await menuPage.promo.resolve('skip');

    await menuPage.nav.expectCartCount(3); // skipped: nothing extra added
  });

  test('offers the discounted coffee, and accepting adds it to the cart', async ({
    menuPage,
    cartPage,
    seedCart,
  }) => {
    await seedCart([PRODUCTS.espresso, PRODUCTS.mocha]);

    await menuPage.card(PRODUCTS.americano).click();
    await menuPage.promo.expectVisible();
    await expect(menuPage.promo.message).toContainText(`$${PROMO_COFFEE.price}`);
    await menuPage.promo.resolve('accept');

    await menuPage.nav.expectCartCount(4);
    await menuPage.expectTotal(10 + 8 + 7 + PROMO_COFFEE.price);

    await menuPage.nav.goToCart();
    await cartPage.expectItem(PROMO_COFFEE.name, 1);
  });

  test('keeps appearing on every 3rd item (3, 6, 9)', async ({ menuPage }) => {
    const coffee = PRODUCTS.americano;

    for (let n = 1; n <= PROMO_EVERY_NTH_ITEM * 3; n++) {
      await menuPage.card(coffee).click();
      await menuPage.nav.expectCartCount(n);

      if (n % PROMO_EVERY_NTH_ITEM === 0) {
        await menuPage.promo.expectVisible();
        await menuPage.promo.resolve('skip');
      } else {
        await menuPage.promo.expectHidden();
      }
    }
  });
});
