# ESLint

## Quoi

ESLint analyse statiquement le code TypeScript/React pour détecter les erreurs,
les mauvaises pratiques et imposer des conventions de style avant même l'exécution.

Dans HakoFlow, la configuration vit dans [`eslint.config.mjs`](../eslint.config.mjs)
(format "flat config", standard depuis ESLint 9) et combine :

- `eslint-config-next/core-web-vitals` — règles Next.js + bonnes pratiques Web Vitals
  (ex: usage correct de `<Image>`, pas de `<a>` pour la navigation interne, etc.)
- `eslint-config-next/typescript` — règles spécifiques TypeScript fournies par Next.js
- `eslint-config-prettier` — désactive toutes les règles ESLint qui entreraient en
  conflit avec Prettier (le formatage est délégué entièrement à Prettier, voir
  [prettier.md](./prettier.md))

```js
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier, // doit rester en dernier
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

## Pourquoi

- Attraper les bugs évidents (variables non utilisées, dépendances manquantes dans
  les hooks React, imports cassés...) avant le commit/CI.
- Garantir une cohérence de code entre les contributeurs.
- Éviter les régressions de performance Web (règles `core-web-vitals`).

## Comment

```bash
bun run lint
```

Le script lance simplement `eslint` sur le projet (cible déterminée par
`eslint.config.mjs` + les `globalIgnores`).

ESLint est aussi exécuté :

- **Avant chaque commit**, via le hook Husky `pre-commit` (voir [husky.md](./husky.md)).
- **Dans la CI**, via [`ci.yml`](../.github/workflows/ci.yml).

## Où / Quand

- Le hook `pre-commit` bloque le commit si `bun run lint` échoue → feedback immédiat,
  avant même de pousser le code.
- La CI re-vérifie sur chaque PR et sur `main`, au cas où le hook aurait été
  contourné (`--no-verify`) ou sur un environnement différent.

## Suggestions d'ajout

- **`eslint-plugin-jsx-a11y`** : déjà inclus indirectement par `eslint-config-next`,
  mais on peut renforcer les règles d'accessibilité (important pour un SaaS avec
  formulaires/dashboards).
- **`@typescript-eslint/no-floating-promises`** : utile pour détecter les promesses
  non gérées (ex: appels Supabase/Stripe oubliés en `await`).
- **`eslint-plugin-vitest`** : règles spécifiques pour les fichiers de test
  (`*.test.ts(x)`), par ex. interdire les tests `.only` ou `.skip` oubliés.
- **Lint des Server Actions** : ajouter une règle custom ou un commentaire de
  convention pour s'assurer que toutes les actions passent par `next-safe-action`
  (validation Zod systématique).
- **`bun run lint -- --max-warnings=0`** dans la CI pour transformer les warnings en
  échecs bloquants, une fois la base de code stabilisée.
