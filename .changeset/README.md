# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning and
changelogs for the SDK packages.

## Creating a changeset

From the SDK root:

- `pnpm changeset`

Commit the generated markdown file under `.changeset/` along with your code changes.

## Cutting a release

Typical flow:

- `pnpm version-packages` (applies queued changesets: bumps versions + updates changelogs)
- `pnpm install`
- `pnpm release` (builds, then publishes updated packages)

Publishing requires npm auth (`NPM_TOKEN`).
