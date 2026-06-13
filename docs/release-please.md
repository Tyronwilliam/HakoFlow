# Release Please

## Quoi

[Release Please](https://github.com/googleapis/release-please) est une GitHub
Action qui automatise le versioning sémantique (SemVer) et la génération du
`CHANGELOG.md`, en se basant sur l'historique des commits **Conventional
Commits** (voir [husky.md](./husky.md)).

Fichiers de configuration :

- [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml)
  — le workflow GitHub Actions.
- [`release-please-config.json`](../release-please-config.json) — config du
  package suivi (type `node`, nom `hakoflow`).
- [`.release-please-manifest.json`](../.release-please-manifest.json) — version
  actuelle suivie (`0.1.0`).

```yaml
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
```

## Pourquoi

- Plus besoin de bumper `package.json` ou écrire le `CHANGELOG.md` manuellement.
- Le type de bump (patch/minor/major) est déduit automatiquement des préfixes de
  commit :
  - `fix:` → patch (`0.1.0` → `0.1.1`)
  - `feat:` → minor (`0.1.0` → `0.2.0`)
  - `feat!:` ou `BREAKING CHANGE:` dans le corps → major (`0.1.0` → `1.0.0`)
- Garde une trace claire de ce qui a changé entre deux versions — utile pour un
  SaaS en évolution rapide (suivi par les utilisateurs/clients de l'API).

## Comment

Fonctionnement automatique, **aucune commande manuelle** :

1. Des commits Conventional Commits sont pushés/mergés sur `main`.
2. À chaque push sur `main`, le workflow `release-please.yml` se déclenche.
3. Release Please ouvre (ou met à jour) une **"Release PR"** contenant :
   - le bump de version dans `package.json` et `.release-please-manifest.json`,
   - les entrées générées dans `CHANGELOG.md`.
4. Quand cette PR est mergée, Release Please crée automatiquement :
   - un tag Git (`v0.2.0`, etc.),
   - une **GitHub Release** avec les notes de version.

## Où / Quand

- Se déclenche uniquement sur `push` vers `main` (donc après merge d'une PR
  classique).
- Dépend directement de [husky.md](./husky.md) : si les messages de commit ne
  suivent pas Conventional Commits, Release Please ne détecte aucun changement
  pertinent (pas de release générée).
- Indépendant de [`ci.yml`](../.github/workflows/ci.yml) — les deux workflows
  tournent en parallèle sur `main`.

## Suggestions d'ajout

- **Déploiement Vercel sur tag de release** : ajouter un job qui se déclenche sur
  la création du tag (`v*`) pour promouvoir un déploiement Vercel "preview" en
  "production", afin de synchroniser releases et déploiements.
- **Notifications** : poster automatiquement le changelog généré dans un canal
  Slack/Discord à chaque nouvelle release (cohérent avec les intégrations
  webhooks Discord/Slack du projet).
- **`extra-files`** dans `release-please-config.json` : si d'autres fichiers
  contiennent un numéro de version (ex: une page "À propos", un fichier
  `src/lib/version.ts`), les ajouter pour qu'ils soient mis à jour
  automatiquement.
- **Pre-releases** : configurer une branche `develop`/`beta` avec
  `prerelease: true` si on veut publier des versions beta avant la release
  stable.
