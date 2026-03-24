---
name: gitflow
description: Use when working with git branches, creating features, releases, or hotfixes, or when the user mentions gitflow, branching strategy, or asks how to manage branches in a project.
---

# Gitflow Workflow

Apply the Gitflow branching model as described at https://nvie.com/posts/a-successful-git-branching-model/

## Branch Model

| Branch | Purpose | Branches from | Merges into |
|--------|---------|--------------|-------------|
| `main` | Production-ready code. Every commit is a release. | — | — |
| `develop` | Integration branch. Latest delivered changes. | `main` (init) | — |
| `feature/*` | New features. | `develop` | `develop` |
| `release/*` | Release preparation (version bump, last fixes). | `develop` | `main` + `develop` |
| `hotfix/*` | Critical production fixes. | `main` | `main` + `develop` |

## Naming Conventions

- Features: `feature/<short-description>` (e.g. `feature/user-auth`)
- Releases: `release-<version>` (e.g. `release-1.2`)
- Hotfixes: `hotfix-<version>` (e.g. `hotfix-1.2.1`)

## Core Rules

- **Always use `--no-ff`** when merging feature, release, and hotfix branches. This preserves branch history and makes reverts clean.
- **Tag every merge into `main`** with the version number using an annotated tag: `git tag -a <version> -m "<version>"`.
- Never commit directly to `main` or `develop`.

## Workflows

### Feature branch

```bash
# Start
git checkout -b feature/my-feature develop

# ... work, commit ...

# Finish — merge back into develop
git checkout develop
git merge --no-ff feature/my-feature
git branch -d feature/my-feature
```

### Release branch

```bash
# Start — bump version in files at this point
git checkout -b release-1.2 develop
# ... bump version, last minor fixes, commit ...

# Finish — merge into main AND develop
git checkout main
git merge --no-ff release-1.2
git tag -a 1.2 -m "1.2"

git checkout develop
git merge --no-ff release-1.2

git branch -d release-1.2
```

### Hotfix branch

```bash
# Start from main
git checkout -b hotfix-1.2.1 main
# ... bump version, fix, commit ...

# Finish — merge into main AND develop
git checkout main
git merge --no-ff hotfix-1.2.1
git tag -a 1.2.1 -m "1.2.1"

git checkout develop
git merge --no-ff hotfix-1.2.1

git branch -d hotfix-1.2.1
```

> If an active release branch exists when finishing a hotfix, merge the hotfix into that release branch instead of directly into `develop`.

## Checklist Before Merging

- [ ] Branch name follows convention
- [ ] Merge uses `--no-ff`
- [ ] Version bumped (for release and hotfix branches)
- [ ] Main is tagged after merge
