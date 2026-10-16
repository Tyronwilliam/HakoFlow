# Release Please

## What

[Release Please](https://github.com/googleapis/release-please) is a GitHub
Action that automates semantic versioning (SemVer) and `CHANGELOG.md`
generation, based on the **Conventional Commits** history (see
[husky.md](./husky.md)).

Configuration files:

- [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml)
  — the GitHub Actions workflow.
- [`release-please-config.json`](../release-please-config.json) — config of the
  tracked package (type `node`, name `hakoflow`).
- [`.release-please-manifest.json`](../.release-please-manifest.json) — current
  tracked version (`0.1.0`).

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

## Why

- No more manually bumping `package.json` or writing `CHANGELOG.md`.
- The bump type (patch/minor/major) is automatically inferred from the commit
  prefixes:
  - `fix:` → patch (`0.1.0` → `0.1.1`)
  - `feat:` → minor (`0.1.0` → `0.2.0`)
  - `feat!:` or `BREAKING CHANGE:` in the body → major (`0.1.0` → `1.0.0`)
- Keeps a clear record of what changed between two versions — useful for a
  fast-evolving SaaS (followed by the API's users/customers).

## How

Fully automatic, **no manual command**:

1. Conventional Commits are pushed/merged to `main`.
2. On every push to `main`, the `release-please.yml` workflow triggers.
3. Release Please opens (or updates) a **"Release PR"** containing:
   - the version bump in `package.json` and `.release-please-manifest.json`,
   - the generated entries in `CHANGELOG.md`.
4. When this PR is merged, Release Please automatically creates:
   - a Git tag (`v0.2.0`, etc.),
   - a **GitHub Release** with the release notes.

## Where / When

- Triggers only on `push` to `main` (so after a regular PR is merged).
- Directly depends on [husky.md](./husky.md): Release Please reads the
  Conventional Commits types to decide whether there is a release to propose.
  Only `fix:` and `feat:` (and `BREAKING CHANGE`s) trigger a version bump and a
  `CHANGELOG.md` entry. `chore:`, `ci:`, `docs:`, `refactor:`, `test:`, `style:`
  commits are ignored for versioning — a push made up only of those commit types
  generates **no** Release PR (the `release-please` job stays "successful" but
  creates nothing, which is normal).
- Independent from [`ci.yml`](../.github/workflows/ci.yml) — the two workflows
  run in parallel on `main`.

## Suggested additions

- **Vercel deployment on release tag**: add a job triggered on tag creation
  (`v*`) to promote a "preview" Vercel deployment to "production", to keep
  releases and deployments in sync.
- **Notifications**: automatically post the generated changelog to a
  Slack/Discord channel on every new release (consistent with the project's
  Discord/Slack webhook integrations).
- **`extra-files`** in `release-please-config.json`: if other files contain a
  version number (e.g. an "About" page, a `src/lib/version.ts` file), add them
  so they get updated automatically.
- **Pre-releases**: configure a `develop`/`beta` branch with
  `prerelease: true` if you want to publish beta versions before the stable
  release.
