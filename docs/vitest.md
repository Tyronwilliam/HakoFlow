# Vitest

## Quoi

Vitest est le framework de tests unitaires/intégration, utilisé avec
**React Testing Library** (RTL) pour tester les composants React, et **MSW**
(Mock Service Worker) pour mocker les appels réseau (Supabase, Stripe, Resend...).

Configuration : [`vitest.config.ts`](../vitest.config.ts)

```ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true, // résout l'alias @/* défini dans tsconfig.json
  },
  test: {
    environment: "jsdom", // simule un DOM navigateur
    globals: true, // describe/it/expect disponibles sans import
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules", "e2e/**"], // les tests e2e sont gérés par Playwright
  },
});
```

[`vitest.setup.ts`](../vitest.setup.ts) importe `@testing-library/jest-dom/vitest`
pour avoir des matchers comme `toBeInTheDocument()`, `toHaveTextContent()`, etc.

## Pourquoi

- Tester la logique métier (validation Zod, Server Actions, hooks) et le rendu des
  composants sans lancer un vrai navigateur (rapide, adapté au TDD).
- `environment: "jsdom"` permet de tester des composants React qui manipulent le
  DOM (formulaires, clics...).
- MSW permet de simuler les réponses Supabase/Stripe/Resend dans les tests sans
  appeler les vraies API (tests déterministes, pas de coût, pas de réseau).

## Comment

```bash
bun run test        # exécute tous les tests une fois (CI)
bun run test:watch  # mode watch pour le développement
```

Exemple de test existant : [`src/app/page.test.tsx`](../src/app/page.test.tsx)
— rend le composant `Home` et vérifie la présence du rôle `main`.

En CI, `process.env.GITHUB_ACTIONS` est automatiquement défini, ce qui active le
reporter `github-actions` en plus du reporter par défaut (voir
[`vitest.config.ts`](../vitest.config.ts)) : les tests qui échouent apparaissent
comme des **annotations directement sur les lignes concernées** dans l'onglet
"Files changed" de la PR.

Convention : un fichier `*.test.tsx` (ou `*.test.ts`) à côté du fichier testé
(co-localisation), ex. `src/app/page.tsx` → `src/app/page.test.tsx`.

## Où / Quand

- **Localement** : `bun run test:watch` pendant le développement.
- **CI** : `bun run test` dans [`ci.yml`](../.github/workflows/ci.yml), après
  lint/typecheck et avant le build.
- **Pas** branché sur le hook `pre-commit` actuellement (seul `lint` y est) — voir
  [husky.md](./husky.md) pour la discussion lint-staged / tests rapides.

## Suggestions d'ajout

- **Coverage** : ajouter `@vitest/coverage-v8` et un script `test:coverage`, avec
  un seuil minimal (ex: 70%) vérifié en CI.
- **MSW handlers partagés** : créer `src/mocks/handlers.ts` + `src/mocks/server.ts`
  pour centraliser les mocks Supabase/Stripe/Resend et les réutiliser dans tous les
  tests via `setupFiles`.
- **Tests des Server Actions `next-safe-action`** : ajouter un dossier
  `src/actions/__tests__` pour valider que les schémas Zod rejettent bien les
  payloads invalides (utile pour les webhooks Discord/Slack/Gmail mentionnés dans
  la stack).
- **Tests de snapshot** pour les composants Shadcn/ui personnalisés, si on les
  modifie beaucoup.
