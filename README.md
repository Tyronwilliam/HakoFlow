# HakoFlow

Unified multi-channel inbox (Gmail, Discord, Slack) for freelancers and small teams.
Messages are attached to contacts, with cross-channel identity merging, AI thread
summaries and reply suggestions (Claude), and reminders.

This file documents the project architecture and the configured tooling (code quality,
tests, CI/CD, versioning). Details for each tool are in [docs/](./docs).

## Getting started

```bash
bun install
cp .env.example .env.local   # then fill in the variables (Supabase, Stripe, Anthropic, Gmail, Slack, Discord)
bun dev
```

## Scripts

| Command                                    | Purpose                                               |
| ------------------------------------------ | ----------------------------------------------------- |
| `bun dev` / `bun run build` / `bun start`  | Dev server / production build / production server     |
| `bun lint` / `bun typecheck`               | ESLint / TypeScript                                   |
| `bun format` / `bun format:check`          | Prettier (write / check)                              |
| `bun test` / `bun test:watch`              | Vitest unit tests                                     |
| `bun test:e2e`                             | Playwright end-to-end tests                           |
| `bun gen:api`                              | `gen:types` + `gen:openapi`                           |
| `bun gen:types` / `gen:table-types`        | Supabase types (`database.types.ts`) / `XxxRow` types |
| `bun gen:openapi`                          | Generates `api/openapi.json`                          |
| `bun seed-supabase` / `bun seed-mock-data` | Seed the database / seed mock data                    |

## Project architecture

```
hakoflow/
├── .claude/             # Claude Code config (hooks, settings)
├── .github/workflows/   # CI (ci.yml) and automated release (release-please.yml)
├── .husky/              # Git hooks (pre-commit, commit-msg)
├── api/                 # Generated openapi.json (gen:openapi), gitignored
├── docs/                # Tooling and pattern documentation
├── e2e/                 # Playwright end-to-end tests
├── public/              # Static assets
├── scripts/             # Generation scripts (types, openapi) and seed scripts
├── supabase/            # Supabase config (config.toml) and SQL migrations
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (app)/       # Authenticated pages (inbox, contacts, reminders, settings, stats)
│   │   ├── (auth)/      # Login + OAuth callback
│   │   └── api/         # Route handlers (data, ai, discord/slack/stripe webhooks)
│   ├── components/
│   │   ├── ui/          # Shadcn/ui components (generated)
│   │   ├── shared/      # Shared components (QueryBoundary, empty/error states…)
│   │   ├── base/        # Base components (Badge…)
│   │   └── layout/      # Shell, sidebar, topbar
│   ├── features/        # One folder per feature: ai, auth, channels, contact-linking,
│   │                    # contacts, inbox, message, reminders (see architecture-patterns.md)
│   ├── hooks/           # Cross-cutting hooks (debounce, infinite scroll, unread count)
│   ├── lib/
│   │   ├── supabase/    # Supabase clients (browser, server, proxy)
│   │   ├── anthropic.ts # Anthropic client
│   │   ├── stripe.ts    # Stripe client
│   │   ├── api.ts       # fetchApi + parseApiResponse
│   │   └── utils.ts     # Shared utilities (cn...)
│   ├── mocks/           # Factories + MSW handlers for tests/seed (see vitest.md)
│   ├── types/           # Generated types (database.types.ts) + shared types (shared/)
│   └── proxy.ts         # Next.js 16 proxy (formerly middleware) — Supabase session
├── .env.example         # Environment variables template
├── .mcp.json            # Project MCP servers
├── AGENTS.md            # Next.js 16 warning for agents
├── CLAUDE.md            # Commands, src/ map and conventions (for Claude Code)
├── commitlint.config.ts # Commit message validation rules
├── eslint.config.mjs    # ESLint configuration
├── playwright.config.ts # E2E test configuration
├── release-please-config.json     # Release Please configuration
├── .release-please-manifest.json  # Current versions of tracked packages
├── vitest.config.ts     # Unit test configuration
└── vitest.setup.ts      # Global test setup (jest-dom...)
```

## Documented tools

| Tool                 | Purpose                                           | Doc                                                         |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| ESLint               | Static analysis / code quality                    | [eslint.md](./docs/eslint.md)                               |
| Prettier             | Automatic code formatting                         | [prettier.md](./docs/prettier.md)                           |
| Vitest               | Unit & component tests (React Testing Library)    | [vitest.md](./docs/vitest.md)                               |
| Playwright           | End-to-end (browser) tests                        | [playwright.md](./docs/playwright.md)                       |
| Husky + Commitlint   | Git hooks & commit message validation             | [husky.md](./docs/husky.md)                                 |
| Release Please       | Automated versioning & changelog                  | [release-please.md](./docs/release-please.md)               |
| CI (GitHub Actions)  | Automated verification pipeline                   | [ci.md](./docs/ci.md)                                       |
| Supabase             | Database, auth, session (clients + proxy)         | [supabase.md](./docs/supabase.md)                           |
| Feature architecture | adapters/validators/api.ts/QueryBoundary patterns | [architecture-patterns.md](./docs/architecture-patterns.md) |
| Theme (light/dark)   | Color variables to use per component              | [theme.md](./docs/theme.md)                                 |

## Overall stack (recap)

- **Framework**: Next.js 16 (App Router, strict TypeScript)
- **Styling**: Tailwind CSS v4 + Shadcn/ui + Lucide
- **Data**: Supabase (PostgreSQL, Auth, Realtime)
- **AI**: Anthropic (Claude) — thread summaries and reply suggestions
- **Channels**: Gmail (Google Cloud Pub/Sub), Slack, Discord
- **Payments**: Stripe
- **Validation**: Zod
- **Client data fetching**: Tanstack Query
- **Tests**: Vitest + React Testing Library + MSW (unit/integration), Playwright (e2e)
- **CI/CD**: GitHub Actions + Vercel
- **Package manager**: Bun

Installed but not yet used in the code: `next-safe-action` (typed Server Actions)
and `resend` (emails).

> ⚠️ This project uses Next.js 16, which has breaking changes compared to earlier
> versions. See `AGENTS.md` at the root and `node_modules/next/dist/docs/`
> before introducing new Next.js APIs.
