# Theme (light/dark)

All colors come from `src/app/globals.css` (tokens defined in `:root` and
`.dark`, exposed via `@theme inline`). **Never hardcode a color** (`bg-white`,
`text-black`, `#fff`, ...) — use the Tailwind classes generated from these
variables (`bg-background`, `text-foreground`, etc.) so everything switches
automatically with the theme toggle.

## Which variable for which use

| Tailwind variable                                                                                      | Usage                                                                                                                     |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `bg-background` / `text-foreground`                                                                    | Default page background and text (already applied on `<body>`)                                                            |
| `bg-card` / `text-card-foreground`                                                                     | Background of `Card`s, panels, modals, raised blocks                                                                      |
| `bg-popover` / `text-popover-foreground`                                                               | Dropdowns, tooltips, popovers, context menus                                                                              |
| `bg-primary` / `text-primary-foreground`                                                               | Primary buttons (CTA), active/selected elements, highlighted logo/badge                                                   |
| `bg-secondary` / `text-secondary-foreground`                                                           | Secondary buttons, neutral badges                                                                                         |
| `bg-muted` / `text-muted-foreground`                                                                   | Subtle backgrounds (disabled areas, section dividers), secondary text (subtitles, descriptions, placeholders, timestamps) |
| `bg-accent` / `text-accent-foreground`                                                                 | Hover/focus states on list items, menu, selected row                                                                      |
| `bg-destructive` / text on destructive (`text-destructive-foreground` or white depending on component) | "Delete" buttons, error messages, alert badges                                                                            |
| `border-border`                                                                                        | All borders (cards, inputs, separators, tables)                                                                           |
| `border-input`                                                                                         | Border specific to form fields (`Input`, `Textarea`, `Select`)                                                            |
| `ring-ring` / `outline-ring/50`                                                                        | Focus rings (already handled globally via `@layer base`)                                                                  |
| `bg-sidebar` / `text-sidebar-foreground`                                                               | Background and text of the navigation sidebar                                                                             |
| `bg-sidebar-accent` / `text-sidebar-accent-foreground`                                                 | Active or hovered sidebar item                                                                                            |
| `border-sidebar-border` / `ring-sidebar-ring`                                                          | Borders and focus in the sidebar                                                                                          |
| `bg-sidebar-primary` / `text-sidebar-primary-foreground`                                               | Highlighted element in the sidebar (e.g. "New" button)                                                                    |
| `text-destructive`                                                                                     | Form error text, alert icons                                                                                              |
| `bg-chart-1` to `bg-chart-5`                                                                           | Chart series only                                                                                                         |

## Pairing rules

Every background color has its associated text color — always use them together:

- `bg-primary` → `text-primary-foreground`
- `bg-secondary` → `text-secondary-foreground`
- `bg-muted` → `text-muted-foreground`
- `bg-accent` → `text-accent-foreground`
- `bg-card` → `text-card-foreground`
- `bg-popover` → `text-popover-foreground`
- `bg-sidebar` → `text-sidebar-foreground`

Never mix a hardcoded light background with `text-foreground` (which becomes
white in dark mode) — systematically use the `bg-X` / `text-X-foreground` pair.

## Common cases

- **Whole page**: no class to add, `body` already has
  `bg-background text-foreground`.
- **Card / panel**: `bg-card text-card-foreground border border-border`
  (shadcn's `Card` component already does this).
- **Secondary text / description / timestamp**: `text-muted-foreground`.
- **Hovered link or list item**: `hover:bg-accent hover:text-accent-foreground`.
- **Primary button**: `bg-primary text-primary-foreground hover:bg-primary/90`
  (already handled by shadcn's `Button`, don't override).
- **Input border**: `border-input` (already handled by `Input`).
- **Error message/state**: `text-destructive` for text,
  `bg-destructive text-white` for a button or badge.
- **Separator** (`<Separator />`): already uses `bg-border`.

## Theme toggle

Dark mode is activated by adding the `.dark` class on an ancestor (usually
`<html>`), via `@custom-variant dark (&:is(.dark *))`. No extra variable is
needed to add the toggle — just switch this class (e.g. with `next-themes` or a
simple `document.documentElement.classList.toggle("dark")`) and persist the
choice (e.g. `localStorage` + read on the client before hydration to avoid the
flash).
