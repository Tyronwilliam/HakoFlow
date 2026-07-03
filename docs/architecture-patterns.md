# Patterns d'architecture (features)

Convention à suivre pour chaque nouvelle feature (`contacts`, `reminders`,
`inbox`, ...). Le but : aucune couleur/url/type en dur dispersés dans les
composants, et un flux de données prévisible entre Supabase et l'UI.

Les features `inbox` et `message` sont les références actuelles (pattern
complet, avec pagination) — `contacts` et `reminders` sont encore des stubs
qui n'ont pas (encore) rattrapé ce pattern (pas d'`api.ts`/`adapters`/`queries.ts`,
`fetch` brut dans le hook). Aligner ces features sur `inbox`/`message` en
priorité avant d'en tirer un nouveau pattern.

## Structure d'un dossier feature

```
src/features/<feature>/
├── api.ts            # constantes/fabriques d'URL des endpoints de la feature
├── adapters.ts        # RawXxxRow (DB) -> toXxx() -> schéma zod de réponse
├── queries.ts          # queryKey/queryOptions/mutation — fabriques Tanstack Query
├── validators/         # schémas zod des données envoyées (formulaires, server actions)
├── hooks/              # useInfiniteQuery/useMutation qui consomment queries.ts
├── actions/            # Server Actions ("use server")
└── components/         # UI de la feature
```

`adapters.ts` est un **fichier plat**, pas un dossier `adapters/index.ts`
malgré ce que la première version de ce doc indiquait. Toutes les features
n'ont pas besoin de tous ces dossiers — uniquement ceux nécessaires (ex:
`auth` n'a pas d'`adapters` ni de `queries.ts`, `channels` n'a ni `api.ts` ni
`components` car ce sont des clients/parsers webhook, pas des vues).

## Flux de lecture (GET) : DB → UI

```
Supabase (route handler)
   │  select(...).eq(...).range(startIndex, stopIndex)
   ▼
RawXxxRow (type brut, miroir des colonnes DB)
   │  adapters.ts → toXxx(raw)
   ▼
XxxItem (shape front, camelCase, valeurs par défaut appliquées)
   │
   ▼
queries.ts → xxxQueryOptions() / xxxQueryKey() (fetchApi + curseur pagination)
   │
   ▼
hooks/use-xxx.ts (useInfiniteQuery, select: parseApiResponse(schema))
   │
   ▼
components/xxx-list.tsx (useInfiniteScroll + QueryBoundary + PaginationError)
```

### 1. Route handler (`src/app/api/.../route.ts`)

Récupère les données brutes Supabase et les passe à l'adapter. Ne fait
**aucun** reformatage inline — toute la logique de transformation vit dans
`adapters.ts`. Pagination gérée côté serveur via `startIndex`/`stopIndex`
(query params) → `.range(startIndex, stopIndex)`.

```ts
// src/app/api/conversations/route.ts
const { searchParams } = new URL(request.url);
const startIndex = Number(searchParams.get("startIndex") ?? 0);
const stopIndex = Number(searchParams.get("stopIndex") ?? 20);

const { data, error } = await supabase
  .from("conversations")
  .select(`id, primary_channel, ..., contacts ( name, contact_channels (...) )`)
  .eq("workspace_id", workspace.id)
  .range(startIndex, stopIndex)
  .order("last_message_at", { ascending: false });

if (error) return NextResponse.json({ error: error.message }, { status: 500 });

const conversations = data.map(toConversationListItem);
return NextResponse.json({ conversations });
```

### 2. Adapter (`features/<feature>/adapters.ts`)

Trois choses dans ce fichier :

- **`RawXxxRow`** : interface qui décrit exactement ce que renvoie la query
  Supabase (types nullable, snake_case).
- **`toXxx(raw)`** : fonction pure qui transforme le raw en shape front
  (camelCase, valeurs par défaut via `??`, cast des enums).
- **`xxxSchema`** (zod) + **`type Xxx = z.infer<typeof xxxSchema>`** : le
  contrat de la réponse API côté client.

```ts
// src/features/inbox/adapters.ts
export interface RawConversationRow {
  id: string;
  primary_channel: string;
  unread_count: number | null;
  contacts: { name: string; contact_channels: {...}[] } | null;
}

export function toConversationListItem(raw: RawConversationRow): ConversationListItem {
  const contactChannel = raw.contacts?.contact_channels.find(
    (channel) => channel.provider === raw.primary_channel,
  );

  return {
    id: raw.id,
    channel: raw.primary_channel as ChannelListType,
    contactName: raw.contacts?.name ?? "Inconnu",
    contactHandle: contactChannel?.display_handle ?? null,
    unreadCount: raw.unread_count ?? 0,
    // ...
  };
}

export const conversationListItemSchema = z.object({
  id: z.string(),
  channel: z.enum(["gmail", "discord", "slack"]),
  contactName: z.string(),
  unreadCount: z.number(),
  // ...
});

export type ConversationListItem = z.infer<typeof conversationListItemSchema>;
```

