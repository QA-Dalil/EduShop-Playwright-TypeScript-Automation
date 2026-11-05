import { test, expect } from '@playwright/test';

test('registration shows required field errors', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('First name is required.')).toBeVisible();
  await expect(page.getByText('Last name is required.')).toBeVisible();
  await expect(page.getByText('Valid email is required.')).toBeVisible();
});

test('registration links to sign in', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
