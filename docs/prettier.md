# Prettier

## Quoi

Prettier est un formateur de code automatique : il réécrit le code pour qu'il
respecte un style unique (indentation, guillemets, points-virgules, longueur de
ligne...), sans débat possible.

Configuration : [`.prettierrc.json`](../.prettierrc.json)

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- `semi: true` — point-virgule en fin de ligne.
- `singleQuote: false` — guillemets doubles.
- `trailingComma: "all"` — virgule finale partout (diffs git plus propres).
- `printWidth: 100` — largeur de ligne max.
- `prettier-plugin-tailwindcss` — trie automatiquement les classes Tailwind dans un
  ordre canonique (évite les conflits de merge et les classes en désordre).

Les fichiers/dossiers ignorés sont listés dans
[`.prettierignore`](../.prettierignore) (`.next`, `node_modules`, `bun.lock`).

ESLint ne gère plus aucune règle de formatage : `eslint-config-prettier` désactive
ces règles pour éviter les doubles corrections contradictoires
(voir [eslint.md](./eslint.md)).

## Pourquoi

- Éliminer les débats de style dans les revues de code.
- Diffs Git minimaux et lisibles (pas de changements de formatage parasites).
- Classes Tailwind toujours dans le même ordre → plus facile de repérer un vrai
  changement de style dans une review.

## Comment

```bash
bun run format        # reformate tout le projet
bun run format:check  # vérifie sans modifier (utilisé en CI)
```

## Où / Quand

- **Localement** : à lancer avant de commit, ou configurer son éditeur pour
  "format on save" (recommandé — voir suggestions).
- **CI** : `bun run format:check` dans [`ci.yml`](../.github/workflows/ci.yml) —
  échoue si du code n'est pas formaté.
- Actuellement **pas** branché sur le hook `pre-commit` (seul `lint` y est) —
  voir [husky.md](./husky.md).

## Suggestions d'ajout

- **`format-on-save` dans VS Code** : ajouter un `.vscode/settings.json` avec
  `"editor.defaultFormatter": "esbenp.prettier-vscode"` et
  `"editor.formatOnSave": true`, pour que chaque dev formate automatiquement.
- **`lint-staged`** : exécuter `prettier --write` + `eslint --fix` uniquement sur
  les fichiers stagés avant commit (plus rapide que tout le projet, et corrige
  automatiquement au lieu de juste bloquer). S'intègre très bien avec Husky.
- **Prettier sur les fichiers Markdown/JSON/YAML** : déjà couvert par défaut, mais
  vérifier que les fichiers de config GitHub Actions (`.yml`) restent lisibles.
- **Ordre des imports** : ajouter `@trivago/prettier-plugin-sort-imports` ou une
  règle ESLint (`eslint-plugin-simple-import-sort`) pour trier automatiquement les
  imports (utile avec beaucoup de modules Supabase/Stripe/UI).
