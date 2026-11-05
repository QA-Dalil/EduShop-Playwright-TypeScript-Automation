import { expect, type APIRequestContext } from '@playwright/test';
import { customer } from './data';

export async function customerHeaders(request: APIRequestContext): Promise<{ Authorization: string }> {
  const response = await request.post('/api/auth/login', { data: customer });
  expect(response.status()).toBe(200);
  const body = await response.json();
  return { Authorization: `Bearer ${body.accessToken as string}` };
}

export async function clearCart(request: APIRequestContext, headers: { Authorization: string }): Promise<void> {
  const response = await request.delete('/api/cart', { headers });
  expect(response.status()).toBe(200);
}

export async function firstProduct(request: APIRequestContext): Promise<{ id: number; name: string }> {
  const response = await request.get('/api/product', { params: { pageSize: 30 } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  const item = body.items.find((product: { stock: number }) => product.stock > 0);
  if (!item) throw new Error('EduShop has no in-stock seeded products');
  return item;
}
