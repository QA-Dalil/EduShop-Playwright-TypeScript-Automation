import { test, expect, type APIRequestContext } from '@playwright/test';
import { clearCart, customerHeaders } from '../support/api';

async function adminHeaders(request: APIRequestContext): Promise<{ Authorization: string }> {
  const response = await request.post('/api/auth/login', {
    data: { email: 'admin@test.com', password: 'Admin123!' }
  });
  expect(response.status()).toBe(200);
  return { Authorization: `Bearer ${(await response.json()).accessToken as string}` };
}

test('BUG-01: cart subtotal should include every unit above quantity ten', async ({ request }) => {
  const headers = await customerHeaders(request);
  await clearCart(request, headers);
  try {
    const catalog = await (await request.get('/api/product', { params: { pageSize: 100 } })).json();
    const product = catalog.items.find((item: { stock: number }) => item.stock >= 11);
    if (!product) throw new Error('No product has stock of at least 11');
    const response = await request.post('/api/cart/items', {
      headers, data: { productId: product.id, quantity: 11 }
    });
    expect(response.status()).toBe(200);
    const cart = await response.json();
    const line = cart.items[0];
    const expected = Math.round(line.unitPrice * (1 - line.discountPercentage / 100) * 11 * 100) / 100;
    expect(line.subtotal).toBeCloseTo(expected, 2);
    expect(cart.totalAmount).toBeCloseTo(expected, 2);
  } finally {
    await clearCart(request, headers);
  }
});

test('BUG-02: product update should reject negative stock', async ({ request }) => {
  const headers = await adminHeaders(request);
  const category = (await (await request.get('/api/category')).json())[0];
  const created = await request.post('/api/product', {
    headers,
    data: { name: `Bug reproduction ${Date.now()}`, description: 'Temporary QA product', price: 10, stock: 5, categoryId: category.id }
  });
  expect(created.status()).toBe(201);
  const product = await created.json();
  try {
    const response = await request.put(`/api/product/${product.id}`, {
      headers,
      data: { name: product.name, description: product.description, price: product.price, stock: -50, categoryId: category.id, isActive: true }
    });
    expect(response.status()).toBe(400);
  } finally {
    expect((await request.delete(`/api/product/${product.id}`, { headers })).status()).toBe(200);
  }
});

test('BUG-03: customers should not see admin revenue', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.get('/api/admin/revenue', { headers });
  expect(response.status()).toBe(403);
});

test('BUG-04: category filter should ignore letter case', async ({ request }) => {
  const exact = await (await request.get('/api/product', { params: { category: 'Electronics', pageSize: 100 } })).json();
  const lower = await (await request.get('/api/product', { params: { category: 'electronics', pageSize: 100 } })).json();
  expect(exact.totalCount).toBeGreaterThan(0);
  expect(lower.totalCount).toBe(exact.totalCount);
});

test('BUG-05: a four-product order should enter Processing', async ({ request }) => {
  const customer = await customerHeaders(request);
  const admin = await adminHeaders(request);
  await clearCart(request, customer);
  let orderId: number | undefined;
  try {
    const catalog = await (await request.get('/api/product', { params: { pageSize: 100 } })).json();
    const products = catalog.items.filter((item: { stock: number }) => item.stock > 0).slice(0, 4);
    expect(products).toHaveLength(4);
    for (const product of products) {
      const added = await request.post('/api/cart/items', {
        headers: customer, data: { productId: product.id, quantity: 1 }
      });
      expect(added.status()).toBe(200);
    }
    const placed = await request.post('/api/order', {
      headers: customer, data: { shippingAddress: '123 QA Test Street', paymentMethod: 'CashOnDelivery' }
    });
    expect(placed.status()).toBe(201);
    orderId = (await placed.json()).id as number;
    const update = await request.put(`/api/order/${orderId}/status`, {
      headers: admin, data: { status: 'Processing' }
    });
    expect(update.status()).toBe(200);
    expect((await update.json()).status).toBe('Processing');
  } finally {
    await clearCart(request, customer);
    if (orderId) {
      await request.put(`/api/order/${orderId}/status`, { headers: admin, data: { status: 'Cancelled' } });
    }
  }
});
