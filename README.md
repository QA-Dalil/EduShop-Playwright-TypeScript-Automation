# EduShop Playwright TypeScript Automation

End-to-end browser and API tests for [EduShop](https://github.com/BayanAlhassoun/E-Commerce-test-project-for-API---JMeter---Automation), an Angular storefront backed by ASP.NET Core and PostgreSQL. This is an independent QA repository; the application is checked out separately by CI.

## Coverage

| Area | Scenarios |
| --- | --- |
| Authentication UI | Customer login, invalid password, required fields, protected cart route |
| Catalog UI | Guest browsing, search, empty results, product detail, protected routes |
| Wishlist and account UI | Wishlist add/remove and access control, registration validation, admin route access |
| Shopping cart UI | Add an in-stock product, change quantity, remove it, checkout navigation |
| Checkout UI | Place an order, find it in order history, require shipping address, block empty cart |
| Products API | Paginated catalog contract, missing product, protected product creation |
| Authentication API | Login token, authorized profile, anonymous rejection, invalid credentials |
| Registration and tokens API | Invalid or duplicate registration, refresh replay prevention, logout authorization |
| Cart API | Authorization, add, update, read, remove, validation and cleanup |
| Orders API | Authorization, order listing, missing order, role restrictions, empty cart |
| Categories API | Catalog, detail, missing category, protected creation |
| Wishlist API | Authorization, add, list, remove, unknown product |
| Reviews API | Public listing, rating validation, create/read/delete, authorization |
| Admin API | Anonymous and customer restrictions, admin dashboard access |

Tests run against the real EduShop application. No endpoint or browser response is mocked. Playwright captures screenshots, video, and traces for failures. The HTML report is published as a GitHub Actions artifact.

See [TEST_COVERAGE.md](TEST_COVERAGE.md) for the coverage map, remaining high-value scenarios, and educational defects to investigate.

See [BUG_REPORT.md](BUG_REPORT.md) for four reproduced defects and one listed defect that did not reproduce. Run `npm run test:bugs` to generate a separate HTML report; the command currently exits with failures by design.

## Prerequisites

- Node.js 22 or newer
- Docker Desktop with Linux containers, or an independently running EduShop instance
- EduShop's [default customer account](https://github.com/BayanAlhassoun/E-Commerce-test-project-for-API---JMeter---Automation#default-credentials)

## Run locally

Start EduShop from its own checkout:

```bash
docker compose up --build -d
```

The UI should answer on `http://localhost:4200` and API on `http://localhost:5000/api/product`. In this repository:

```bash
npm ci
npx playwright install chromium
npm test
npm run report
```

Other commands:

```bash
npm run test:ui
npm run test:api
npm run test:bugs
npm run test:headed
npm run typecheck
```

Set `EDUSHOP_UI_URL` and `EDUSHOP_API_URL` if the app runs elsewhere. Set `EDUSHOP_CUSTOMER_EMAIL` and `EDUSHOP_CUSTOMER_PASSWORD` if the seeded customer credentials differ. The suite assumes an available in-stock product and a customer account. Use a disposable test database: checkout tests create real orders and reduce inventory.

## CI pipeline

The [Playwright workflow](.github/workflows/playwright.yml) runs on each push and pull request. It checks out this repository and the public EduShop application repository, builds the three Docker services, waits for HTTP readiness, typechecks the tests, runs Chromium and API tests, and uploads `edushop-playwright-report` even if tests fail. Download the artifact from the workflow run and open `playwright-report/index.html`.

The workflow tracks the application repository's current default branch. If you need reproducible historical runs, pin the app checkout to a commit using `ref` in the workflow.

## Layout

```text
.github/workflows/playwright.yml  CI pipeline
tests/api/                      HTTP contract and authorization tests
tests/ui/                       Browser journeys
tests/support/                  Shared login and product helpers
playwright.config.ts            Projects, browser, reporter, retry policy
```

## Test design

- Each browser test uses a fresh Playwright context. Cart tests clear the seeded customer's cart before use.
- Selectors use labels, roles, and visible product cards where possible.
- The suite checks user-visible outcomes and API contracts, not only HTTP success.
- CI keeps one worker because UI tests share a seeded customer and database.

## Troubleshooting

- If the UI is ready but login fails, check EduShop API logs and the seeded credentials.
- If Chromium cannot launch locally, run `npx playwright install --with-deps chromium` on Linux.
- If a test fails, open `playwright-report/index.html` and inspect the trace and screenshot.
- If CI cannot start EduShop, inspect the `Print app logs on failure` step.
