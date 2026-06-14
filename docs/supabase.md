# Supabase

## Quoi

Supabase fournit la base de données (PostgreSQL), l'authentification et le
realtime pour HakoFlow. L'intégration utilise `@supabase/ssr`, la librairie
officielle pour Next.js App Router, qui gère la session utilisateur via des
**cookies** partagés entre navigateur et serveur (Server Components, Server
Actions, Route Handlers).

### Variables d'environnement

[`.env.local.example`](../.env.local.example) liste les variables nécessaires.
Copier ce fichier en `.env.local` (ignoré par git, voir `.gitignore`) et remplir
avec les valeurs du projet Supabase (`Project Settings > API`) :

```bash
cp .env.local.example .env.local
```

> ⚠️ `next dev` exécute [`src/proxy.ts`](../src/proxy.ts) sur chaque requête,
> qui appelle `createServerClient()` (voir [`src/lib/supabase/proxy.ts`](../src/lib/supabase/proxy.ts)) —
> cette fonction lève une erreur si `NEXT_PUBLIC_SUPABASE_URL` ou
> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont vides. Un `.env.local` est donc
> **obligatoire**, même avec des valeurs placeholder (ex:
> `https://placeholder.supabase.co`), pour pouvoir lancer `bun run dev` ou
> `bun run test:e2e` sans projet Supabase réel.

| Variable                               | Où la trouver                             | Exposée au client ?                            |
| -------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project Settings > API > Project URL      | Oui (préfixe `NEXT_PUBLIC_`)                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings > API > anon/public key  | Oui — protégée par les règles RLS              |
| `SUPABASE_SERVICE_ROLE_KEY`            | Project Settings > API > service_role key | **Non, jamais** — bypass toutes les règles RLS |

### Trois clients différents

| Fichier                                                       | Utilisation                                                                | Quand                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) | `createClient()` — client **navigateur** (`createBrowserClient`)           | Composants `"use client"` (formulaires, realtime, upload...) |
| [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts) | `createClient()` — client **serveur** (`createServerClient` + `cookies()`) | Server Components, Server Actions, Route Handlers            |
| [`src/lib/supabase/proxy.ts`](../src/lib/supabase/proxy.ts)   | `updateSession()` — rafraîchit le token de session                         | Utilisé uniquement par [`src/proxy.ts`](../src/proxy.ts)     |

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
  const cookieStore = await cookies(); // cookies() est async depuis Next 15
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
          // Appelé depuis un Server Component (lecture seule) : ignoré.
          // Le proxy (src/proxy.ts) s'occupe du rafraîchissement.
        }
      },
    },
  });
}
```

### `src/proxy.ts` — le "middleware" Next.js 16

⚠️ Dans **Next.js 16**, le fichier `middleware.ts` est renommé **`proxy.ts`** et
la fonction exportée s'appelle `proxy` (et non plus `middleware`). C'est un
breaking change spécifique à cette version (voir `AGENTS.md`).

[`src/proxy.ts`](../src/proxy.ts) délègue à
[`updateSession()`](../src/lib/supabase/proxy.ts), qui :

1. Lit les cookies de session de la requête entrante.
2. Appelle `supabase.auth.getUser()`, ce qui rafraîchit automatiquement le
   token d'accès s'il a expiré.
3. Réécrit les nouveaux cookies sur la requête **et** la réponse.

```ts
// src/proxy.ts
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

Le `matcher` exclut les fichiers statiques (images, assets `_next/`) — sinon le
proxy s'exécuterait sur chaque requête d'asset, inutilement.

## Pourquoi

- **Trois clients distincts** : un client Supabase créé côté serveur ne peut pas
  être réutilisé côté navigateur (et inversement) — chacun a un mécanisme
  différent de stockage de session (cookies HTTP vs `localStorage`/cookies JS).
- **`SUPABASE_SERVICE_ROLE_KEY` jamais côté client** : cette clé contourne
  Row Level Security (RLS). Si elle fuite dans le bundle client, n'importe qui
  peut lire/écrire toute la base de données.
- **Le proxy/middleware** est nécessaire car les Server Components ne peuvent
  pas écrire de cookies pendant le rendu (voir
  [cookies.md de Next.js](../node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md)).
  Sans rafraîchissement de session via le proxy, un utilisateur serait
  déconnecté dès l'expiration du token d'accès (par défaut 1h), même avec un
  refresh token valide.

## Comment

