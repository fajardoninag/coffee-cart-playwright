import { test } from '../../src/fixtures';
import { PRODUCTS } from '../../src/data/products';

// Special feature: right-click on a coffee opens an add-to-cart dialog.
test.describe('Right-click add-to-cart dialog', () => {
  test('confirming adds the coffee to the cart', async ({ menuPage }) => {
    const dialog = await menuPage.openAddToCartDialogViaContextMenu(PRODUCTS.cappuccino);
    await dialog.confirm();

    await menuPage.nav.expectCartCount(1);
    await menuPage.expectTotal(PRODUCTS.cappuccino.price);
  });

  test('declining keeps the cart empty', async ({ menuPage }) => {
    const dialog = await menuPage.openAddToCartDialogViaContextMenu(PRODUCTS.cappuccino);
    await dialog.decline();

    await menuPage.nav.expectCartCount(0);
    await menuPage.expectTotal(0);
  });

  test('the dialog names the coffee that was right-clicked', async ({ menuPage }) => {
    await menuPage.openAddToCartDialogViaContextMenu(PRODUCTS.espressoConPanna);
  });
});
