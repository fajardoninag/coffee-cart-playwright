import { test } from '../../src/fixtures';
import { PRODUCTS } from '../../src/data/products';

// Special feature [desktop only]: hovering the Pay button shows a quick cart preview.
test.describe('Hover cart preview', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'The hover preview is desktop only');
  });

  test('shows the cart contents and lets you add or remove items', async ({ menuPage }) => {
    const { espresso } = PRODUCTS;
    await menuPage.addToCart(espresso);

    await menuPage.cartPreview.open();
    await menuPage.cartPreview.expectItem(espresso.name, 1);

    await menuPage.cartPreview.increase(espresso.name);
    await menuPage.cartPreview.expectItem(espresso.name, 2);
    await menuPage.expectTotal(espresso.price * 2);
    await menuPage.nav.expectCartCount(2);

    await menuPage.cartPreview.decrease(espresso.name);
    await menuPage.cartPreview.expectItem(espresso.name, 1);
    await menuPage.expectTotal(espresso.price);
  });
});
