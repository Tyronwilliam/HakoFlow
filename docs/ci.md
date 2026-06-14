# CI (GitHub Actions)

## Quoi

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) est le pipeline
d'intégration continue. Il rejoue, dans un environnement propre (GitHub-hosted
runner Ubuntu), toutes les vérifications qu'un dev devrait déjà avoir faites
localement via les hooks Husky (voir [husky.md](./husky.md)) — au cas où elles
auraient été contournées ou pour confirmer qu'elles passent sur une machine
neutre.

Le pipeline contient **deux jobs indépendants**, exécutés en parallèle :

- **`ci`** : format, lint, typecheck, tests unitaires, build.
- **`e2e`** : tests end-to-end Playwright.

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  ci:
    name: Lint, typecheck, unit tests & build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Cache Bun install cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Format check
        run: bun run format:check

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Unit tests
        run: bun run test

      - name: Build
        run: bun run build

  e2e:
    name: End-to-end tests (Playwright)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Cache Bun install cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('bun.lock') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: bunx playwright install --with-deps

      - name: Install Playwright system dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: bunx playwright install-deps

      - name: Run e2e tests
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: placeholder-anon-key
        run: bun run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Job `ci`

Les étapes s'exécutent **dans l'ordre, séquentiellement**, et le job s'arrête au
premier échec (comportement par défaut de GitHub Actions) :

1. **`actions/checkout@v4`** — récupère le code du commit/PR.
2. **`oven-sh/setup-bun@v2`** — installe Bun (le gestionnaire de paquets et runtime
   utilisé par tout le projet, voir [README.md](./README.md)).
3. **`actions/cache@v4`** — met en cache `~/.bun/install/cache` (le cache global
   des paquets téléchargés par Bun), avec une clé basée sur le hash de
   `bun.lock`. Si `bun.lock` n'a pas changé depuis le dernier run, l'étape
   suivante (`bun install`) n'a quasiment rien à télécharger. `restore-keys`
   permet de réutiliser un cache même partiellement périmé (ex: une seule
   dépendance a changé) plutôt que de tout re-télécharger.
4. **`bun install --frozen-lockfile`** — installe les dépendances en utilisant
   exactement les versions de `bun.lock` (échoue si `bun.lock` n'est pas à jour
   avec `package.json`, ce qui évite les "ça marche chez moi").
5. **`bun run format:check`** — vérifie que tout le code est formaté avec Prettier
   (voir [prettier.md](./prettier.md)). N'écrit rien, échoue si un fichier n'est
   pas formaté.
6. **`bun run lint`** — ESLint (voir [eslint.md](./eslint.md)).
7. **`bun run typecheck`** — `tsc --noEmit`, vérifie les types TypeScript sans
   générer de fichiers JS.
8. **`bun run test`** — tests unitaires Vitest (voir [vitest.md](./vitest.md)).
   Grâce au reporter `github-actions` (activé automatiquement quand
   `process.env.GITHUB_ACTIONS` est défini, voir
   [`vitest.config.ts`](../vitest.config.ts)), les échecs de test apparaissent
   comme des **annotations directement sur les lignes concernées dans l'onglet
   "Files changed" de la PR**, sans avoir à ouvrir les logs.
9. **`bun run build`** — build de production Next.js (`next build`). Si le build
   échoue (erreur de types, import cassé, variable d'env manquante au build...),
   la CI échoue.

### Job `e2e`

1. Checkout + setup Bun + cache (identique au job `ci`).
2. **`actions/cache@v4` sur `~/.cache/ms-playwright`** — met en cache les
   binaires des navigateurs (Chromium, Firefox, WebKit, ~300 Mo), clé basée sur
   `bun.lock` (donc invalidée si la version de `@playwright/test` change).
   - **Cache miss** : `bunx playwright install --with-deps` télécharge les
     navigateurs **et** leurs dépendances système (paquets apt).
   - **Cache hit** : les navigateurs sont déjà présents, on lance seulement
     `bunx playwright install-deps` pour réinstaller les paquets système (eux
     ne sont pas mis en cache, mais cette étape est rapide).
3. **`bun run test:e2e`** — lance `playwright test` (voir
   [playwright.md](./playwright.md)). Playwright démarre lui-même `bun run dev`
   via `webServer`, donc pas d'étape de build/démarrage de serveur séparée.
   Le serveur de dev exécute [`src/proxy.ts`](../src/proxy.ts) sur chaque
   requête, qui a besoin de `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pour s'initialiser (voir
   [supabase.md](./supabase.md)) — sans ces variables, `next dev` plante au
   démarrage. Des valeurs **placeholder** suffisent ici : les tests e2e ne
   font pas de vrais appels Supabase, seule la présence (non vide) des
   variables est requise.
4. **`actions/upload-artifact@v4`** avec `if: always()` — uploade le rapport HTML
   Playwright (`playwright-report/`) même si les tests échouent, pour pouvoir
   l'inspecter depuis l'onglet "Actions" de la PR (traces, captures d'écran,
   vidéos en cas d'échec).

## Pourquoi

- **Filet de sécurité indépendant de la machine du dev** : les hooks Husky
  (`pre-commit`, `commit-msg`) sont locaux et peuvent être contournés
  (`git commit --no-verify`) ou absents si quelqu'un n'a pas lancé
  `bun install` récemment. La CI garantit que rien de cassé n'arrive sur `main`.
- **`--frozen-lockfile`** : empêche qu'une dépendance soit installée dans une
  version différente de celle commitée dans `bun.lock`, source classique de bugs
  "ça marche en local mais pas en CI".
- **Ordre des étapes** : du plus rapide/cheap (format, lint) au plus lent
  (build), pour échouer vite (`fail fast`) et économiser du temps de CI.
- **`bun run test` avant `bun run build`** : pas de raison de payer le coût d'un
  build complet si les tests unitaires échouent déjà.

## Où / Quand

- **`pull_request`** : se déclenche sur **toute PR**, quelle que soit la branche
  cible — donne un retour avant le merge.
- **`push` sur `main`** : re-vérifie après un merge (utile si la PR a été mergée
  sans que la CI soit à jour, ex: merge avec conflits résolus en ligne).
- Tourne **en parallèle** du workflow [Release Please](./release-please.md) (qui
  se déclenche aussi sur `push: main`) — les deux sont indépendants.
- Les jobs `ci` et `e2e` tournent **en parallèle** entre eux (aucune dépendance) —
  les tests e2e Playwright (voir [playwright.md](./playwright.md)) ne ralentissent
  pas le retour rapide du job `ci`.

## Suggestions d'ajout

- **Matrice de versions** : si besoin de tester sur plusieurs versions de Bun ou
  Node, utiliser `strategy.matrix`.
- **Limiter le job `e2e` aux PR** : si le temps de CI devient un problème, ne
  déclencher `e2e` que sur `pull_request` (pas sur chaque push sur `main`), via
  une condition `if:` au niveau du job.
