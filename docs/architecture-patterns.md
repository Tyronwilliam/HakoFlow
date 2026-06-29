# Patterns d'architecture (features)

Convention à suivre pour chaque nouvelle feature (`contacts`, `reminders`,
`inbox`, ...). Le but : aucune couleur/url/type en dur dispersés dans les
composants, et un flux de données prévisible entre Supabase et l'UI.

## Structure d'un dossier feature

```
src/features/<feature>/
├── api.ts            # constantes d'URL des endpoints de la feature
├── adapters/         # raw (DB) -> shape front + schémas zod de réponse
├── validators/        # schémas zod des données envoyées (formulaires, server actions)
├── hooks/             # useQuery / useMutation (Tanstack Query)
├── actions/           # Server Actions ("use server")
└── components/        # UI de la feature
```

Toutes les features n'ont pas besoin de tous ces dossiers — uniquement ceux
nécessaires (ex: `auth` n'a pas d'`adapters`, `reminders` n'a pas encore
d'`api.ts` car tout passe par des Server Actions).

## Flux de lecture (GET) : DB → UI

```
Supabase (route handler)
   │  select(...).eq(...)
   ▼
RawXxxRow (type brut, miroir des colonnes DB)
   │  adapters/index.ts → toXxx(raw)
   ▼
XxxItem (shape front, camelCase, valeurs par défaut appliquées)
   │  zod schema xxxItemSchema.array().parse(json)
   ▼
hooks/use-xxx.ts (useQuery)
   │
   ▼
components/xxx-list.tsx (QueryBoundary)
```

### 1. Route handler (`src/app/api/.../route.ts`)

Récupère les données brutes Supabase et les passe à l'adapter. Ne fait
**aucun** reformatage inline — toute la logique de transformation vit dans
`adapters/`.

```ts
// src/app/api/conversations/route.ts
const { data, error } = await supabase
  .from("conversations")
  .select(`id, primary_channel, ..., contacts ( name, contact_channels (...) )`)
  .eq("workspace_id", workspace.id);

if (error) return NextResponse.json({ error: error.message }, { status: 500 });

const conversations = data.map(toConversationListItem);
return NextResponse.json({ conversations });
```

### 2. Adapter (`features/<feature>/adapters/index.ts`)

Trois choses dans ce fichier :

- **`RawXxxRow`** : interface qui décrit exactement ce que renvoie la query
  Supabase (types nullable, snake_case).
- **`toXxx(raw)`** : fonction pure qui transforme le raw en shape front
  (camelCase, valeurs par défaut via `??`, cast des enums).
- **`xxxSchema`** (zod) + **`type Xxx = z.infer<typeof xxxSchema>`** : le
  contrat de la réponse API côté client.

```ts
// src/features/inbox/adapters/index.ts
export interface RawConversationRow {
  id: string;
  primary_channel: string;
  unread_count: number | null;
  contacts: { name: string; contact_channels: {...}[] } | null;
}

export function toConversationListItem(raw: RawConversationRow): ConversationListItem {
  return {
    id: raw.id,
    channel: raw.primary_channel as Channel,
    contactName: raw.contacts?.name ?? "Inconnu",
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

Une seule constante par endpoint, jamais d'URL en dur dans un hook/composant.

```ts
// src/features/inbox/api.ts
export const API_INBOX = {
  conversations: "/api/conversations",
} as const;
```

### 4. Hook (`features/<feature>/hooks/use-xxx.ts`)

- `fetch` via la constante de `api.ts`
- si `!response.ok` → `throw new Error(...)` (React Query le transforme en
  `error` dans le composant)
- `.parse()` (pas `.safeParse()`) sur la réponse — un payload invalide doit
  throw et finir dans `error`, pas être ignoré silencieusement

```ts
// src/features/inbox/hooks/use-conversations.ts
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch(API_INBOX.GET);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load conversations");
      }

      return conversationListItemSchema.array().parse(data.conversations);
    },
  });
}
```

### 5. Composant (`features/<feature>/components/xxx-list.tsx`)

Toujours passer par `<QueryBoundary>` ([query-boundary.tsx](../src/components/shared/query-boundary.tsx))
pour gérer loading / vide / erreur — ne jamais réécrire ces trois `if` à la
main dans un composant de feature.

```tsx
const { data: conversations = [], isLoading, error } = useConversations();

return (
  <QueryBoundary
    isLoading={isLoading}
    isEmpty={conversations.length === 0}
    scope="inbox"
    error={error}
  >
    <ul>
      {conversations.map((c) => (
        <li key={c.id}>...</li>
      ))}
    </ul>
  </QueryBoundary>
);
```

## Flux d'écriture (POST/PUT/DELETE) : UI → DB

Pour l'instant via **Server Actions** (`"use server"`), pas de route API.

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
schéma de réponse (`adapters`).

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

| Question                                              | Réponse                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| "Je dois reformatter une row Supabase pour l'UI"      | `adapters/index.ts` → `toXxx()`                                                       |
| "Je dois valider la réponse d'une API en zod"         | `adapters/index.ts` → `xxxSchema`                                                     |
| "Je dois valider les données d'un formulaire"         | `validators/index.ts`                                                                 |
| "J'écris en dur une URL `/api/...` dans un hook"      | Non — ajouter la constante dans `api.ts`                                              |
| "Je veux gérer loading/empty/error dans un composant" | `<QueryBoundary>` ([query-boundary.tsx](../src/components/shared/query-boundary.tsx)) |
| "Je dois écrire en base depuis un formulaire"         | Server Action dans `actions/` + `useActionState`                                      |
