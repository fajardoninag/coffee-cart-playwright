import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { formatMoney } from '../utils/money';

/**
 * NOTE: the cart lives in memory only. A full page load (page.goto('/cart')) empties it,
 * so reach this page via `menuPage.nav.goToCart()`, never by URL.
 */
export class CartPage extends BasePage {
  protected readonly path = '/cart';

  /** The items table: the only list with an "Item / Unit / Total" header row. */
  private get table(): Locator {
    return this.page.getByRole('list').filter({ has: this.page.getByText('Unit', { exact: true }) });
  }

  private row(name: string): Locator {
    return this.table
      .getByRole('listitem')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async expectEmpty(): Promise<void> {
    await expect(this.page.getByText('No coffee, go add some.')).toBeVisible();
  }

  async expectItem(name: string, quantity: number): Promise<void> {
    await expect(this.row(name)).toContainText(new RegExp(`x ${quantity}\\b`));
  }

  async increase(name: string): Promise<void> {
    await this.row(name).getByRole('button', { name: `Add one ${name}`, exact: true }).click();
  }

  async decrease(name: string): Promise<void> {
    await this.row(name).getByRole('button', { name: `Remove one ${name}`, exact: true }).click();
  }

  async remove(name: string): Promise<void> {
    await this.row(name).getByRole('button', { name: `Remove all ${name}`, exact: true }).click();
  }

  async expectTotal(amount: number): Promise<void> {
    await expect(this.page.getByTestId('checkout')).toHaveText(`Total: ${formatMoney(amount)}`);
  }
}
