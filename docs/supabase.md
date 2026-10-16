# Supabase

## What

Supabase provides the database (PostgreSQL), authentication and realtime for
HakoFlow. The integration uses `@supabase/ssr`, the official library for the
Next.js App Router, which manages the user session via **cookies** shared
between browser and server (Server Components, Server Actions, Route Handlers).

### Environment variables

[`.env.example`](../.env.example) liste les variables nécessaires.
Copier ce fichier en `.env.local` (ignoré par git, voir `.gitignore`) et remplir
avec les valeurs du projet Supabase (`Project Settings > API`) :

```bash
cp .env.example .env.local
```

> ⚠️ `next dev` runs [`src/proxy.ts`](../src/proxy.ts) on every request,
> which calls `createServerClient()` (see [`src/lib/supabase/proxy.ts`](../src/lib/supabase/proxy.ts)) —
> this function throws an error if `NEXT_PUBLIC_SUPABASE_URL` or
> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are empty. A `.env.local` is therefore
> **mandatory**, even with placeholder values (e.g.
> `https://placeholder.supabase.co`), to be able to run `bun run dev` or
> `bun run test:e2e` without a real Supabase project.

| Variable                               | Where to find it                          | Exposed to the client?                 |
| -------------------------------------- | ----------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project Settings > API > Project URL      | Yes (`NEXT_PUBLIC_` prefix)            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings > API > anon/public key  | Yes — protected by RLS rules           |
| `SUPABASE_SERVICE_ROLE_KEY`            | Project Settings > API > service_role key | **No, never** — bypasses all RLS rules |

### Three different clients

| File                                                          | Usage                                                                     | When                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) | `createClient()` — **browser** client (`createBrowserClient`)             | `"use client"` components (forms, realtime, upload...) |
| [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts) | `createClient()` — **server** client (`createServerClient` + `cookies()`) | Server Components, Server Actions, Route Handlers      |
| [`src/lib/supabase/proxy.ts`](../src/lib/supabase/proxy.ts)   | `updateSession()` — refreshes the session token                           | Used only by [`src/proxy.ts`](../src/proxy.ts)         |

```ts
// src/lib/supabase/client.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

```ts
// src/lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies(); // cookies() is async since Next 15
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component (read-only): ignored.
          // The proxy (src/proxy.ts) takes care of the refresh.
        }
      },
    },
  });
}
```

### `src/proxy.ts` — the Next.js 16 "middleware"

⚠️ In **Next.js 16**, the `middleware.ts` file is renamed **`proxy.ts`** and
the exported function is called `proxy` (no longer `middleware`). This is a
breaking change specific to this version (see `AGENTS.md`).

[`src/proxy.ts`](../src/proxy.ts) delegates to
[`updateSession()`](../src/lib/supabase/proxy.ts), which:

1. Reads the session cookies of the incoming request.
2. Calls `supabase.auth.getUser()`, which automatically refreshes the access
   token if it has expired.
3. Rewrites the new cookies onto the request **and** the response.

```ts
// src/proxy.ts
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

The `matcher` excludes static files (images, `_next/` assets) — otherwise the
proxy would run needlessly on every asset request.

## Why

- **Three distinct clients**: a Supabase client created on the server side
  cannot be reused on the browser side (and vice versa) — each has a different
  session storage mechanism (HTTP cookies vs `localStorage`/JS cookies).
- **`SUPABASE_SERVICE_ROLE_KEY` never on the client**: this key bypasses
  Row Level Security (RLS). If it leaks into the client bundle, anyone can
  read/write the entire database.
- **The proxy/middleware** is necessary because Server Components cannot write
  cookies during rendering (see
  [Next.js cookies.md](../node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md)).
  Without session refresh via the proxy, a user would be logged out as soon as
  the access token expires (1h by default), even with a valid refresh token.

## How

