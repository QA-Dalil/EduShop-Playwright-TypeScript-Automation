import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../support/auth';

test('customer cannot open admin dashboard', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/$/);
});

test('admin can open dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[formControlName="email"]').fill('admin@test.com');
  await page.locator('input[formControlName="password"]').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator('app-admin-dashboard')).toBeVisible();
});
