import { test, expect } from '../../src/fixtures';
import { ALL_PRODUCTS, PRODUCTS } from '../../src/data/products';
import { buildCustomer } from '../../src/data/customers';
import { sumPrices } from '../../src/utils/money';

test.describe('Checkout flow', () => {
  test('add product -> checkout -> pay -> success @smoke', async ({ menuPage, customer }) => {
    const items = [PRODUCTS.espresso];

    await menuPage.addToCart(PRODUCTS.espresso);
    await menuPage.expectTotal(sumPrices(items));

    const payment = await menuPage.checkout();
    await payment.pay(customer);

    await payment.expectSuccess();
    // A completed order empties the cart.
    await menuPage.nav.expectCartCount(0);
    await menuPage.expectTotal(0);
  });

  test('promo pop-up is handled mid-flow (3rd item) and checkout still succeeds', async ({
    menuPage,
    customer,
  }) => {
    // The 3rd add triggers the promo; addItems resolves it (skip) so the flow continues.
    const items = [PRODUCTS.espresso, PRODUCTS.cappuccino, PRODUCTS.americano];
    await menuPage.addItems(items, 'skip');
    await menuPage.expectTotal(sumPrices(items));

    const payment = await menuPage.checkout();
    await payment.pay({ ...customer, subscribeToPromotions: true });

    await payment.expectSuccess();
    await menuPage.nav.expectCartCount(0);
  });

  test('can pay for a cart that includes the accepted promo coffee', async ({ menuPage, customer }) => {
    await menuPage.addItems([PRODUCTS.espresso, PRODUCTS.mocha, PRODUCTS.americano], 'accept');

    const payment = await menuPage.checkout();
    await payment.pay(customer);

    await payment.expectSuccess();
  });

  test('cart page reflects the items that were added', async ({ menuPage, cartPage }) => {
    await menuPage.addToCart(PRODUCTS.mocha);
    await menuPage.addToCart(PRODUCTS.mocha);
    await menuPage.nav.goToCart();

    await cartPage.expectItem(PRODUCTS.mocha.name, 2);
    await cartPage.expectTotal(PRODUCTS.mocha.price * 2);
  });

  test('cart page: increase, decrease and remove an item', async ({ menuPage, cartPage }) => {
    const { mocha } = PRODUCTS;
    await menuPage.addToCart(mocha);
    await menuPage.nav.goToCart();

    await cartPage.increase(mocha.name);
    await cartPage.expectItem(mocha.name, 2);
    await cartPage.expectTotal(mocha.price * 2);

    await cartPage.decrease(mocha.name);
    await cartPage.expectItem(mocha.name, 1);
    await cartPage.expectTotal(mocha.price);

    await cartPage.remove(mocha.name);
    await cartPage.expectEmpty();
  });

  test('empty cart shows the empty state', async ({ menuPage, cartPage }) => {
    await menuPage.nav.goToCart();
    await cartPage.expectEmpty();
  });

  test('menu lists all nine coffees with their prices', async ({ menuPage }) => {
    for (const product of ALL_PRODUCTS) {
      await expect(menuPage.card(product)).toBeVisible();
      await expect(menuPage.title(product)).toContainText(`$${product.price.toFixed(2)}`);
    }
  });
});

test.describe('Payment form validation', () => {
  test('name is required', async ({ menuPage }) => {
    await menuPage.addToCart(PRODUCTS.espresso);
    const payment = await menuPage.checkout();

    await payment.fill(buildCustomer({ name: '' }));
    await payment.submit();

    await payment.expectFieldRequired('name');
    await expect(payment.successMessage).toBeHidden();
  });

  test('email is required', async ({ menuPage }) => {
    await menuPage.addToCart(PRODUCTS.espresso);
    const payment = await menuPage.checkout();

    await payment.fill(buildCustomer({ email: '' }));
    await payment.submit();

    await payment.expectFieldRequired('email');
    await expect(payment.successMessage).toBeHidden();
  });
});
