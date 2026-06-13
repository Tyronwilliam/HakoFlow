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
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont vides. Un `.env.local` est donc
> **obligatoire**, même avec des valeurs placeholder (ex:
> `https://placeholder.supabase.co`), pour pouvoir lancer `bun run dev` ou
> `bun run test:e2e` sans projet Supabase réel.

| Variable                        | Où la trouver                             | Exposée au client ?                            |
| ------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project Settings > API > Project URL      | Oui (préfixe `NEXT_PUBLIC_`)                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > anon/public key  | Oui — protégée par les règles RLS              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Project Settings > API > service_role key | **Non, jamais** — bypass toutes les règles RLS |

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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

## Suggestions d'ajout

- **Redirection automatique** : dans `src/proxy.ts`, rediriger vers `/login` si
  `supabase.auth.getUser()` ne retourne pas d'utilisateur sur les routes
  protégées (ex: `/dashboard/*`), plutôt que de gérer ça page par page.
- **Types générés** : utiliser `supabase gen types typescript` (CLI déjà
  installée en devDependency) pour générer `src/lib/supabase/database.types.ts`
  à partir du schéma réel, et typer `createClient<Database>(...)`.
- **Tests** : mocker `@supabase/ssr` avec MSW ou des mocks Vitest pour tester les
  Server Actions sans appeler le vrai Supabase (voir [vitest.md](./vitest.md)).
- **Secrets Vercel** : ajouter `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans les
  variables d'environnement du projet Vercel avant le premier déploiement
  (le job `e2e` de la CI utilise déjà des valeurs placeholder, voir
  [ci.md](./ci.md), mais le déploiement réel a besoin du vrai projet Supabase).
