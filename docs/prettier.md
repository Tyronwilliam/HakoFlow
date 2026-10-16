# Prettier

## What

Prettier is an automatic code formatter: it rewrites the code so that it follows
a single style (indentation, quotes, semicolons, line length...), with no room
for debate.

Configuration: [`.prettierrc.json`](../.prettierrc.json)

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- `semi: true` — semicolon at the end of each statement.
- `singleQuote: false` — double quotes.
- `trailingComma: "all"` — trailing comma everywhere (cleaner git diffs).
- `printWidth: 100` — maximum line width.
- `prettier-plugin-tailwindcss` — automatically sorts Tailwind classes in a
  canonical order (avoids merge conflicts and messy classes).

Ignored files/folders are listed in [`.prettierignore`](../.prettierignore)
(`.next`, `node_modules`, `bun.lock`).

ESLint no longer handles any formatting rule: `eslint-config-prettier` disables
those rules to avoid contradictory double fixes
(see [eslint.md](./eslint.md)).

## Why

- Eliminate style debates in code reviews.
- Minimal, readable Git diffs (no stray formatting changes).
- Tailwind classes always in the same order → easier to spot a real style change
  in a review.

## How

```bash
bun run format        # reformat the whole project
bun run format:check  # check without modifying (used in CI)
```

## Where / When

- **Locally**: run before committing, or configure your editor for
  "format on save" (recommended — see suggestions).
- **CI**: `bun run format:check` in [`ci.yml`](../.github/workflows/ci.yml) —
  fails if any code is not formatted.
- Currently **not** hooked into the `pre-commit` hook (only `lint` is) —
  see [husky.md](./husky.md).

## Suggested additions

- **`format-on-save` in VS Code**: add a `.vscode/settings.json` with
  `"editor.defaultFormatter": "esbenp.prettier-vscode"` and
  `"editor.formatOnSave": true`, so every dev formats automatically.
- **`lint-staged`**: run `prettier --write` + `eslint --fix` only on staged files
  before commit (faster than the whole project, and fixes automatically instead
  of just blocking). Integrates very well with Husky.
- **Prettier on Markdown/JSON/YAML files**: already covered by default, but
  make sure the GitHub Actions config files (`.yml`) stay readable.
- **Import order**: add `@trivago/prettier-plugin-sort-imports` or an ESLint
  rule (`eslint-plugin-simple-import-sort`) to automatically sort imports
  (useful with many Supabase/Stripe/UI modules).
