# Architecture patterns (features)

Convention to follow for every new feature (`contacts`, `reminders`,
`inbox`, ...). The goal: no hardcoded colors/urls/types scattered across
components, and a predictable data flow between Supabase and the UI.

## Structure of a feature folder

```
src/features/<feature>/
├── api.ts            # URL constants for the feature's endpoints
├── adapters/         # raw (DB) -> front shape + zod response schemas
├── validators/        # zod schemas for submitted data (forms, server actions)
├── hooks/             # useQuery / useMutation (Tanstack Query)
├── actions/           # Server Actions ("use server")
└── components/        # feature UI
```

Not every feature needs all of these folders — only the ones that are
necessary (e.g. `auth` has no `adapters`, `reminders` has no `api.ts` yet
because everything goes through Server Actions).

## Read flow (GET): DB → UI

```
Supabase (route handler)
   │  select(...).eq(...)
   ▼
RawXxxRow (raw type, mirrors the DB columns)
   │  adapters/index.ts → toXxx(raw)
   ▼
XxxItem (front shape, camelCase, defaults applied)
   │  zod schema xxxItemSchema.array().parse(json)
   ▼
hooks/use-xxx.ts (useQuery)
   │
   ▼
components/xxx-list.tsx (QueryBoundary)
```

### 1. Route handler (`src/app/api/.../route.ts`)

Fetches the raw Supabase data and passes it to the adapter. Does **no** inline
reformatting — all transformation logic lives in `adapters/`.

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

Three things in this file:

- **`RawXxxRow`**: interface that describes exactly what the Supabase query
  returns (nullable types, snake_case).
- **`toXxx(raw)`**: pure function that turns the raw row into the front shape
  (camelCase, default values via `??`, enum casts).
- **`xxxSchema`** (zod) + **`type Xxx = z.infer<typeof xxxSchema>`**: the
  contract of the API response on the client side.

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
    contactName: raw.contacts?.name ?? "Unknown",
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

### 3. Centralized endpoints (`features/<feature>/api.ts`)

One constant per endpoint, never a hardcoded URL in a hook/component.

```ts
// src/features/inbox/api.ts
export const API_INBOX = {
  conversations: "/api/conversations",
} as const;
```

### 4. Hook (`features/<feature>/hooks/use-xxx.ts`)

- `fetch` using the constant from `api.ts`
- if `!response.ok` → `throw new Error(...)` (React Query turns it into
  `error` in the component)
- `.parse()` (not `.safeParse()`) on the response — an invalid payload must
  throw and end up in `error`, not be silently ignored

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

### 5. Component (`features/<feature>/components/xxx-list.tsx`)

Always go through `<QueryBoundary>` ([query-boundary.tsx](../src/components/shared/query-boundary.tsx))
to handle loading / empty / error — never rewrite those three `if`s by hand in
a feature component.

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

## Write flow (POST/PUT/DELETE): UI → DB

For now via **Server Actions** (`"use server"`), no API route.

```
components/xxx-form.tsx (useActionState)
   │  <form action={action}>
   ▼
actions/xxx.ts ("use server")
   │  validators/index.ts → xxxSchema.safeParse(formData)
   │  if invalid → return { error: ... } (displayed in the form)
   │  if valid → supabase.from(...).insert/update(...)
   ▼
Supabase
```

### 1. Validator (`features/<feature>/validators/index.ts`)

The **input-side** zod schema (what the user submits), distinct from the
response schema (`adapters`).

```ts
// src/features/auth/validators/index.ts
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

  if (error) return { error: "Incorrect email or password." };

  redirect("/inbox");
}
```

### 3. Form (`features/<feature>/components/xxx-form.tsx`)

`useActionState` (React 19) connects the form to the Server Action:

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
        {isPending ? "..." : "Submit"}
      </Button>
    </form>
  );
}
```

## Summary: where does what go?

| Question                                              | Answer                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| "I need to reformat a Supabase row for the UI"        | `adapters/index.ts` → `toXxx()`                                                       |
| "I need to validate an API response with zod"         | `adapters/index.ts` → `xxxSchema`                                                     |
| "I need to validate form data"                        | `validators/index.ts`                                                                 |
| "I'm hardcoding an `/api/...` URL in a hook"          | No — add the constant in `api.ts`                                                     |
| "I want to handle loading/empty/error in a component" | `<QueryBoundary>` ([query-boundary.tsx](../src/components/shared/query-boundary.tsx)) |
| "I need to write to the database from a form"         | Server Action in `actions/` + `useActionState`                                        |
