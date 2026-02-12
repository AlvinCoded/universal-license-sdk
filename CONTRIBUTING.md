# Contributing to Universal License SDK

This guide is aligned with the repo’s GitHub templates and CI workflows (PR title linting,
auto-labeling, tests, and Changesets-driven releases).

## Prerequisites

- Node.js >= 18 (CI uses Node 20)
- pnpm >= 8 (CI uses pnpm 10)
- Git

## Setup

```bash
git clone https://github.com/alvincoded/universal-license-sdk
cd universal-license-sdk
pnpm install
```

## Local dev commands (same as CI)

```bash
pnpm run typecheck
pnpm run build
pnpm run test
pnpm run lint
pnpm run docs:build
```

CI also validates the PHP package scaffold under `packages/php` (expected files + composer.json
keys).

## Pull requests

### PR description

Fill out the PR template so reviewers have enough context.

### PR title (required)

This repo enforces Conventional-Commit-style PR titles (via a PR title lint workflow). Use:

```
<type>: <subject>
<type>(optional-scope): <subject>
```

Allowed `<type>` values:

- feat
- fix
- docs
- chore
- refactor
- test
- ci
- build

Subject rules:

- Must not start with an uppercase letter.

Examples:

- `feat(client): add offline validation support`
- `fix(react): resolve hook dependency issue`
- `docs: update installation instructions`

### Auto-labeling

PRs are automatically labeled based on changed paths (for example `pkg: js`, `pkg: react`,
`type: docs`, `area: ci`). You usually don’t need to add these manually.

## Changesets (required for releases)

Releases are driven by Changesets. Without a `.changeset/*.md` entry, the release workflow will not
create a version PR.

### When you need a changeset

If your PR changes code in:

- `packages/core`
- `packages/js`
- `packages/react`

…then include a changeset.

### Provide a changeset (two options)

**Option A: Add one manually (works for forks too)**

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` file.

**Option B: Auto-generate via PR label (same-repo PRs only)**

If your PR is from a branch in this repo (not a fork), add exactly one label:

- `release:patch`
- `release:minor`
- `release:major`

GitHub Actions will create/update `.changeset/auto-pr-<PR_NUMBER>.md` based on which package folders
changed.

If you later add a manual changeset, the auto-generated one will be removed.

### If you see “No changesets found” in Actions

That means your branch has no changeset entries, so the release action cannot create a version PR.
Add a changeset (Option A) or add a `release:*` label (Option B).

## Testing locally

Start watch mode across packages:

```bash
pnpm run dev
```

Link packages into another project:

```bash
pnpm run link:local
cd ../your-app
pnpm link @unilic/client
```

## Reporting issues

This repo disables blank issues; please use the issue templates.

For security vulnerabilities, use the repository’s Security advisory flow (do not open a public
issue).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
