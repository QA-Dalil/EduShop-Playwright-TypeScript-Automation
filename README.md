<div align="center">

# EduShop Playwright Automation

**UI and API test suite for the [EduShop](https://github.com/BayanAlhassoun/E-Commerce-test-project-for-API---JMeter---Automation) e-commerce application**

![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
[![EduShop Playwright tests](https://github.com/QA-Dalil/EduShop-Playwright-TypeScript-Automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/QA-Dalil/EduShop-Playwright-TypeScript-Automation/actions/workflows/playwright.yml)

</div>

## At a glance

- **68 passing checks:** 47 API and 21 browser tests.
- Covers authentication, catalog, cart, checkout, orders, wishlist, reviews, and admin access.
- Runs against the Angular UI and ASP.NET Core API in Docker.
- GitHub Actions runs typecheck and tests on every push and pull request; failure artifacts include an HTML report and traces.
- Four confirmed defects have separate reproductions in [`tests/bugs`](tests/bugs) and findings in [BUG_REPORT.md](BUG_REPORT.md). They are excluded from the passing CI suite.

## Run locally

**Requirements:** Node.js 22+, Docker Desktop with Linux containers, and a disposable EduShop database. Checkout tests create orders and change inventory.

1. Start [EduShop](https://github.com/BayanAlhassoun/E-Commerce-test-project-for-API---JMeter---Automation) from its own checkout:

   ```bash
   docker compose up --build -d
   ```

2. In this repository, run:

   ```bash
   npm ci
   npx playwright install chromium
   npm run typecheck
   npm test
   ```

The default UI and API addresses are `http://localhost:4200` and `http://localhost:5000`. Override them with `EDUSHOP_UI_URL` and `EDUSHOP_API_URL`. For a different seeded customer, set `EDUSHOP_CUSTOMER_EMAIL` and `EDUSHOP_CUSTOMER_PASSWORD`.

| Command | Purpose |
| --- | --- |
| `npm run test:api` | API tests only |
| `npm run test:ui` | Browser tests only |
| `npm run report` | Open the local HTML report |
| `npm run test:bugs` | Reproduce known defects; four tests fail by design |

The bug suite creates an order and changes inventory. Run it against a disposable database.

## Results and evidence

The main suite passed **68/68** in the [GitHub Actions run](https://github.com/QA-Dalil/EduShop-Playwright-TypeScript-Automation/actions/runs/42263175483). See [TEST_COVERAGE.md](TEST_COVERAGE.md) for the coverage map and remaining scenarios.

| Catalog | Product detail |
| --- | --- |
| ![EduShop catalog](docs/images/catalog.png) | ![EduShop product detail](docs/images/product-detail.png) |

Regenerate the screenshots with `npm run capture:evidence` while EduShop is running. CI reports and traces are available as workflow artifacts.

## Project layout

```text
tests/api/      API checks
tests/ui/       Browser journeys
tests/bugs/     Known-defect reproductions
tests/support/  Shared test helpers
```

Related project: [EduShop Selenium Java Automation](https://github.com/QA-Dalil/EduShop-Selenium-Java-Automation).
