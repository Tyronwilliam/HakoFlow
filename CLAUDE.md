@AGENTS.md
@README.md

# Commandes

- `bun dev` — dev server · `bun run build` — build prod
- `bun test` (Vitest, run) · `bun test:watch` · `bun test:e2e` (Playwright)
- `bun lint` · `bun typecheck` · `bun format`
- `bun gen:api` — régénère types Supabase (`src/types/database.types.ts`) + table-types + openapi. Sous-commandes : `gen:types`, `gen:table-types`, `gen:openapi`
- `bun seed-supabase` / `bun seed-mock-data` — seed DB / données mock

# Carte de `src/`

HakoFlow = inbox unifiée multi-canaux (Gmail, Discord, Slack) : les messages arrivent par webhooks, sont rattachés à des contacts/conversations, avec suggestions de fusion et IA (résumé/suggestion de réponse).

## Features (`src/features/<feature>/`)

Chaque feature suit le pattern `api.ts` (constantes d'URL) / `adapters` (raw DB → shape front + schémas zod de réponse) / `validators` (zod côté input) / `hooks` (Tanstack Query) / `actions` (Server Actions) / `components`. Détail complet : `docs/architecture-patterns.md` — **à lire avant de créer ou modifier une feature**.

- `inbox/` — liste des conversations, groupement par contact (`use-conversations`, `conversation-list`, `contact-group-*`)
- `message/` — feed de messages d'une conversation (`MessageFeed`, `use-messages`)
- `contact-linking/` — rattachement de canaux à un contact + suggestions de fusion + historique des fusions et des rattachements, tous deux annulables (`link-contact-dialog`, `merge-suggestion-*`, `merge-history-*`, `link-history-*`, `contact-management-tabs`, hooks `use-link-*`, `use-merge-suggestion*`, `use-contact-merges`, `use-undo-merge`, `use-contact-link-history`, `use-undo-link`, Server Actions `undo-merge`, `undo-link`)
- `contacts/` — liste des contacts
- `reminders/` — rappels (écriture via Server Actions, pas de route API)
- `channels/` — intégrations par canal : un dossier par canal (`gmail/`, `discord/`, `slack/`) avec `client.ts` (appels API externes), `parser.ts` (payload webhook → message), `identity.ts` (identifiant natif du contact), `types.ts`. Commun : `shared/` (`ContactIdentity`, `normalize-email`)
- `ai/` — appels Anthropic (`suggest.ts`, `summarize.ts`), client dans `src/lib/anthropic.ts`
- `auth/` — login Supabase (Server Action `sign-in`, bouton Google)

## Routes (`src/app/`)

- `(app)/` — pages authentifiées : `inbox` (+ `inbox/[id]` = détail conversation), `contacts` (+ `contacts/gestion` = page Gestion des contacts : association de canaux, suggestions de fusion, historique), `reminders`, `settings`, `stats`
- `(auth)/` — `login` + `callback` OAuth
- `api/` — route handlers GET (conversations, messages, contacts, contact-linking, contact-merges, merge-suggestions, reminders, ai) : ils font le `select` Supabase puis délèguent aux adapters de la feature. `api/webhooks/{discord,slack,stripe}` — ingestion entrante
- `src/proxy.ts` — proxy Next.js 16 (ex-middleware), rafraîchit la session Supabase via `src/lib/supabase/proxy.ts`

## Partagé

- `src/lib/api.ts` — `fetchApi` + `parseApiResponse` (à utiliser dans les hooks, pas de fetch/parse manuel)
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/route handlers), `proxy.ts` (session)
- `src/types/shared/` — types `XxxRow` miroirs des tables DB (générés par `gen:table-types`) ; `database.types.ts` généré, ne jamais éditer à la main
- `src/components/` — `ui/` (Shadcn, générés), `shared/` (dont `QueryBoundary` pour loading/empty/error), `base/`, `layout/`
- `src/mocks/` — factories Faker + handlers MSW (tests et seed)

# Conventions

- Après avoir ajouté/supprimé une feature, une route ou un script npm : mettre à jour les sections « Carte de `src/` » et « Commandes » ci-dessus
- Réponses API toujours validées en zod (`.parse`, pas `.safeParse`) dans les hooks ; un payload invalide doit throw
- Jamais d'URL `/api/...` en dur : constante dans le `api.ts` de la feature
- Écritures en base via Server Actions + `useActionState` (validation `validators/` en `safeParse`)
- Loading/empty/error d'une liste : toujours `<QueryBoundary>`, jamais les trois `if` à la main
- Couleurs : uniquement les variables du thème (`docs/theme.md`), rien en dur
- Commits : Conventional Commits (commitlint), ex. `fix(contact-linking): ...`
- Tests : factories/handlers dans `src/mocks/` (voir `docs/vitest.md`)

Ce que fait l'app

Une inbox unifiée multi-canaux qui :

1. Ingère les messages via webhooks (Gmail, Discord, Slack → api/webhooks/)
2. Rattache chaque message à un contact/conversation, avec un identifiant natif par canal
   (channels/\*/identity.ts)
3. Détecte les doublons — si une même personne existe sous plusieurs canaux, l'app suggère
   de fusionner les identités (contact-linking/, merge-suggestion-\*)
4. Regroupe les conversations par contact plutôt que par canal (inbox/contact-group-\*) —
   vision "personne" plutôt que "boîte mail"
5. Assiste avec l'IA (Claude via src/lib/anthropic.ts) : résumé de fil de discussion,
   suggestion de réponse (features/ai/)
6. Permet le suivi via des rappels (reminders/) pour ne pas laisser une conversation sans
   réponse
7. Donne une vue stats et contacts consolidée

En résumé

C'est un CRM léger / helpdesk unifié pour indépendants et petites équipes, positionné entre
un simple client mail et un vrai CRM lourd (type Hubspot/Intercom) — avec le liant IA pour
réduire le temps de traitement humain. La proposition de valeur clé, c'est la fusion
d'identité cross-canal : ne plus voir "un ticket Discord" et "un email" comme deux
personnes différentes, mais comme un seul contact avec un historique continu.
