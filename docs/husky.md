# Husky + Commitlint

## Quoi

**Husky** permet de déclencher des scripts à des moments clés de Git (commit,
push...) via des "git hooks" versionnés dans le dépôt (dossier
[`.husky/`](../.husky/)).

**Commitlint** vérifie que les messages de commit respectent la convention
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
`chore:`, etc.). C'est ce format que **Release Please** utilise ensuite pour
générer automatiquement les versions et les changelogs (voir
[release-please.md](./release-please.md)).

Hooks configurés :

- [`.husky/pre-commit`](../.husky/pre-commit)

  ```sh
  bunx lint-staged
  ```

  → exécute ESLint et Prettier **uniquement sur les fichiers stagés** (voir
  section lint-staged ci-dessous). Bloque le commit si une erreur ESLint non
  auto-corrigeable subsiste.

- [`.husky/commit-msg`](../.husky/commit-msg)
  ```sh
  bunx commitlint --edit "$1"
  ```
  → bloque le commit si le message ne respecte pas Conventional Commits.

Configuration Commitlint : [`commitlint.config.ts`](../commitlint.config.ts)
(étend `@commitlint/config-conventional`, le set de règles standard).

```ts
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [2, "never"],
  },
};
```

- **`scope-empty: [2, "never"]`** — rend le `(scope)` **obligatoire** sur chaque
  commit. `fix: corrige un bug` est **rejeté**, `fix(billing): corrige un bug`
  est **accepté**. Le `2` signifie "erreur" (bloque le commit), pas juste un
  warning.
- **`subject-case`** (héritée de `@commitlint/config-conventional`, déjà active
  sans config supplémentaire) — la description doit commencer par une
  **minuscule** et ne pas être en "Sentence case", "Start Case", "PascalCase" ou
  "UPPERCASE". `fix(billing): Corrige un bug` est **rejeté**,
  `fix(billing): corrige un bug` est **accepté**.

### lint-staged

[`lint-staged`](https://github.com/lint-staged/lint-staged) exécute des commandes
uniquement sur les fichiers **stagés** (`git add`), au lieu de tout le projet.
Configuration dans [`package.json`](../package.json) :

```jsonc
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- Sur les fichiers `.ts`/`.tsx` : `eslint --fix` corrige automatiquement ce qui
  peut l'être (imports inutilisés, style...), puis `prettier --write` formate.
- Sur `.json`/`.md`/`.css` : seul Prettier s'applique (pas de règles ESLint
  pertinentes — utile pour les fichiers de `docs/`, `package.json`, etc.).
- Les fichiers corrigés sont automatiquement re-stagés par `lint-staged` avant
  que le commit ne se finalise.

Le script `prepare` dans `package.json` (`"prepare": "husky"`) installe
automatiquement les hooks lors de `bun install`.

## Pourquoi

- **`pre-commit` + lint-staged** : évite de polluer l'historique avec du code qui
  ne respecte pas les règles ESLint/Prettier — feedback instantané avant même de
  pousser, et corrections automatiques quand c'est possible. Ne traiter que les
  fichiers stagés garde le hook rapide même quand le projet grossit.
- **`commit-msg` + Commitlint** : un historique de commits propre et structuré est
  ce qui permet à Release Please de déterminer automatiquement le type de version
  à bumper (patch/minor/major) et de générer le `CHANGELOG.md`.

## Comment

Rien à faire manuellement : dès qu'on fait `git commit`, les deux hooks s'exécutent
dans l'ordre (`pre-commit` puis `commit-msg`). Format de message attendu :

```
<type>(<scope>): <description>

# Exemples valides
feat(auth): ajoute la connexion via Supabase
fix(billing): corrige le calcul de la TVA Stripe
chore(deps): met à jour next-safe-action

# Rejeté (scope manquant)
fix: corrige le calcul de la TVA Stripe

# Rejeté (description avec majuscule)
fix(billing): Corrige le calcul de la TVA Stripe
```

Types courants : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

## Où / Quand

- Hooks exécutés **localement, à chaque commit**, sur la machine du développeur.
- N'a pas d'effet en CI (les hooks Git ne s'exécutent pas sur GitHub Actions) —
  c'est pour ça que `ci.yml` re-vérifie `lint`, `typecheck`, `test`, `build`
  indépendamment (voir [eslint.md](./eslint.md), [vitest.md](./vitest.md)).

## Suggestions d'ajout

- **Hook `pre-push`** : lancer `bun run typecheck` et/ou `bun run test` avant un
  `git push`, pour attraper les erreurs de types/tests sans ralentir chaque commit.
- **Validation du scope Commitlint** : restreindre les `scope` autorisés (ex:
  `auth`, `billing`, `webhooks`, `ui`) via `rules.scope-enum` dans
  `commitlint.config.ts`, pour des changelogs plus lisibles.
