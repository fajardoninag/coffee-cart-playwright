# Coffee Cart: Playwright UI Automation Framework

Playwright + TypeScript framework for <https://coffee-cart.app/> (source: [jecfish/coffee-cart](https://github.com/jecfish/coffee-cart)).
Designed so junior engineers can add tests without touching selectors or timing logic.

## Quick start
```bash
npm ci
npx playwright install --with-deps chromium
npm test                 # all tests, all browsers
npm run test:smoke       # fast @smoke subset
npm run test:ui          # Playwright UI mode (best for debugging)
npm run typecheck
```
Point at another environment with `BASE_URL=http://localhost:5173 npm test` (see `.env.example`).
To run against your own copy: clone `jecfish/coffee-cart`, `npm install && npm run dev`, then use the URL above.

## Architecture
```
src/
  data/        Pure data: products (price, Chinese name), promo offer, customer builder. No Playwright.
  components/  Reusable UI pieces: NavBar, PromoDialog, PaymentDialog, AddToCartDialog, CartPreview
  pages/       Page objects (MenuPage, CartPage). The ONLY place locators live.
  fixtures/    Playwright fixtures: menuPage, cartPage, customer, seedCart, auto error capture
  utils/       Small pure helpers (money formatting)
tests/
  e2e/         Core flow: add -> promo -> checkout -> pay -> success, cart page, validation
  features/    Special features: promo every 3rd item, double-click translate, right-click dialog,
               hover cart preview, ?ad=1 / ?breakable=1 / slow-cart modes
```

## Contribution rules (enforced in code review)
1. **No `waitForTimeout` / `sleep`.** Use web-first assertions (`await expect(locator).toBeVisible()`); Playwright auto-waits.
2. **Locators live in page objects/components only.** Specs read like user stories.
3. **Prefer** `getByRole` > `getByLabel` > `getByTestId` (`data-test`). CSS only when the app offers nothing else (documented in `CartPreview`).
4. **Assertions go in specs or `expectX()` methods**, never silently inside action methods. The one documented exception is the promo handling in `MenuPage.addToCart`, because the promo is part of the flow.
5. **Test data goes in `src/data`.** Use `buildCustomer({...overrides})`; never hardcode emails, prices or translations in specs.
6. **Tests must be independent.** Every test gets a fresh browser context; use fixtures (`seedCart`) for set-up, never depend on another test.
7. **Never `page.goto('/cart')` after adding items.** The cart is in memory; a reload empties it. Use `menuPage.nav.goToCart()`.

## Things learned from the app's source (worth knowing before you write tests)
- `data-test` on cups is built with `name.replace(' ', '_')`, which only replaces the first space (`Espresso Con Panna` -> `Espresso_Con Panna`). Cups are therefore located by `aria-label`, not `data-test`.
- The promo is shown when the cart badge count is a multiple of 3 **after clicking a coffee**. The promo coffee is always `(Discounted) Mocha` at $4 (the README says "random"; the code is not).
- Adding through the right-click dialog does **not** run the promo check, so the 3rd item added that way shows no promo. This looks like a product bug rather than intended behaviour, so it is not asserted.
- The deliberate slow-down comes from having 7+ *distinct* coffees in the cart (heavy loop in the cart getter), not from item count. `MenuPage` allows a longer wait on that path instead of sleeping.
- `?breakable=1` logs a `console.error` ("Some additional workflow is broken.") rather than throwing; the item is still added.

## Adding a test
```ts
import { test } from '../../src/fixtures';
import { PRODUCTS } from '../../src/data/products';

test('buy a latte', async ({ menuPage, customer }) => {
  await menuPage.addToCart(PRODUCTS.cafeLatte);
  const payment = await menuPage.checkout();
  await payment.pay(customer);
  await payment.expectSuccess();
});
```

## CI
`.github/workflows/playwright.yml` runs a Chromium/Firefox/WebKit matrix on push, PR, nightly and manual dispatch. It type-checks, runs with 2 retries, and uploads the HTML report and traces as artifacts.
