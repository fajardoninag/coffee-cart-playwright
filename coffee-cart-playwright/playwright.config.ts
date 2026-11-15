import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // every test owns its state (fresh browser context), so this is safe
  forbidOnly: isCI,    // fail CI if someone leaves test.only behind
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // The only timeouts in the project. No sleeps anywhere else.
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: process.env.BASE_URL ?? 'https://coffee-cart.app',
    // The app marks elements with data-test="..." instead of data-testid.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, grep: /@smoke/ },
  ],
});
