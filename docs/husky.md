# Husky + Commitlint

## What

**Husky** lets you trigger scripts at key Git moments (commit, push...) via
"git hooks" versioned in the repository ([`.husky/`](../.husky/) folder).

**Commitlint** checks that commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org/) convention (`feat:`,
`fix:`, `chore:`, etc.). This is the format that **Release Please** then uses to
automatically generate versions and changelogs (see
[release-please.md](./release-please.md)).

Configured hooks:

- [`.husky/pre-commit`](../.husky/pre-commit)

  ```sh
  bunx lint-staged
  ```

  → runs ESLint and Prettier **only on staged files** (see the lint-staged
  section below). Blocks the commit if a non-auto-fixable ESLint error remains.

- [`.husky/commit-msg`](../.husky/commit-msg)
  ```sh
  bunx commitlint --edit "$1"
  ```
  → blocks the commit if the message does not follow Conventional Commits.

Commitlint configuration: [`commitlint.config.ts`](../commitlint.config.ts)
(extends `@commitlint/config-conventional`, the standard rule set).

```ts
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [2, "never"],
  },
};
```

- **`scope-empty: [2, "never"]`** — makes the `(scope)` **mandatory** on every
  commit. `fix: fix a bug` is **rejected**, `fix(billing): fix a bug` is
  **accepted**. The `2` means "error" (blocks the commit), not just a warning.
- **`subject-case`** (inherited from `@commitlint/config-conventional`, already
  active with no extra config) — the description must start with a
  **lowercase** letter and must not be in "Sentence case", "Start Case",
  "PascalCase" or "UPPERCASE". `fix(billing): Fix a bug` is **rejected**,
  `fix(billing): fix a bug` is **accepted**.

### lint-staged

[`lint-staged`](https://github.com/lint-staged/lint-staged) runs commands only
on **staged** files (`git add`), instead of the whole project. Configuration in
[`package.json`](../package.json):

```jsonc
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- On `.ts`/`.tsx` files: `eslint --fix` automatically fixes what it can (unused
  imports, style...), then `prettier --write` formats.
- On `.json`/`.md`/`.css`: only Prettier applies (no relevant ESLint rules —
  useful for the `docs/` files, `package.json`, etc.).
- Fixed files are automatically re-staged by `lint-staged` before the commit
  is finalized.

The `prepare` script in `package.json` (`"prepare": "husky"`) automatically
installs the hooks on `bun install`.

## Why

- **`pre-commit` + lint-staged**: avoids polluting the history with code that
  doesn't follow the ESLint/Prettier rules — instant feedback before even
  pushing, and automatic fixes when possible. Only processing staged files keeps
  the hook fast even as the project grows.
- **`commit-msg` + Commitlint**: a clean, structured commit history is what lets
  Release Please automatically determine which version type to bump
  (patch/minor/major) and generate the `CHANGELOG.md`.

## How

Nothing to do manually: as soon as you run `git commit`, both hooks execute in
order (`pre-commit` then `commit-msg`). Expected message format:

```
<type>(<scope>): <description>

# Valid examples
feat(auth): add Supabase sign-in
fix(billing): fix Stripe VAT calculation
chore(deps): update next-safe-action

# Rejected (missing scope)
fix: fix Stripe VAT calculation

# Rejected (description starts with an uppercase letter)
fix(billing): Fix Stripe VAT calculation
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

## Where / When

- Hooks run **locally, on every commit**, on the developer's machine.
- They have no effect in CI (Git hooks don't run on GitHub Actions) — that's why
  `ci.yml` re-checks `lint`, `typecheck`, `test`, `build` independently (see
  [eslint.md](./eslint.md), [vitest.md](./vitest.md)).

## Suggested additions

- **`pre-push` hook**: run `bun run typecheck` and/or `bun run test` before a
  `git push`, to catch type/test errors without slowing down every commit.
- **Commitlint scope validation**: restrict the allowed `scope`s (e.g. `auth`,
  `billing`, `webhooks`, `ui`) via `rules.scope-enum` in `commitlint.config.ts`,
  for more readable changelogs.