### Récupérer l'utilisateur courant (Server Component)

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <p>{data.user?.email ?? "Non connecté"}</p>;
}
```

### Connexion (Server Action)

```ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}
```

### Requête côté client (composant interactif)

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

## Où / Quand

- `src/proxy.ts` s'exécute sur **toutes les routes** (sauf celles exclues par le
  `matcher`), avant le rendu — c'est le point d'entrée pour toute logique
  d'authentification globale (ex: rediriger vers `/login` si non connecté).
- `src/lib/supabase/server.ts` est utilisé partout où le code tourne côté
  serveur : Server Components (`app/**/page.tsx`), Server Actions, Route
  Handlers (`app/api/**/route.ts`).
- `src/lib/supabase/client.ts` uniquement dans des composants marqués
  `"use client"`.
- En CI (`next build`), ces fichiers sont compilés mais pas exécutés avec de
  vraies valeurs — `next build` ne fait pas d'appel réseau Supabase. En
  revanche, si une page utilise `createClient()` au build (génération statique),
  les variables d'env `NEXT_PUBLIC_*` doivent être présentes (voir suggestion
  dans [ci.md](./ci.md)).

## Types et API générés

`src/types/database.types.ts` (le type `Database`) et `api/openapi.json`
sont **générés automatiquement** à partir du schéma Postgres réel — aucun type
ni endpoint n'est écrit à la main.

```bash
bun run gen:types       # régénère database.types.ts (Database) + src/types/shared/*.ts
bun run gen:table-types # régénère uniquement src/types/shared/*.ts depuis database.types.ts
bun run gen:openapi     # régénère api/openapi.json (schéma REST PostgREST)
bun run gen:api         # gen:types + gen:openapi
```

- `gen:types` lance `supabase gen types typescript --linked --schema public`
  (nécessite `bunx supabase link --project-ref <ref>`, voir
  `bunx supabase projects list`), puis `gen:table-types`.
- `gen:table-types` ([`scripts/gen-table-types.ts`](../scripts/gen-table-types.ts))
  lit `database.types.ts` et écrit un fichier `XRow` par table dans
  `src/types/shared/` (ex: `MessageRow` dans `messages.ts`), réexportés par
  `src/types/shared/index.ts`. Les colonnes avec `DEFAULT` (toujours
  renseignées par l'app) sont resserrées via la map `TYPE_OVERRIDES` en tête de
  script (retire `| null`, ou pose une union littérale comme `Channel` /
  `"dark" | "light"`). Pour ajouter une colonne resserrée, éditer
  `TYPE_OVERRIDES` puis relancer `gen:table-types` — aucun fichier de
  `src/types/shared/` ne doit être édité à la main, il est entièrement
  régénéré à chaque run.
- `gen:openapi` télécharge le schéma OpenAPI exposé par PostgREST
  (`GET {NEXT_PUBLIC_SUPABASE_URL}/rest/v1/` avec `Accept: application/openapi+json`).
  Cet endpoint **nécessite `SUPABASE_SERVICE_ROLE_KEY`** (la clé publishable
  reçoit `401 Secret API key required`) — le script lit cette variable dans
  `.env.local`, jamais exposée au client.
- `api/openapi.json` liste, pour chaque table, l'URL REST, les méthodes
  (`GET`/`POST`/`PATCH`/`DELETE`), les paramètres de filtre/tri PostgREST et le
  schéma JSON du payload — équivalent de la section "API Docs" de Supabase
  Studio, mais versionnable et exploitable par des outils (ex: génération de
  client, Postman/Insomnia). Ce fichier est **généré, non commité**
  (voir `.gitignore`).
- À régénérer après chaque nouvelle migration (`supabase/migrations/*.sql`)
  qui ajoute/modifie une table ou colonne.

## Seed de données (dev)

```bash
bun run seed-supabase --email=<email-de-connexion> [--contacts=5] [--reset]
```

[`scripts/seed-supabase.ts`](../scripts/seed-supabase.ts) remplit le projet
Supabase **lié** (pas un mock JSON) avec un scénario réaliste généré par
`createWorkspaceScenario()` (voir [`src/mocks/factories/`](../src/mocks/factories/)) :
contacts, `contact_channels` (avec une vraie adresse email pour le provider
`gmail`), conversations et messages liés entre eux.

- `--email` doit correspondre à un utilisateur ayant déjà fait au moins une
  connexion via l'app (la ligne `public.users` est créée par le trigger
  `on_auth_user_created`, voir
  [`20260614120002_functions_and_jobs.sql`](../supabase/migrations/20260614120002_functions_and_jobs.sql)).
  Le script crée ensuite (ou réutilise) le workspace par défaut de cet utilisateur.
- `--reset` supprime d'abord les contacts/conversations existants de ce
  workspace (cascade sur `contact_channels`/`messages`) avant de re-seeder.
- Le script se connecte **directement en Postgres** (`SUPABASE_DATABASE_PASSWORD`,
  package `postgres`) plutôt que via `@supabase/supabase-js`, car
  `messages.content` est chiffré avec `pgp_sym_encrypt` (colonne `bytea`,
  voir la migration `functions_and_jobs`) — ce chiffrement n'est pas
  accessible via la lib client/REST.

## Suggestions d'ajout

- **Redirection automatique** : dans `src/proxy.ts`, rediriger vers `/login` si
  `supabase.auth.getUser()` ne retourne pas d'utilisateur sur les routes
  protégées (ex: `/dashboard/*`), plutôt que de gérer ça page par page.
- **Tests** : mocker `@supabase/ssr` avec MSW ou des mocks Vitest pour tester les
  Server Actions sans appeler le vrai Supabase (voir [vitest.md](./vitest.md)).
- **Secrets Vercel** : ajouter `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans les
  variables d'environnement du projet Vercel avant le premier déploiement
  (le job `e2e` de la CI utilise déjà des valeurs placeholder, voir
  [ci.md](./ci.md), mais le déploiement réel a besoin du vrai projet Supabase).
