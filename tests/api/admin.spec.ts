import { test, expect } from '@playwright/test';
import { customerHeaders } from '../support/api';

test('anonymous users cannot read dashboard', async ({ request }) => {
  expect((await request.get('/api/admin/dashboard')).status()).toBe(401);
});

test('customer cannot read admin dashboard', async ({ request }) => {
  const headers = await customerHeaders(request);
  expect((await request.get('/api/admin/dashboard', { headers })).status()).toBe(403);
});

test('admin can read dashboard', async ({ request }) => {
  const login = await request.post('/api/auth/login', {
    data: { email: 'admin@test.com', password: 'Admin123!' }
  });
  expect(login.status()).toBe(200);
  const body = await login.json();
  const dashboard = await request.get('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${body.accessToken as string}` }
  });
  expect(dashboard.status()).toBe(200);
  expect(await dashboard.json()).toEqual(expect.any(Object));
});

test('admin can create and retire a test product', async ({ request }) => {
  const login = await request.post('/api/auth/login', {
    data: { email: 'admin@test.com', password: 'Admin123!' }
  });
  expect(login.status()).toBe(200);
  const token = (await login.json()).accessToken as string;
  const headers = { Authorization: `Bearer ${token}` };
  const categories = await (await request.get('/api/category')).json();
  const created = await request.post('/api/product', {
    headers,
    data: {
      name: `Playwright QA Product ${Date.now()}`,
      description: 'Disposable automation product',
      price: 12.5,
      stock: 3,
      categoryId: categories[0].id,
      discountPercentage: 0
    }
  });
  expect(created.status()).toBe(201);
  const product = await created.json();
  try {
    const fetched = await request.get(`/api/product/${product.id}`);
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).name).toBe(product.name);
  } finally {
    const deleted = await request.delete(`/api/product/${product.id}`, { headers });
    expect(deleted.status()).toBe(200);
  }
  expect((await request.get(`/api/product/${product.id}`)).status()).toBe(404);
});