### 3. Endpoints centralisés (`features/<feature>/api.ts`)

Une fabrique par endpoint (jamais une string figée si l'URL prend des
paramètres), jamais d'URL en dur dans un hook/composant.

```ts
// src/features/inbox/api.ts
export const API_INBOX = {
  GET: (startIndex: number, stopIndex: number) =>
    `/api/conversations?startIndex=${startIndex}&stopIndex=${stopIndex}`,
  UPDATE: (conversationId: ConversationListItem["id"]) => `/api/conversations/${conversationId}`,
} as const;
```

### 4. Query layer (`features/<feature>/queries.ts`)

Couche intermédiaire entre `api.ts`/`adapters.ts` et les hooks : porte le
`queryKey`, le `queryFn` (curseur de pagination `pageParam` →
`startIndex`/`stopIndex`, appel via `fetchApi`) et les `mutationFn`. Ne fait
**pas** de validation zod ici — la validation vit dans le hook (`select`).

```ts
// src/features/inbox/queries.ts
const PAGE_SIZE = 20;

export const conversationsQueryKey = () => ["conversations"] as const;

export const conversationsQueryOptions = () => ({
  queryKey: conversationsQueryKey(),
  queryFn: async ({ pageParam }: { pageParam: number }) => {
    const startIndex = pageParam;
    const stopIndex = startIndex + PAGE_SIZE - 1;
    const data = await fetchApi<ConversationsApiResponse>(API_INBOX.GET(startIndex, stopIndex));

    return {
      conversations: data.conversations,
      nextCursor: data.conversations.length === PAGE_SIZE ? startIndex + PAGE_SIZE : null,
    };
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

export const conversationUpdateMutation = () => ({
  mutationFn: async (payload: UpdateConversationData) =>
    fetchApi(API_INBOX.UPDATE(payload.id), { method: "POST", body: JSON.stringify(payload) }),
});
```

`fetchApi` et `parseApiResponse` ([`src/lib/api.ts`](../src/lib/api.ts)) sont
les deux seuls helpers réseau à utiliser, jamais de `fetch()` inline dans un
hook/composant :

- **`fetchApi<T>(url, init?)`** : `fetch` + `!response.ok` → `throw new Error(...)`.
  React Query transforme ce throw en `error` dans le composant.
- **`parseApiResponse({ schema, data, context })`** : `schema.safeParse(data)`,
  throw une erreur préfixée par `context` (ex. `[conversations.list] ...`) si
  invalide. Utilisé dans le `select` du hook (voir ci-dessous) — **jamais**
  `schema.parse()` directement, pour garder un message d'erreur contextualisé.

### 5. Hook (`features/<feature>/hooks/use-xxx.ts`)

`useInfiniteQuery` qui étale `xxxQueryOptions()`, puis valide/transforme les
pages accumulées via `select` + `parseApiResponse`. Les mutations (ex.
marquer comme lu) font de l'**optimistic update** (`onMutate` / `onError`
rollback / `onSettled` invalidate).

```ts
// src/features/inbox/hooks/use-conversations.ts
export const useListConversations = (options?: ListConversationsOptions) => {
  return useInfiniteQuery({
    ...conversationsQueryOptions(),
    ...options,
    select: (data) =>
      parseApiResponse({
        schema: conversationListItemSchema.array(),
        data: data.pages.flatMap((p) => p.conversations),
        context: "conversations.list",
      }),
  });
};

export const useUpdateConversation = (options?: UpdateConversationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...conversationUpdateMutation(),
    ...options,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: conversationsQueryKey() });
      const snapshot = queryClient.getQueryData(conversationsQueryKey());
      queryClient.setQueryData(conversationsQueryKey(), (old) => /* mise à jour optimiste */);
      return { snapshot };
    },
    onError: (_err, _variables, context) => {
      if (context?.snapshot) queryClient.setQueryData(conversationsQueryKey(), context.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: conversationsQueryKey() }),
  });
};
```

### 6. Pagination infinie (`src/hooks/use-infinite-scroll.ts`)

Hook partagé (pas dans une feature) qui observe un `sentinelRef` via
`IntersectionObserver` et déclenche `fetchNextPage` quand il devient visible
— tant qu'il y a une page suivante, qu'aucun fetch n'est déjà en cours et
qu'il n'y a pas d'erreur. Supporte `direction: "bottom" | "top"` (le mode
`"top"` restaure la position de scroll après chargement, utile pour un thread
de messages où l'historique se charge vers le haut).

