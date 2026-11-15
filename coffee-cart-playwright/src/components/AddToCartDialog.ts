import { expect, type Locator, type Page } from '@playwright/test';

/** The native <dialog> opened by right-clicking a coffee ("Add <name> to the cart?"). */
export class AddToCartDialog {
  readonly root: Locator;
  private readonly yes: Locator;
  private readonly no: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
    this.yes = this.root.getByRole('button', { name: 'Yes', exact: true });
    this.no = this.root.getByRole('button', { name: 'No', exact: true });
  }

  async expectOpenFor(productName: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(`Add ${productName} to the cart?`);
  }

  async confirm(): Promise<void> {
    await this.yes.click();
    await expect(this.root).toBeHidden();
  }

  async decline(): Promise<void> {
    await this.no.click();
    await expect(this.root).toBeHidden();
  }
}
