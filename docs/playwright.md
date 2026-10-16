# Playwright (e2e tests)

## What

Playwright drives a real browser (Chromium, Firefox, WebKit) to test the
application **end to end**, the way a real user would: navigate, click, fill in
forms, check what is displayed.

Configuration: [`playwright.config.ts`](../playwright.config.ts)

```ts
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Key points:

- **`testDir: "./e2e"`** — all e2e tests live in [`e2e/`](../e2e/), kept separate
  from the Vitest unit tests (co-located in `src/`, see [vitest.md](./vitest.md)).
- **`projects`** — every test is replayed on 3 rendering engines (Chromium,
  Firefox, WebKit) to detect browser-specific bugs.
- **`webServer`** — Playwright automatically starts `bun run dev` and waits for
  `http://localhost:3000` to respond before running the tests. Locally,
  `reuseExistingServer: true` reuses an already running server (saves time
  during development).
- **`retries: 2` in CI** — a flaky test (slow network, animation...) is retried
  up to 2 times in CI before being considered failed (locally, 0 retries, to
  see real failures immediately).
- **`trace: "on-first-retry"`** — if a test fails then passes on retry,
  Playwright keeps a trace (timeline, screenshots, network requests) of the
  failed run for debugging.
- **`forbidOnly: !!process.env.CI`** — prevents a `test.only(...)` forgotten by
  a dev from slipping into CI (CI fails if it detects an `.only`).

Example test: [`e2e/example.spec.ts`](../e2e/example.spec.ts)

```ts
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/HakoFlow/i);
});
```

## Why

- Vitest + RTL test **isolated** components (see [vitest.md](./vitest.md));
  Playwright tests **complete user journeys** (e.g. "a user signs up, configures
  a Discord webhook, and receives a notification") in near-real conditions,
  browser included.
- Testing on 3 engines (Chromium/Firefox/WebKit) catches CSS/JS bugs specific to
  Safari (WebKit), often invisible when developing in Chrome.
- `webServer` makes tests reproducible: no need to remember to run
  `bun run dev` beforehand — Playwright does it for you (and stops it afterward).

## How

```bash
bun run test:e2e
```

Runs `playwright test`: Playwright starts the Next.js server (`bun run dev`),
waits for it to be ready, runs all `e2e/*.spec.ts` files on the 3 browsers, then
generates an HTML report (`playwright-report/`).

To debug a test interactively:

```bash
bunx playwright test --ui      # step-by-step graphical interface
bunx playwright test --debug   # debug mode with inspector
bunx playwright show-report    # open the latest HTML report
```

## Where / When

- **Run in CI** in the `e2e` job of [`ci.yml`](../.github/workflows/ci.yml)
  (see [ci.md](./ci.md)), in parallel with the `ci` job (lint/typecheck/tests/build).
  The HTML report is uploaded as a GitHub Actions artifact even on failure.
- Run **locally before a PR** on critical journeys (auth, Stripe payment,
  webhook configuration).
- Complementary to the Vitest tests: if a component already has a solid unit
  test, there's no need to test it again in e2e — reserve Playwright for
  end-to-end journeys (multi-page, multi-step).

## Suggested additions

- **Supabase authentication in tests**: use
  [`storageState`](https://playwright.dev/docs/auth) to log in once and reuse the
  session across all tests (avoids redoing a login in every test).
- **Stripe payment tests**: use
  [Stripe test mode](https://stripe.com/docs/testing) with dedicated test cards,
  combined with Stripe webhooks simulated via the Stripe CLI.
- **Visual regression**: `expect(page).toHaveScreenshot()` to detect unintended
  visual changes on key pages (dashboard, pricing).
