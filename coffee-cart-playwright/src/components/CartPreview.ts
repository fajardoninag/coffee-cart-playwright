import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The quick cart preview shown when hovering the Pay button (desktop only).
 * The app gives this list no role/label/test-id, so the class is the only hook available.
 */
export class CartPreview {
  private readonly root: Locator;
  private readonly trigger: Locator;

  constructor(page: Page) {
    this.root = page.locator('.cart-preview');
    this.trigger = page.getByTestId('checkout');
  }

  async open(): Promise<void> {
    await this.trigger.hover();
    await expect(this.root).toBeVisible();
  }

  private row(name: string): Locator {
    return this.root.getByRole('listitem').filter({ has: this.root.page().getByText(name, { exact: true }) });
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
}
