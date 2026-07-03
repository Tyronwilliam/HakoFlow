# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **Bun** — use `bun`/`bunx`, not `npm`/`npx`.

```bash
bun install              # also installs Husky git hooks (see "prepare" script)
bun run dev              # next dev
bun run build            # next build
bun run lint             # eslint
bun run format            # prettier --write .
bun run format:check      # prettier --check . (used in CI)
bun run typecheck         # tsc --noEmit
bun run test              # vitest run (all unit/component tests)
bun run test:watch        # vitest watch mode
bun run test:e2e          # playwright test (starts `bun run dev` automatically)
```

Single test:

```bash
bunx vitest run src/features/inbox/adapters.test.ts   # one Vitest file
bunx vitest run -t "test name"                        # by test name
bunx playwright test e2e/example.spec.ts              # one Playwright file
bunx playwright test --ui                             # interactive Playwright debugger
```

Codegen (run after any migration under `supabase/migrations/`):

```bash
bun run gen:api          # gen:types + gen:openapi
bun run gen:types        # regenerates src/types/database.types.ts + src/types/shared/*.ts (needs `bunx supabase link`)
bun run gen:table-types  # only regenerates src/types/shared/*.ts from database.types.ts
bun run gen:openapi      # regenerates api/openapi.json (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
```

Seed data:

```bash
bun run seed-mock-data                              # generates fixture JSON in src/mocks/data/ (gitignored)
bun run seed-supabase --email=<user-email> [--contacts=5] [--reset]   # seeds the linked Supabase project
```

## Where to look

The repo is documented per-tool in `docs/*.md` (indexed in `README.md`, along
with the full project folder layout) — read the relevant one before touching
that part of the stack rather than assuming this file's summary is complete:

| Doc                                                                                                                                                                                          | Read it before...                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/architecture-patterns.md`](docs/architecture-patterns.md)                                                                                                                             | adding or changing a feature — feature-folder convention (`api.ts`/`adapters.ts`/`queries.ts`/`hooks`/`actions`/`components`), read flow (route → adapter → `queries.ts` → hook → `QueryBoundary`), write flow (Server Action + `useActionState`) |
| [`docs/supabase.md`](docs/supabase.md)                                                                                                                                                       | touching auth/session/data fetching — the three Supabase clients, `src/proxy.ts` (Next 16's renamed middleware), generated-types workflow, seeding                                                                                                |
| [`docs/theme.md`](docs/theme.md)                                                                                                                                                             | writing any UI — semantic color tokens (never hardcode a color)                                                                                                                                                                                   |
| [`docs/vitest.md`](docs/vitest.md), [`docs/playwright.md`](docs/playwright.md)                                                                                                               | writing tests — conventions, what's mocked (MSW) and what isn't yet                                                                                                                                                                               |
| [`docs/eslint.md`](docs/eslint.md), [`docs/prettier.md`](docs/prettier.md), [`docs/husky.md`](docs/husky.md), [`docs/release-please.md`](docs/release-please.md), [`docs/ci.md`](docs/ci.md) | tooling/commit/CI questions                                                                                                                                                                                                                       |

`inbox` and `message` are the reference features for the pattern in
`architecture-patterns.md` — `contacts` and `reminders` are still stubs that
haven't caught up (no `api.ts`/`adapters.ts`/`queries.ts`, raw `fetch` in the
hook).

## Data model

Not covered by a dedicated doc — inferred from `supabase/migrations/`.
Multi-tenant via `workspace_id` on every table. Core chain: `contacts` (1) ←→
(n) `contact_channels` (unique per `contact_id`+`provider`) and `contacts` (1)
←→ (n) `conversations` (`contact_id` nullable FK, `ON DELETE SET NULL`) ←→ (n)
`messages`. `conversations` is also unique per
`(workspace_id, primary_channel, external_id)`. Secondary tables `whitelist`,
`ai_suggestions`, `reminders` hang off `conversation_id`/`workspace_id`.
`messages.content` is encrypted (`bytea`, `pgp_sym_encrypt`) — decrypt only
via the `get_decrypted_messages` RPC.

Note: in the UI/hooks layer "thread" is used as a synonym for a single
`conversations` row (e.g. `QueryBoundary scope="thread"`) — there is no
separate `threads` table.
