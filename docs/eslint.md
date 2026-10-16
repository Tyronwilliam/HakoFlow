# ESLint

## What

ESLint statically analyzes the TypeScript/React code to detect errors and bad
practices, and to enforce style conventions before the code even runs.

In HakoFlow, the configuration lives in [`eslint.config.mjs`](../eslint.config.mjs)
("flat config" format, the standard since ESLint 9) and combines:

- `eslint-config-next/core-web-vitals` — Next.js rules + Web Vitals best practices
  (e.g. correct use of `<Image>`, no `<a>` for internal navigation, etc.)
- `eslint-config-next/typescript` — TypeScript-specific rules provided by Next.js
- `eslint-config-prettier` — disables every ESLint rule that would conflict with
  Prettier (formatting is entirely delegated to Prettier, see
  [prettier.md](./prettier.md))

```js
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier, // must stay last
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

## Why

- Catch obvious bugs (unused variables, missing dependencies in React hooks,
  broken imports...) before the commit/CI.
- Ensure code consistency across contributors.
- Avoid Web performance regressions (`core-web-vitals` rules).

## How

```bash
bun run lint
```

The script simply runs `eslint` on the project (target determined by
`eslint.config.mjs` + the `globalIgnores`).

ESLint is also run:

- **Before every commit**, via the `pre-commit` Husky hook (see [husky.md](./husky.md)).
- **In CI**, via [`ci.yml`](../.github/workflows/ci.yml).

## Where / When

- The `pre-commit` hook blocks the commit if `bun run lint` fails → immediate
  feedback, before the code is even pushed.
- CI re-checks on every PR and on `main`, in case the hook was bypassed
  (`--no-verify`) or on a different environment.

## Suggested additions

- **`eslint-plugin-jsx-a11y`**: already indirectly included by `eslint-config-next`,
  but the accessibility rules can be strengthened (important for a SaaS with
  forms/dashboards).
- **`@typescript-eslint/no-floating-promises`**: useful to detect unhandled
  promises (e.g. Supabase/Stripe calls missing an `await`).
- **`eslint-plugin-vitest`**: rules specific to test files (`*.test.ts(x)`),
  e.g. forbid forgotten `.only` or `.skip` tests.
- **Server Actions lint**: add a custom rule or a convention comment to make sure
  all actions go through `next-safe-action` (systematic Zod validation).
- **`bun run lint -- --max-warnings=0`** in CI to turn warnings into blocking
  failures, once the codebase has stabilized.
