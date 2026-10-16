# CI (GitHub Actions)

## What

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) is the continuous
integration pipeline. In a clean environment (GitHub-hosted Ubuntu runner), it
replays all the checks a dev should already have run locally via the Husky hooks
(see [husky.md](./husky.md)) — in case they were bypassed, or to confirm they
pass on a neutral machine.

The pipeline contains **two independent jobs**, run in parallel:

- **`ci`**: format, lint, typecheck, unit tests, build.
- **`e2e`**: Playwright end-to-end tests.

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  ci:
    name: Lint, typecheck, unit tests & build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Cache Bun install cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Format check
        run: bun run format:check

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Unit tests
        run: bun run test

      - name: Build
        run: bun run build

  e2e:
    name: End-to-end tests (Playwright)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Cache Bun install cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('bun.lock') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: bunx playwright install --with-deps

      - name: Install Playwright system dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: bunx playwright install-deps

      - name: Run e2e tests
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: placeholder-anon-key
        run: bun run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### `ci` job

The steps run **in order, sequentially**, and the job stops at the first
failure (GitHub Actions' default behavior):

1. **`actions/checkout@v4`** — fetches the code of the commit/PR.
2. **`oven-sh/setup-bun@v2`** — installs Bun (the package manager and runtime
   used throughout the project, see [README.md](./README.md)).
3. **`actions/cache@v4`** — caches `~/.bun/install/cache` (the global cache of
   packages downloaded by Bun), with a key based on the hash of `bun.lock`. If
   `bun.lock` hasn't changed since the last run, the next step (`bun install`)
   has almost nothing to download. `restore-keys` allows reusing a cache even if
   it's partially stale (e.g. a single dependency changed) rather than
   re-downloading everything.
4. **`bun install --frozen-lockfile`** — installs dependencies using exactly the
   versions in `bun.lock` (fails if `bun.lock` is out of sync with
   `package.json`, which avoids "works on my machine" issues).
5. **`bun run format:check`** — checks that all the code is formatted with
   Prettier (see [prettier.md](./prettier.md)). Writes nothing, fails if a file
   is not formatted.
6. **`bun run lint`** — ESLint (see [eslint.md](./eslint.md)).
7. **`bun run typecheck`** — `tsc --noEmit`, checks the TypeScript types without
   emitting JS files.
8. **`bun run test`** — Vitest unit tests (see [vitest.md](./vitest.md)).
   Thanks to the `github-actions` reporter (enabled automatically when
   `process.env.GITHUB_ACTIONS` is set, see
   [`vitest.config.ts`](../vitest.config.ts)), test failures appear as
   **annotations directly on the relevant lines in the PR's "Files changed"
   tab**, without having to open the logs.
9. **`bun run build`** — Next.js production build (`next build`). If the build
   fails (type error, broken import, env variable missing at build time...), CI
   fails.

### `e2e` job

1. Checkout + Bun setup + cache (identical to the `ci` job).
2. **`actions/cache@v4` on `~/.cache/ms-playwright`** — caches the browser
   binaries (Chromium, Firefox, WebKit, ~300 MB), with a key based on
   `bun.lock` (so it's invalidated if the `@playwright/test` version changes).
   - **Cache miss**: `bunx playwright install --with-deps` downloads the
     browsers **and** their system dependencies (apt packages).
   - **Cache hit**: the browsers are already present, so we only run
     `bunx playwright install-deps` to reinstall the system packages (they are
     not cached, but this step is fast).
3. **`bun run test:e2e`** — runs `playwright test` (see
   [playwright.md](./playwright.md)). Playwright starts `bun run dev` itself via
   `webServer`, so there's no separate build/server start step.
   The dev server runs [`src/proxy.ts`](../src/proxy.ts) on every request, which
   needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   to initialize (see [supabase.md](./supabase.md)) — without these variables,
   `next dev` crashes at startup. **Placeholder** values are enough here: the e2e
   tests make no real Supabase calls, only the (non-empty) presence of the
   variables is required.
4. **`actions/upload-artifact@v4`** with `if: always()` — uploads the Playwright
   HTML report (`playwright-report/`) even if the tests fail, so it can be
   inspected from the PR's "Actions" tab (traces, screenshots, videos on
   failure).

## Why

- **Safety net independent of the dev's machine**: the Husky hooks
  (`pre-commit`, `commit-msg`) are local and can be bypassed
  (`git commit --no-verify`) or missing if someone hasn't run `bun install`
  recently. CI guarantees that nothing broken lands on `main`.
- **`--frozen-lockfile`**: prevents a dependency from being installed in a
  different version than the one committed in `bun.lock`, a classic source of
  "works locally but not in CI" bugs.
- **Step order**: from the fastest/cheapest (format, lint) to the slowest
  (build), to fail fast and save CI time.
- **`bun run test` before `bun run build`**: no reason to pay for a full build
  if the unit tests already fail.

## Where / When

- **`pull_request`**: triggers on **any PR**, whatever the target branch — gives
  feedback before the merge.
- **`push` on `main`**: re-checks after a merge (useful if the PR was merged
  without CI being up to date, e.g. a merge with conflicts resolved online).
- Runs **in parallel** with the [Release Please](./release-please.md) workflow
  (which also triggers on `push: main`) — the two are independent.
- The `ci` and `e2e` jobs run **in parallel** with each other (no dependency) —
  the Playwright e2e tests (see [playwright.md](./playwright.md)) don't slow
  down the quick feedback of the `ci` job.

## Suggested additions

- **Version matrix**: if you need to test on several Bun or Node versions, use
  `strategy.matrix`.
- **Limit the `e2e` job to PRs**: if CI time becomes a problem, only trigger
  `e2e` on `pull_request` (not on every push to `main`), via an `if:` condition
  at the job level.
