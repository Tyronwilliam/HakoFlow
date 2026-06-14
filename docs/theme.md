# Thème (light/dark)

Toutes les couleurs viennent de `src/app/globals.css` (tokens définis dans
`:root` et `.dark`, exposés via `@theme inline`). **Ne jamais écrire de
couleur en dur** (`bg-white`, `text-black`, `#fff`, ...) — utiliser les
classes Tailwind générées à partir de ces variables (`bg-background`,
`text-foreground`, etc.) pour que tout bascule automatiquement avec le
toggle de thème.

## Quelle variable pour quel usage

| Variable Tailwind                                                                                 | Usage                                                                                                                              |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `bg-background` / `text-foreground`                                                               | Fond de page et texte par défaut (déjà appliqués sur `<body>`)                                                                     |
| `bg-card` / `text-card-foreground`                                                                | Fond des `Card`, panneaux, modales, blocs surélevés                                                                                |
| `bg-popover` / `text-popover-foreground`                                                          | Dropdowns, tooltips, popovers, menus contextuels                                                                                   |
| `bg-primary` / `text-primary-foreground`                                                          | Boutons principaux (CTA), éléments actifs/sélectionnés, logo/badge mis en avant                                                    |
| `bg-secondary` / `text-secondary-foreground`                                                      | Boutons secondaires, badges neutres                                                                                                |
| `bg-muted` / `text-muted-foreground`                                                              | Fonds discrets (zones désactivées, séparateurs de section), texte secondaire (sous-titres, descriptions, placeholders, timestamps) |
| `bg-accent` / `text-accent-foreground`                                                            | États hover/focus sur items de liste, menu, ligne sélectionnée                                                                     |
| `bg-destructive` / texte sur destructive (`text-destructive-foreground` ou blanc selon composant) | Boutons "supprimer", messages d'erreur, badges d'alerte                                                                            |
| `border-border`                                                                                   | Toutes les bordures (cards, inputs, separators, tables)                                                                            |
| `border-input`                                                                                    | Bordure spécifique des champs de formulaire (`Input`, `Textarea`, `Select`)                                                        |
| `ring-ring` / `outline-ring/50`                                                                   | Anneaux de focus (déjà géré globalement via `@layer base`)                                                                         |
| `bg-sidebar` / `text-sidebar-foreground`                                                          | Fond et texte de la sidebar de navigation                                                                                          |
| `bg-sidebar-accent` / `text-sidebar-accent-foreground`                                            | Item de sidebar actif ou survolé                                                                                                   |
| `border-sidebar-border` / `ring-sidebar-ring`                                                     | Bordures et focus dans la sidebar                                                                                                  |
| `bg-sidebar-primary` / `text-sidebar-primary-foreground`                                          | Élément mis en avant dans la sidebar (ex: bouton "Nouveau")                                                                        |
| `text-destructive`                                                                                | Texte d'erreur de formulaire, icônes d'alerte                                                                                      |
| `bg-chart-1` à `bg-chart-5`                                                                       | Séries de graphiques uniquement                                                                                                    |

## Règles de pairing

Chaque couleur de fond a son texte associé — toujours les utiliser ensemble :

- `bg-primary` → `text-primary-foreground`
- `bg-secondary` → `text-secondary-foreground`
- `bg-muted` → `text-muted-foreground`
- `bg-accent` → `text-accent-foreground`
- `bg-card` → `text-card-foreground`
- `bg-popover` → `text-popover-foreground`
- `bg-sidebar` → `text-sidebar-foreground`

Ne jamais mélanger un fond clair codé en dur avec `text-foreground` (qui
devient blanc en dark mode) — utiliser systématiquement la paire
`bg-X` / `text-X-foreground`.

## Cas fréquents

- **Page entière** : pas de classe à ajouter, `body` a déjà
  `bg-background text-foreground`.
- **Card / panneau** : `bg-card text-card-foreground border border-border`
  (le composant `Card` de shadcn le fait déjà).
- **Texte secondaire / description / timestamp** : `text-muted-foreground`.
- **Lien ou item de liste survolé** : `hover:bg-accent hover:text-accent-foreground`.
- **Bouton principal** : `bg-primary text-primary-foreground hover:bg-primary/90`
  (déjà géré par `Button` shadcn, ne pas surcharger).
- **Bordure d'input** : `border-input` (déjà géré par `Input`).
- **Message/état d'erreur** : `text-destructive` pour le texte,
  `bg-destructive text-white` pour un bouton ou badge.
- **Séparateur** (`<Separator />`) : utilise déjà `bg-border`.

## Toggle de thème

Le mode sombre s'active en ajoutant la classe `.dark` sur un ancêtre
(généralement `<html>`), via `@custom-variant dark (&:is(.dark *))`.
Aucune variable supplémentaire n'est nécessaire pour ajouter le toggle —
il suffit de basculer cette classe (ex: avec `next-themes` ou un simple
`document.documentElement.classList.toggle("dark")`) et persister le choix
(ex: `localStorage` + lecture côté client avant hydratation pour éviter le
flash).
