import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/bugs',
  workers: 1,
  timeout: 30_000,
  reporter: [['list'], ['html', { outputFolder: 'bug-report', open: 'never' }]],
  use: {
    baseURL: process.env.EDUSHOP_API_URL ?? 'http://localhost:5000',
    trace: 'retain-on-failure'
  }
});
