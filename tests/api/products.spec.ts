import { test, expect } from '@playwright/test';

test('products endpoint returns a paginated catalog', async ({ request }) => {
  const response = await request.get('/api/product', { params: { page: 1, pageSize: 5 } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items.length).toBeGreaterThan(0);
  expect(body.items.length).toBeLessThanOrEqual(5);
  expect(body.totalCount).toBeGreaterThan(0);
  expect(body.page).toBe(1);
  expect(body.items[0]).toEqual(expect.objectContaining({
    id: expect.any(Number),
    name: expect.any(String),
    price: expect.any(Number)
  }));
});

test('unknown product returns 404', async ({ request }) => {
  const response = await request.get('/api/product/2147483647');
  expect(response.status()).toBe(404);
  expect((await response.json()).message).toBe('Product not found.');
});

test('product creation requires admin authorization', async ({ request }) => {
  const response = await request.post('/api/product', { data: {} });
  expect(response.status()).toBe(401);
});

test('product detail matches its catalog entry', async ({ request }) => {
  const list = await (await request.get('/api/product')).json();
  const item = list.items[0];
  const response = await request.get(`/api/product/${item.id}`);
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(expect.objectContaining({ id: item.id, name: item.name }));
});

test('search finds a seeded laptop', async ({ request }) => {
  const response = await request.get('/api/product', { params: { searchTerm: 'Laptop' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.items.length).toBeGreaterThan(0);
  expect(body.items.every((item: { name: string; description: string }) =>
    `${item.name} ${item.description}`.toLowerCase().includes('laptop'))).toBe(true);
});

test('unmatched search returns an empty page', async ({ request }) => {
  const response = await request.get('/api/product', { params: { searchTerm: 'zzzx-no-such-product-9834' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.items).toHaveLength(0);
  expect(body.totalCount).toBe(0);
});

test('page size limits returned products', async ({ request }) => {
  const response = await request.get('/api/product', { params: { page: 1, pageSize: 3 } });
  expect(response.status()).toBe(200);
  expect((await response.json()).items).toHaveLength(3);
});

test('second page contains different products', async ({ request }) => {
  const first = await (await request.get('/api/product', { params: { page: 1, pageSize: 3 } })).json();
  const second = await (await request.get('/api/product', { params: { page: 2, pageSize: 3 } })).json();
  expect(second.page).toBe(2);
  expect(second.items.map((item: { id: number }) => item.id)).not.toEqual(first.items.map((item: { id: number }) => item.id));
});

test('price filter keeps products in range', async ({ request }) => {
  const response = await request.get('/api/product', { params: { minPrice: 50, maxPrice: 150 } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.items.length).toBeGreaterThan(0);
  expect(body.items.every((item: { price: number }) => item.price >= 50 && item.price <= 150)).toBe(true);
});

test('customer cannot delete a product', async ({ request }) => {
  const response = await request.delete('/api/product/1');
  expect(response.status()).toBe(401);
});
