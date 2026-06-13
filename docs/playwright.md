# Playwright (tests e2e)

## Quoi

Playwright pilote un vrai navigateur (Chromium, Firefox, WebKit) pour tester
l'application **de bout en bout**, comme le ferait un utilisateur réel : naviguer,
cliquer, remplir des formulaires, vérifier ce qui s'affiche.

Configuration : [`playwright.config.ts`](../playwright.config.ts)

```ts
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Points clés :

- **`testDir: "./e2e"`** — tous les tests e2e vivent dans [`e2e/`](../e2e/), à
  séparer des tests unitaires Vitest (co-localisés dans `src/`, voir
  [vitest.md](./vitest.md)).
- **`projects`** — chaque test est rejoué sur 3 moteurs de rendu (Chromium,
  Firefox, WebKit) pour détecter les bugs spécifiques à un navigateur.
- **`webServer`** — Playwright démarre automatiquement `bun run dev` et attend
  que `http://localhost:3000` réponde avant de lancer les tests. En local,
  `reuseExistingServer: true` réutilise un serveur déjà lancé (gain de temps en
  dev).
- **`retries: 2` en CI** — un test flaky (réseau lent, animation...) est rejoué
  jusqu'à 2 fois en CI avant d'être considéré en échec (en local, 0 retry, pour
  voir immédiatement les vrais échecs).
- **`trace: "on-first-retry"`** — si un test échoue puis réussit au retry,
  Playwright garde une trace (timeline, captures, requêtes réseau) du run en
  échec pour debug.
- **`forbidOnly: !!process.env.CI`** — empêche qu'un `test.only(...)` oublié par
  un dev ne passe en CI (la CI échouerait si elle détecte un `.only`).

Test d'exemple : [`e2e/example.spec.ts`](../e2e/example.spec.ts)

```ts
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/HakoFlow/i);
});
```

## Pourquoi

- Vitest + RTL testent des composants **isolés** (voir [vitest.md](./vitest.md)) ;
  Playwright teste des **parcours utilisateurs complets** (ex: "un utilisateur
  s'inscrit, configure un webhook Discord, et reçoit une notification") en
  conditions quasi-réelles, navigateur compris.
- Tester sur 3 moteurs (Chromium/Firefox/WebKit) attrape des bugs CSS/JS
  spécifiques à Safari (WebKit) souvent invisibles en dev sur Chrome.
- `webServer` rend les tests reproductibles : pas besoin de penser à lancer
  `bun run dev` avant — Playwright le fait pour vous (et l'arrête après).

## Comment

```bash
bun run test:e2e
```

Lance `playwright test` : Playwright démarre le serveur Next.js (`bun run dev`),
attend qu'il soit prêt, exécute tous les fichiers `e2e/*.spec.ts` sur les 3
navigateurs, puis génère un rapport HTML (`playwright-report/`).

Pour déboguer un test en mode interactif :

```bash
bunx playwright test --ui      # interface graphique pas-à-pas
bunx playwright test --debug   # mode debug avec inspecteur
bunx playwright show-report    # ouvrir le dernier rapport HTML
```

## Où / Quand

- **Exécuté en CI** dans le job `e2e` de [`ci.yml`](../.github/workflows/ci.yml)
  (voir [ci.md](./ci.md)), en parallèle du job `ci` (lint/typecheck/tests/build).
  Le rapport HTML est uploadé comme artefact GitHub Actions même en cas d'échec.
- À lancer **localement avant une PR** sur les parcours critiques (auth,
  paiement Stripe, configuration de webhooks).
- Complémentaire des tests Vitest : si un composant a déjà un test unitaire
  solide, pas besoin de le re-tester en e2e — réserver Playwright aux parcours
  bout-en-bout (multi-pages, multi-étapes).

## Suggestions d'ajout

- **Authentification Supabase dans les tests** : utiliser
  [`storageState`](https://playwright.dev/docs/auth) pour se connecter une fois
  et réutiliser la session dans tous les tests (évite de refaire un login à
  chaque test).
- **Tests de paiement Stripe** : utiliser le
  [mode test Stripe](https://stripe.com/docs/testing) avec des cartes de test
  dédiées, combiné à des webhooks Stripe simulés via la Stripe CLI.
- **Visual regression** : `expect(page).toHaveScreenshot()` pour détecter les
  changements visuels non intentionnels sur les pages clés (dashboard, pricing).
