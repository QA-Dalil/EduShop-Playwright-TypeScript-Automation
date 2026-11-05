import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../support/auth';
import { customer } from '../support/data';

test('customer can sign in', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
});

test('incorrect password shows an error', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[formControlName="email"]').fill(customer.email);
  await page.locator('input[formControlName="password"]').fill('incorrect-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('.alert-danger')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('required fields prevent an empty login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Valid email is required.')).toBeVisible();
  await expect(page.getByText('Password is required.')).toBeVisible();
});

test('guest is redirected away from cart', async ({ page }) => {
  await page.goto('/cart');
  await expect(page).toHaveURL(/\/login$/);
});
