import { expect, type Locator, type Page } from '@playwright/test';

/** Top navigation. Links expose aria-labels "Menu page" / "Cart page" / "GitHub page". */
export class NavBar {
  readonly menuLink: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.menuLink = page.getByRole('link', { name: 'Menu page' });
    this.cartLink = page.getByRole('link', { name: 'Cart page' });
  }

  /** Reads the "(n)" badge. The web-first assertion auto-waits for it to render. */
  async cartCount(): Promise<number> {
    await expect(this.cartLink).toHaveText(/\(\d+\)/);
    const text = (await this.cartLink.textContent()) ?? '';
    return Number(/\((\d+)\)/.exec(text)?.[1] ?? 0);
  }

  async expectCartCount(count: number, timeout?: number): Promise<void> {
    await expect(this.cartLink).toHaveText(`cart (${count})`, { timeout });
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/\/cart$/);
  }

  async goToMenu(): Promise<void> {
    await this.menuLink.click();
    await expect(this.page).toHaveURL(/\/$/);
  }
}
