import { expect, type Locator, type Page } from '@playwright/test';

export type PromoDecision = 'accept' | 'skip';

/** The "It's your lucky day!" pop-up shown on every 3rd item. */
export class PromoDialog {
  readonly message: Locator;
  private readonly acceptButton: Locator;
  private readonly skipButton: Locator;

  constructor(page: Page) {
    this.message = page.getByText(/lucky day/i);
    this.acceptButton = page.getByRole('button', { name: /yes, of course/i });
    this.skipButton = page.getByRole('button', { name: /skip/i });
  }

  async expectVisible(): Promise<void> {
    await expect(this.message).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.message).toBeHidden();
  }

  /** Offered text, so tests can assert on it without hardcoding the (random) coffee. */
  async offerText(): Promise<string> {
    return (await this.message.textContent()) ?? '';
  }

  async resolve(decision: PromoDecision): Promise<void> {
    await (decision === 'accept' ? this.acceptButton : this.skipButton).click();
    await this.expectHidden();
  }
}
