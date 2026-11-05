import { test, expect } from '@playwright/test';

test('category catalog contains seeded categories', async ({ request }) => {
  const response = await request.get('/api/category');
  expect(response.status()).toBe(200);
  const categories = await response.json();
  expect(Array.isArray(categories)).toBe(true);
  expect(categories.map((category: { name: string }) => category.name)).toContain('Electronics');
  expect(categories.map((category: { name: string }) => category.name)).toContain('Books');
});

test('category details match the catalog', async ({ request }) => {
  const categories = await (await request.get('/api/category')).json();
  const selected = categories[0];
  const response = await request.get(`/api/category/${selected.id}`);
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(expect.objectContaining({ id: selected.id, name: selected.name }));
});

test('unknown category returns 404', async ({ request }) => {
  expect((await request.get('/api/category/2147483647')).status()).toBe(404);
});

test('anonymous users cannot create a category', async ({ request }) => {
  expect((await request.post('/api/category', { data: {} })).status()).toBe(401);
});
