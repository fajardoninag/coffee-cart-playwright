import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PromoDialog, type PromoDecision } from '../components/PromoDialog';
import { AddToCartDialog } from '../components/AddToCartDialog';
import { PaymentDialog } from '../components/PaymentDialog';
import { CartPreview } from '../components/CartPreview';
import {
  PROMO_EVERY_NTH_ITEM,
  SLOW_ADD_TIMEOUT_MS,
  SLOW_DISTINCT_THRESHOLD,
  type Product,
} from '../data/products';
import { formatMoney } from '../utils/money';

export class MenuPage extends BasePage {
  protected readonly path = '/';

  readonly promo: PromoDialog;
  readonly addToCartDialog: AddToCartDialog;
  readonly payment: PaymentDialog;
  readonly cartPreview: CartPreview;
  readonly checkoutButton: Locator;

  /** Distinct coffees added through this page object (drives the slow-path timeout). */
  private readonly distinctAdded = new Set<string>();

  constructor(page: Page) {
    super(page);
    this.promo = new PromoDialog(page);
    this.addToCartDialog = new AddToCartDialog(page);
    this.payment = new PaymentDialog(page);
    this.cartPreview = new CartPreview(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  // ---- locators (single source of truth: fix a selector here, every test is fixed) ----

  /**
   * The clickable cup. Uses its aria-label (== coffee name) rather than data-test, because the
   * app builds data-test with name.replace(' ', '_'), which only replaces the FIRST space
   * ("Espresso Con Panna" -> "Espresso_Con Panna").
   */
  card(product: Product | string): Locator {
    return this.page.getByLabel(typeof product === 'string' ? product : product.name, { exact: true });
  }

  /** The <h4> holding the name (and price) above the cup. */
  title(product: Product | string): Locator {
    return this.page.getByRole('listitem').filter({ has: this.card(product) }).getByRole('heading');
  }

  // ---- actions ----
  async open(query: Record<string, string> = {}): Promise<void> {
    await super.open(query);
    await expect(this.card('Espresso')).toBeVisible(); // coffee list has loaded
  }

  /**
   * Adds one item and, when the app is expected to show the promo (every 3rd item), resolves it.
   * The expectation is derived from the UI's own cart badge, so it stays correct even after an
   * accepted promo adds an extra item.
   */
  async addToCart(product: Product, promoDecision: PromoDecision = 'skip'): Promise<void> {
    const before = await this.nav.cartCount();
    this.distinctAdded.add(product.name);

    await this.card(product).click();
    const after = before + 1;

    // Deliberately slow with 7+ distinct coffees: allow more time there, never sleep.
    const slowPath = this.distinctAdded.size >= SLOW_DISTINCT_THRESHOLD - 1;
    await this.nav.expectCartCount(after, slowPath ? SLOW_ADD_TIMEOUT_MS : undefined);

    if (after % PROMO_EVERY_NTH_ITEM === 0) {
      await this.promo.expectVisible();
      await this.promo.resolve(promoDecision);
    } else {
      await this.promo.expectHidden();
    }
  }

  async addItems(products: readonly Product[], promoDecision: PromoDecision = 'skip'): Promise<void> {
    for (const product of products) {
      await this.addToCart(product, promoDecision);
    }
  }

  /** Right-click the coffee to open the add-to-cart dialog. */
  async openAddToCartDialogViaContextMenu(product: Product): Promise<AddToCartDialog> {
    await this.card(product).click({ button: 'right' });
    await this.addToCartDialog.expectOpenFor(product.name);
    return this.addToCartDialog;
  }

  /** Double-click the coffee title to toggle its Chinese translation. */
  async translateTitle(product: Product): Promise<void> {
    await this.title(product).dblclick();
  }

  async checkout(): Promise<PaymentDialog> {
    await this.checkoutButton.click();
    await this.payment.expectOpen();
    return this.payment;
  }

  async expectTotal(amount: number): Promise<void> {
    await expect(this.checkoutButton).toHaveText(`Total: ${formatMoney(amount)}`);
  }
}