```ts
const { containerRef, sentinelRef } = useInfiniteScroll({
  hasNextPage: conversations.hasNextPage,
  isFetchingNextPage: conversations.isFetchingNextPage,
  isError: !!conversations.error && hasPreviousData,
  onLoadMore: conversations.fetchNextPage,
});
```

### 7. Composant (`features/<feature>/components/xxx-list.tsx`)

Toujours passer par `<QueryBoundary>`
([query-boundary.tsx](../src/components/shared/Boundaries/query-boundary.tsx))
pour gérer loading / vide / erreur **du premier chargement** — ne jamais
réécrire ces trois `if` à la main dans un composant de feature. Pour les
erreurs **de pagination** (une page suivante échoue alors que des données
sont déjà affichées), utiliser
[`<PaginationError>`](../src/components/shared/Boundaries/pagination-error.tsx)
en complément — `QueryBoundary` ne doit pas se déclencher dans ce cas (d'où
`error={hasPreviousData ? null : conversations.error}`).

```tsx
const conversations = useListConversations();
const hasPreviousData = conversations.data !== undefined;

return (
  <QueryBoundary
    isLoading={conversations.isLoading}
    isEmpty={(conversations.data ?? []).length === 0}
    scope="inbox"
    error={hasPreviousData ? null : conversations.error}
  >
    <ul>
      {(conversations.data ?? []).map((c) => (
        <li key={c.id}>...</li>
      ))}
    </ul>
    <PaginationError
      error={conversations.error}
      hasPreviousData={hasPreviousData}
      onRetry={() => conversations.fetchNextPage()}
    />
  </QueryBoundary>
);
```

## Flux d'écriture (POST/PUT/DELETE) : UI → DB

Pour l'instant via **Server Actions** (`"use server"`), pas de route API.
Ce flux n'a pas changé depuis la première version de ce doc.

```
components/xxx-form.tsx (useActionState)
   │  <form action={action}>
   ▼
actions/xxx.ts ("use server")
   │  validators/index.ts → xxxSchema.safeParse(formData)
   │  si invalide → return { error: ... } (affiché dans le form)
   │  si valide → supabase.from(...).insert/update(...)
   ▼
Supabase
```

### 1. Validator (`features/<feature>/validators/index.ts`)

Le schéma zod **côté input** (ce que l'utilisateur envoie), distinct du
schéma de réponse (`adapters.ts`).

```ts
// src/features/auth/validators/index.ts
export const signInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type SignInInput = z.infer<typeof signInSchema>;
```

### 2. Server Action (`features/<feature>/actions/xxx.ts`)

```ts
// src/features/auth/actions/sign-in.ts
"use server";

export interface SignInState {
  error?: string;
}

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: "Email ou mot de passe incorrect." };

  redirect("/inbox");
}
```

### 3. Formulaire (`features/<feature>/components/xxx-form.tsx`)

`useActionState` (React 19) relie le formulaire à la Server Action :

```tsx
"use client";

const initialState: SignInState = {};

export function LoginForm() {
  const [state, action, isPending] = useActionState(signIn, initialState);

  return (
    <form action={action}>
      <Input name="email" type="email" required />
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "..." : "Envoyer"}
      </Button>
    </form>
  );
}
```

## Récapitulatif : où mettre quoi ?

| Question                                                  | Réponse                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| "Je dois reformatter une row Supabase pour l'UI"          | `adapters.ts` → `toXxx()`                                                                                      |
| "Je dois valider la réponse d'une API en zod"             | `adapters.ts` → `xxxSchema`, consommé via `parseApiResponse` dans le hook (jamais `.parse()` direct)           |
| "Je dois appeler une API depuis un hook"                  | `queries.ts` (`xxxQueryOptions`/`xxxQueryKey`/`xxxMutation`) via `fetchApi` — jamais de `fetch()` dans le hook |
| "Je dois valider les données d'un formulaire"             | `validators/index.ts`                                                                                          |
| "J'écris en dur une URL `/api/...` dans un hook"          | Non — ajouter une fabrique dans `api.ts`                                                                       |
| "Je dois paginer une liste"                               | `useInfiniteQuery` dans `queries.ts`/le hook + [`useInfiniteScroll`](../src/hooks/use-infinite-scroll.ts)      |
| "Je veux gérer loading/empty/error (premier chargement)"  | [`<QueryBoundary>`](../src/components/shared/Boundaries/query-boundary.tsx)                                    |
| "Je veux gérer l'erreur d'une page suivante (pagination)" | [`<PaginationError>`](../src/components/shared/Boundaries/pagination-error.tsx)                                |
| "Je dois écrire en base depuis un formulaire"             | Server Action dans `actions/` + `useActionState`                                                               |
