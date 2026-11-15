import type { Page } from '@playwright/test';
import { NavBar } from '../components/NavBar';

export abstract class BasePage {
  readonly nav: NavBar;
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    this.nav = new NavBar(page);
  }

  protected url(query: Record<string, string> = {}): string {
    const qs = new URLSearchParams(query).toString();
    return qs ? `${this.path}?${qs}` : this.path;
  }

  async open(query: Record<string, string> = {}): Promise<void> {
    await this.page.goto(this.url(query));
  }
}
