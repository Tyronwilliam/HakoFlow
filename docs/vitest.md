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

## Mocks (`src/mocks/`)

Le dossier [`src/mocks/`](../src/mocks/) centralise les mocks réseau (MSW) et les
factories de données utilisées en tests et en seed local :

```
src/mocks/
├── data/        # JSON générés par seed-mock-data (gitignoré, non commité)
├── factories/
│   ├── channels/    # createSlackMessage, createGmailMessages, createDiscordMessages...
│   └── supabase/
│       ├── tables/      # un factory par table (createContactRow, createMessageRow...)
│       └── scenario.ts  # createWorkspaceScenario() — génère un scénario cohérent
│                         # (contacts + contact_channels + conversations + messages liés)
├── handlers/    # handlers MSW (http.get/post) pour Slack, Discord, Gmail
└── index.ts     # réexporte factories + handlers
```

- `bun run seed-mock-data` (script [`scripts/seed-mock-data.ts`](../scripts/seed-mock-data.ts))
  utilise les factories pour générer les fichiers JSON dans `src/mocks/data/`
  (seed fixe par défaut `1312` pour des données reproductibles, voir `--seed=`).
- Les handlers ([`src/mocks/handlers/`](../src/mocks/handlers/)) lisent ces JSON et
  interceptent les appels aux API Slack/Discord/Gmail (`@ts-nocheck` car les
  fixtures générées ne sont pas typées).
- `src/mocks/data/` est gitignoré : chaque dev (ou la CI) régénère ses propres
  fixtures via `seed-mock-data` avant de lancer les tests qui en dépendent.

> ⚠️ Les handlers MSW (`src/mocks/handlers/index.ts`) ne sont **pas encore branchés**
> sur `setupServer()` dans [`vitest.setup.ts`](../vitest.setup.ts) — voir
> "Suggestions d'ajout".

## Suggestions d'ajout

- **Coverage** : ajouter `@vitest/coverage-v8` et un script `test:coverage`, avec
  un seuil minimal (ex: 70%) vérifié en CI.
- **Brancher les handlers MSW** : appeler `setupServer(...handlers)` dans
  `vitest.setup.ts` (avec `beforeAll(() => server.listen())`,
  `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`) pour
  que les handlers de `src/mocks/handlers/` interceptent réellement les appels
  réseau pendant les tests.
- **Handlers Supabase/Stripe/Resend** : `src/mocks/factories/supabase/` génère déjà
  des données de scénario (`createWorkspaceScenario`), mais il n'y a pas encore de
  handlers MSW pour `@supabase/ssr`, Stripe ou Resend.
- **Tests des Server Actions `next-safe-action`** : ajouter un dossier
  `src/actions/__tests__` pour valider que les schémas Zod rejettent bien les
  payloads invalides (utile pour les webhooks Discord/Slack/Gmail mentionnés dans
  la stack).
- **Tests de snapshot** pour les composants Shadcn/ui personnalisés, si on les
  modifie beaucoup.
