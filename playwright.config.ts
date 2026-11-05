import { defineConfig, devices } from '@playwright/test';

const uiBaseURL = process.env.EDUSHOP_UI_URL ?? 'http://localhost:4200';
const apiBaseURL = process.env.EDUSHOP_API_URL ?? 'http://localhost:5000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'api', testMatch: /api\/.*\.spec\.ts/, use: { baseURL: apiBaseURL } },
    { name: 'chromium', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: uiBaseURL } }
  ]
});
