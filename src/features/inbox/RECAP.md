# Recap — pistes pour "seniorize" la feature inbox

Checklist des points à traiter, par ordre d'impact.

## 3. Gestion d'erreur pendant le scroll infini

`useConversations` expose `error` mais seulement pour le premier chargement
(`QueryBoundary`). Si `fetchNextPage` échoue (page 2, 3...), rien n'est affiché.
Prévoir un petit état "retry" sous la liste basé sur `isFetchingNextPage` /
l'erreur de la page suivante.

## 4. Truncation de `lastMessagePreview`

Le TODO en commentaire ("Faire une substring... 60 caractere") devrait être
résolu côté adapter/API (`toConversationListItem`) plutôt que rester en
commentaire dans le composant. `line-clamp-2` gère déjà l'affichage, donc
vérifier si ce TODO est encore nécessaire avant de l'implémenter.

## 5. Couplage circulaire `types` ↔ `components`

`src/types/shared/channels.ts` importe `CHANNELS_LIST` depuis
`src/components/shared/channel-badge.tsx`, qui lui-même importe `Channel`
depuis `@/types`. Inverser : définir `CHANNELS_LIST`/`Channel` dans
`types/shared/channels.ts`, et faire importer `channel-badge.tsx` depuis `@/types`.

## 6. `Name.tsx` — props mortes

`NameProps extends React.ComponentProps<"p">` mais seuls `content` et
`className` sont déstructurés/utilisés. Soit ajouter `...props` + spread sur
le `<p>`, soit retirer le `extends` qui ne sert à rien actuellement.

## 7. `Badge.tsx` — ordre des props

`variant="secondary"` est posé avant `{...props}`, donc un appelant qui passe
`variant` l'écrase silencieusement. Si le composant doit rester figé sur
`secondary`, mettre `{...props}` avant `variant="secondary"` (ou retirer
`variant` du type accepté).

## 8. Incohérence `PAGE_SIZE` vs `DEFAULT_STOP_INDEX`

`use-conversations.ts` utilise `PAGE_SIZE = 6`, tandis que
`app/api/conversations/route.ts` a `DEFAULT_STOP_INDEX = 20` comme fallback.
Le front envoie toujours `startIndex`/`stopIndex` donc ça ne casse rien, mais
les deux valeurs devraient être alignées (ou la constante factorisée dans
`inboxApi`).

## 10. Erreur Supabase silencieuse sur le fetch workspace

Dans `route.ts`, seule l'absence de workspace (`!workspace`) est gérée ; une
éventuelle erreur Supabase sur ce `select` n'est pas vérifiée (contrairement
au `select` des conversations qui vérifie `error`). OK

## 11 Documenter nouveau pattern API - Queries
