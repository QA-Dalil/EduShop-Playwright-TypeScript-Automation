# EduShop bug reproduction results

Executed against the local Docker deployment on 2026-11-05. Run `npm run test:bugs` to reproduce. The separate [bug report](bug-report/index.html) contains Playwright traces. These are tests of **expected** behavior, so four currently fail by design until EduShop is fixed.

## Confirmed bugs

### BUG-01 — Cart undercharges for quantities above ten

- Endpoint: `POST /api/cart/items`, then `GET /api/cart`
- Reproduction: add 11 units of an in-stock product to an empty cart.
- Expected line subtotal: **$5,719.91** for the selected discounted product.
- Actual line subtotal: **$5,199.92**, a difference of **$519.99**.
- Cause in source: `CartService.MapToDto` calculates with `quantity - 1` when quantity exceeds ten.
- Impact: displayed cart total is too low. The order service calculates its own total, so checkout may show a different amount from the cart.

### BUG-02 — Product update accepts negative stock

- Endpoint: `PUT /api/product/{id}` as Admin.
- Reproduction: create a temporary product, update it with `stock: -50`, then soft-delete it.
- Expected: `400 Bad Request`.
- Actual: `200 OK`; the invalid update was accepted.
- Cause in source: `UpdateProductDto.Stock` lacks the range validation used by `CreateProductDto`; `ProductService.UpdateProductAsync` has no negative-stock guard.

### BUG-04 — Category filter is case-sensitive

- Endpoint: `GET /api/product?category=...`.
- Expected: `Electronics` and `electronics` return the same five products.
- Actual: `Electronics` returns **5**, `electronics` returns **0**.
- Cause in source: `ProductRepository.GetAllAsync` uses direct category-name equality.

### BUG-05 — Four-item order skips Processing

- Endpoint: `PUT /api/order/{id}/status` as Admin.
- Reproduction: create an order containing four distinct products, then request status `Processing`.
- Expected: `Processing`.
- Actual: `Shipped`.
- Cause in source: `OrderService.UpdateOrderStatusAsync` forces `Shipped` for a pending order with more than three line items.
- Test cleanup changes the order status to `Cancelled`. EduShop does not restore inventory on cancellation; use a disposable database for repeated reproduction.

## Listed bug not reproduced

### BUG-03 — Customer access to admin revenue

- Endpoint: `GET /api/admin/revenue` with a customer token.
- Expected: `403 Forbidden`.
- Actual: **`403 Forbidden`**. This access-control test passed.
- The method has `[Authorize]`, but `AdminController` itself has `[Authorize(Roles = "Admin")]`. The controller-level role requirement remains effective. The bug description in `BUGS_FOR_STUDENTS.md` does not match the observed deployment.

## Verification

- Main suite: **68 passed** (47 API, 21 UI).
- Targeted bug suite: **4 failed as expected, 1 passed**.
- TypeScript check: passed.
