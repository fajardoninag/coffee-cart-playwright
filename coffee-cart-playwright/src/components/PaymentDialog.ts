import { expect, type Locator, type Page } from '@playwright/test';
import type { Customer } from '../data/customers';

/** The "Payment details" modal. Its form is exposed as role=form, name "Payment form". */
export class PaymentDialog {
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly promoCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.form = page.getByRole('form', { name: 'Payment form' });
    this.nameInput = this.form.getByLabel('Name', { exact: true });
    this.emailInput = this.form.getByLabel('Email', { exact: true });
    this.promoCheckbox = this.form.getByRole('checkbox', { name: 'Promotion checkbox' });
    this.submitButton = this.form.getByRole('button', { name: 'Submit' });
    // Snackbar shown after a successful purchase (auto-hides after ~3.6s; the assertion polls).
    this.successMessage = page.getByText('Thanks for your purchase. Please check your email for payment.');
  }

  async expectOpen(): Promise<void> {
    await expect(this.form).toBeVisible();
  }

  async fill(customer: Customer): Promise<void> {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.promoCheckbox.setChecked(customer.subscribeToPromotions);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async pay(customer: Customer): Promise<void> {
    await this.expectOpen();
    await this.fill(customer);
    await this.submit();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  /** Uses the browser's own HTML5 validity state, not a hardcoded message string. */
  async expectFieldRequired(field: 'name' | 'email'): Promise<void> {
    const input = field === 'name' ? this.nameInput : this.emailInput;
    await expect
      .poll(() => input.evaluate((el) => (el as HTMLInputElement).validity.valueMissing))
      .toBe(true);
  }
}
