import { expect, type Page } from '@playwright/test';
import { customer } from './data';

export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formControlName="email"]').fill(customer.email);
  await page.locator('input[formControlName="password"]').fill(customer.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Welcome to EduShop' })).toBeVisible();
}
