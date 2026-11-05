# EduShop test coverage map

## Automated now

- Authentication: login success/failure, required fields, registration validation, refresh token replay, anonymous restrictions.
- Catalog: seeded products and categories, detail, search, price range, pagination, missing resources, guest browsing.
- Cart: access control, add/read/update/remove/clear, quantity validation, UI totals and checkout navigation.
- Orders: access control, empty-cart rejection, checkout success, history, missing order, customer role limits.
- Wishlist: API and UI add/list/remove, anonymous restrictions, unknown product.
- Reviews: public listing, rating validation, authorization, create/read/delete lifecycle.
- Admin: dashboard access control, test product create/read/soft-delete, UI route access.

## Valuable next scenarios

- Registration success with a unique test account, login, and logout lifecycle. The app has no account deletion endpoint, so this requires an isolated disposable database for each run.
- Admin category create/update/delete and product update validation, with cleanup and an isolated database.
- Order status transitions and stock reduction after checkout.
- Category filtering, sort order, and all pagination boundary cases.
- Wishlist-to-cart move, review form behavior, and product-detail quantity limits in the browser.
- Responsive layouts and accessibility checks at mobile and desktop widths.
- API input boundaries: invalid IDs, malformed payloads, missing fields, very long strings, and unauthorized access across every write endpoint.
- Cross-user isolation for carts, wishlists, reviews, and orders using two newly registered accounts.
- Performance and load checks remain separate from Playwright; EduShop already has a JMeter plan.

## Known educational defects to investigate

Four intentional defects are now reproduced in the separate `npm run test:bugs` suite. See [BUG_REPORT.md](BUG_REPORT.md) for expected and actual results. The listed admin revenue issue was **not** reproduced: customer access returned 403.

The main passing suite verifies supported paths. The separate failing bug suite documents the defects without making normal CI red for already-known educational bugs.