### Get the current user (Server Component)

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <p>{data.user?.email ?? "Not signed in"}</p>;
}
```

### Sign in (Server Action)

```ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}
```

### Client-side query (interactive component)

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

## Where / When

- `src/proxy.ts` runs on **all routes** (except those excluded by the
  `matcher`), before rendering — it's the entry point for any global
  authentication logic (e.g. redirect to `/login` if not signed in).
- `src/lib/supabase/server.ts` is used wherever the code runs on the server
  side: Server Components (`app/**/page.tsx`), Server Actions, Route Handlers
  (`app/api/**/route.ts`).
- `src/lib/supabase/client.ts` only in components marked `"use client"`.
- In CI (`next build`), these files are compiled but not run with real values —
  `next build` makes no Supabase network call. However, if a page uses
  `createClient()` at build time (static generation), the `NEXT_PUBLIC_*` env
  variables must be present (see the suggestion in [ci.md](./ci.md)).

## Generated types and API

`src/types/database.types.ts` (the `Database` type) and `api/openapi.json`
are **automatically generated** from the actual Postgres schema — no type or
endpoint is written by hand.

```bash
bun run gen:types       # regenerates database.types.ts (Database) + src/types/shared/*.ts
bun run gen:table-types # regenerates only src/types/shared/*.ts from database.types.ts
bun run gen:openapi     # regenerates api/openapi.json (PostgREST REST schema)
bun run gen:api         # gen:types + gen:openapi
```

- `gen:types` runs `supabase gen types typescript --linked --schema public`
  (requires `bunx supabase link --project-ref <ref>`, see
  `bunx supabase projects list`), then `gen:table-types`.
- `gen:table-types` ([`scripts/gen-table-types.ts`](../scripts/gen-table-types.ts))
  reads `database.types.ts` and writes one `XRow` file per table in
  `src/types/shared/` (e.g. `MessageRow` in `messages.ts`), re-exported by
  `src/types/shared/index.ts`. Columns with a `DEFAULT` (always populated by the
  app) are narrowed via the `TYPE_OVERRIDES` map at the top of the script
  (removes `| null`, or sets a literal union like `Channel` /
  `"dark" | "light"`). To add a narrowed column, edit `TYPE_OVERRIDES` then
  re-run `gen:table-types` — no file in `src/types/shared/` should be edited by
  hand, it is fully regenerated on every run.
- `gen:openapi` downloads the OpenAPI schema exposed by PostgREST
  (`GET {NEXT_PUBLIC_SUPABASE_URL}/rest/v1/` with `Accept: application/openapi+json`).
  This endpoint **requires `SUPABASE_SERVICE_ROLE_KEY`** (the publishable key
  gets `401 Secret API key required`) — the script reads this variable from
  `.env.local`, never exposed to the client.
- `api/openapi.json` lists, for each table, the REST URL, the methods
  (`GET`/`POST`/`PATCH`/`DELETE`), the PostgREST filter/sort parameters and the
  JSON schema of the payload — equivalent to the "API Docs" section of Supabase
  Studio, but versionable and usable by tools (e.g. client generation,
  Postman/Insomnia). This file is **generated, not committed**
  (see `.gitignore`).
- Regenerate after every new migration (`supabase/migrations/*.sql`) that
  adds/modifies a table or column.

## Data seeding (dev)

```bash
bun run seed-supabase --email=<login-email> [--contacts=5] [--reset]
```

[`scripts/seed-supabase.ts`](../scripts/seed-supabase.ts) fills the **linked**
Supabase project (not a JSON mock) with a realistic scenario generated by
`createWorkspaceScenario()` (see [`src/mocks/factories/`](../src/mocks/factories/)):
contacts, `contact_channels` (with a real email address for the `gmail`
provider), and linked conversations and messages.

- `--email` must match a user who has already signed in at least once via the
  app (the `public.users` row is created by the `on_auth_user_created` trigger,
  see
  [`20260614120002_functions_and_jobs.sql`](../supabase/migrations/20260614120002_functions_and_jobs.sql)).
  The script then creates (or reuses) that user's default workspace.
- `--reset` first deletes the existing contacts/conversations of that
  workspace (cascading to `contact_channels`/`messages`) before re-seeding.
- The script connects **directly to Postgres** (`SUPABASE_DATABASE_PASSWORD`,
  `postgres` package) rather than via `@supabase/supabase-js`, because
  `messages.content` is encrypted with `pgp_sym_encrypt` (`bytea` column, see
  the `functions_and_jobs` migration) — this encryption isn't accessible
  through the client/REST library.

## Suggested additions

- **Automatic redirect**: in `src/proxy.ts`, redirect to `/login` if
  `supabase.auth.getUser()` returns no user on protected routes (e.g.
  `/dashboard/*`), rather than handling it page by page.
- **Tests**: mock `@supabase/ssr` with MSW or Vitest mocks to test Server
  Actions without calling the real Supabase (see [vitest.md](./vitest.md)).
- **Vercel secrets**: add `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to the
  Vercel project's environment variables before the first deployment
  (the CI `e2e` job already uses placeholder values, see
  [ci.md](./ci.md), but the real deployment needs the real Supabase project).
