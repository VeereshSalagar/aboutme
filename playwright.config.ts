import { defineConfig, devices } from '@playwright/test';

declare const process: {
  env: {
    CI?: string;
    BASE_URL?: string;
  };
};

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
  ['html'],
  ['json', { outputFile: 'test-results.json' }],
  ['./reporters/playwright-backend-reporter.ts']
],

  use: {
    baseURL:
  process.env.BASE_URL ||
  'http://127.0.0.1:3001',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});