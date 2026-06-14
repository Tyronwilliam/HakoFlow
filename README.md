# Documentation HakoFlow

Ce dossier documente l'architecture du projet et tous les outils installés/configurés
dans le cadre de la mise en place de la stack (qualité de code, tests, CI/CD, versioning).

## Architecture du projet

```
hakoflow/
├── .github/workflows/   # CI (ci.yml) et release automatisé (release-please.yml)
├── .husky/              # Git hooks (pre-commit, commit-msg)
├── api/                 # openapi.json généré (gen:openapi), gitignoré
├── docs/                # Documentation (ce dossier)
├── e2e/                 # Tests end-to-end Playwright
├── public/              # Assets statiques
├── scripts/             # Scripts de génération (types, openapi, seed mock data)
├── src/
│   ├── app/             # App Router Next.js (pages, layouts, routes)
│   ├── components/ui/   # Composants Shadcn/ui
│   ├── lib/
│   │   ├── supabase/    # Clients Supabase (browser, server, proxy)
│   │   └── utils.ts     # Fonctions utilitaires partagées (cn...)
│   ├── mocks/           # Factories + handlers MSW pour les tests/seed (voir vitest.md)
│   ├── types/           # Types générés (database.types.ts) + types partagés
│   └── proxy.ts         # Proxy Next.js 16 (ex-middleware) — session Supabase
├── .env.local.example   # Modèle des variables d'environnement (Supabase...)
├── commitlint.config.ts # Règles de validation des messages de commit
├── eslint.config.mjs    # Configuration ESLint
├── playwright.config.ts # Configuration des tests e2e
├── release-please-config.json     # Configuration Release Please
├── .release-please-manifest.json  # Versions actuelles des packages suivis
├── vitest.config.ts     # Configuration des tests unitaires
└── vitest.setup.ts       # Setup global pour les tests (jest-dom...)
```

## Outils documentés

| Outil               | Rôle                                                 | Doc                                      |
| ------------------- | ---------------------------------------------------- | ---------------------------------------- |
| ESLint              | Analyse statique / qualité du code                   | [eslint.md](./eslint.md)                 |
| Prettier            | Formatage automatique du code                        | [prettier.md](./prettier.md)             |
| Vitest              | Tests unitaires & composants (React Testing Library) | [vitest.md](./vitest.md)                 |
| Playwright          | Tests end-to-end (navigateur)                        | [playwright.md](./playwright.md)         |
| Husky + Commitlint  | Git hooks & validation des messages de commit        | [husky.md](./husky.md)                   |
| Release Please      | Versioning & changelog automatisés                   | [release-please.md](./release-please.md) |
| CI (GitHub Actions) | Pipeline de vérification automatique                 | [ci.md](./ci.md)                         |
| Supabase            | Base de données, auth, session (clients + proxy)     | [supabase.md](./supabase.md)             |

## Stack globale (rappel)

- **Framework** : Next.js 16 (App Router, TypeScript strict)
- **Style** : Tailwind CSS v4 + Shadcn/ui + Lucide
- **Données** : Supabase (PostgreSQL, Auth, Realtime)
- **Paiement** : Stripe
- **Validation** : Zod
- **Data fetching client** : Tanstack Query
- **Server Actions typées** : next-safe-action
- **Emails** : Resend
- **Tests** : Vitest + React Testing Library + MSW (unitaire/intégration), Playwright (e2e)
- **CI/CD** : GitHub Actions + Vercel
- **Package manager** : Bun

> ⚠️ Ce projet utilise Next.js 16, qui contient des breaking changes par rapport aux
> versions précédentes. Voir `AGENTS.md` à la racine et `node_modules/next/dist/docs/`
> avant d'introduire de nouvelles APIs Next.js.
