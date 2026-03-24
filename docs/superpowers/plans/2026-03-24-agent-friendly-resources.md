# agent-friendly-resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the repository with a root index, MCP documentation (Docker + MongoDB), a skills index with the OWASP recommendation, and a complete installable gitflow skill for Claude Code.

**Architecture:** Flat markdown structure — no build system, no tests. Each file is either a documentation page or an installable artifact. The gitflow skill (`skills/gitflow/SKILL.md`) is the only code artifact; all other files are documentation. CLAUDE.md is updated last to reflect the final structure.

**Tech Stack:** Markdown, Claude Code skill format (YAML frontmatter + markdown body)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `README.md` | Root index — project intro + links to sections |
| Create | `mcps/README.md` | MCP documentation for Docker and MongoDB |
| Create | `skills/README.md` | Skills index + OWASP recommendation |
| Create | `skills/gitflow/SKILL.md` | Installable Claude Code gitflow skill |
| Create | `skills/gitflow/README.md` | Install guide and usage doc for the gitflow skill |
| Modify | `CLAUDE.md` | Update to reflect actual repo structure |

---

### Task 1: Root README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# agent-friendly-resources

A curated collection of MCPs, Claude Code skills, and personal creations for AI-assisted development.

## Contents

- [MCPs](mcps/README.md) — Model Context Protocol servers with ready-to-use configs
- [Skills](skills/README.md) — Claude Code skills: recommendations and personal creations

## How to use

Browse a category, find a resource, and follow the install instructions in its section.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add root README"
```

---

### Task 2: MCPs documentation

**Files:**
- Create: `mcps/README.md`

- [ ] **Step 1: Create `mcps/` directory and `mcps/README.md`**

```markdown
# MCPs

Model Context Protocol servers I use and recommend. Each entry includes a ready-to-paste config block for Claude Code's `settings.json`.

---

## Docker MCP

Run AI tools inside Docker containers via MCP. Useful for sandboxed execution of agent-driven workflows without polluting your local environment.

**Source:** https://github.com/docker/labs-ai-tools-for-devs
> Note: Docker Desktop also ships an integrated MCP Toolkit — check Docker Desktop settings under "Beta Features".

**Prerequisites:**
- Docker Desktop running

**Config (`~/.claude/settings.json`):**

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "/var/run/docker.sock:/var/run/docker.sock",
        "vonwig/prompts:latest",
        "serve", "--mcp"
      ]
    }
  }
}
```

---

## MongoDB MCP

Interact with MongoDB databases and MongoDB Atlas clusters directly from your agent. Supports queries, collection inspection, and Atlas management.

**Source:** https://github.com/mongodb-js/mongodb-mcp-server

**Prerequisites:**
- Node.js 20.19.0+
- A MongoDB connection string **or** MongoDB Atlas Service Account credentials

**Config (`~/.claude/settings.json`) — local MongoDB:**

```json
{
  "mcpServers": {
    "MongoDB": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server@latest", "--readOnly"],
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/myDatabase"
      }
    }
  }
}
```

> Remove `--readOnly` to enable write operations. For Atlas, replace `MDB_MCP_CONNECTION_STRING` with `MDB_MCP_API_CLIENT_ID` and `MDB_MCP_API_CLIENT_SECRET`.
```

- [ ] **Step 2: Commit**

```bash
git add mcps/README.md
git commit -m "docs: add Docker and MongoDB MCP documentation"
```

---

### Task 3: Skills index + OWASP recommendation

**Files:**
- Create: `skills/README.md`

- [ ] **Step 1: Create `skills/` directory and `skills/README.md`**

```markdown
# Skills

Claude Code skills: personal creations and external recommendations.

---

## Personal creations

| Skill | Description | Install |
|-------|-------------|---------|
| [gitflow](gitflow/README.md) | Enforces the Gitflow branching workflow in your agent | [Instructions](gitflow/README.md) |

---

## Recommendations

### OWASP Security

Equips Claude Code with security guidance covering OWASP Top 10 (2025), ASVS 5.0, and Agentic AI risks (ASI01–ASI10). Activates automatically when reviewing code, auth logic, input handling, or API design.

**Source:** https://github.com/agamm/claude-code-owasp

**Install:**

```bash
curl -sL https://raw.githubusercontent.com/agamm/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md \
  -o ~/.claude/skills/owasp-security/SKILL.md \
  --create-dirs
```
```

- [ ] **Step 2: Commit**

```bash
git add skills/README.md
git commit -m "docs: add skills index with OWASP recommendation"
```

---

### Task 4: Gitflow skill (installable artifact)

**Files:**
- Create: `skills/gitflow/SKILL.md`

This is the installable Claude Code skill. The `description` field doubles as the activation trigger — write it to cover the cases where an agent should apply gitflow rules.

- [ ] **Step 1: Create `skills/gitflow/SKILL.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add skills/gitflow/SKILL.md
git commit -m "feat: add gitflow Claude Code skill"
```

---

### Task 5: Gitflow skill install guide

**Files:**
- Create: `skills/gitflow/README.md`

- [ ] **Step 1: Create `skills/gitflow/README.md`**

```markdown
# gitflow skill

A Claude Code skill that enforces the [Gitflow branching workflow](https://nvie.com/posts/a-successful-git-branching-model/) in your agent.

## What it does

When activated, the agent will:
- Follow the Gitflow branch model (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
- Always merge with `--no-ff` to preserve history
- Tag `main` after every release or hotfix merge
- Guide you through the correct workflow for each branch type

## When it activates

The skill activates when you mention git branches, gitflow, branching strategy, or ask for help creating a feature, release, or hotfix branch.

## Install

```bash
mkdir -p ~/.claude/skills/gitflow
cp skills/gitflow/SKILL.md ~/.claude/skills/gitflow/SKILL.md
```

Or directly from GitHub:

```bash
curl -sL https://raw.githubusercontent.com/Happykiller/agent-friendly-resources/develop/skills/gitflow/SKILL.md \
  -o ~/.claude/skills/gitflow/SKILL.md \
  --create-dirs
```

## Example usage

> "I need to start working on a new login feature, use gitflow"

The agent will create `feature/login` from `develop` and guide the merge back when done.

## Source

- [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) — Vincent Driessen
- [Gitflow Workflow — Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
```

- [ ] **Step 2: Commit**

```bash
git add skills/gitflow/README.md
git commit -m "docs: add gitflow skill install guide"
```

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the placeholder content in `CLAUDE.md` with the actual structure**

Replace the "Repository Structure" section with:

```markdown
## Repository Structure

```
README.md              ← root index
mcps/
  README.md            ← Docker and MongoDB MCP docs with ready-to-paste configs
skills/
  README.md            ← skills index + external recommendations (OWASP)
  gitflow/
    SKILL.md           ← installable Claude Code gitflow skill
    README.md          ← install guide and usage doc
```

Personal skill creations live in `skills/<name>/SKILL.md`. The SKILL.md file IS the installable artifact — it follows Claude Code skill format (YAML frontmatter with `name` and `description`, markdown body).

## Adding a new MCP

Add a section to `mcps/README.md` with: description, prerequisites, and a ready-to-paste `mcpServers` JSON block.

## Adding a new personal skill

1. Create `skills/<name>/SKILL.md` — frontmatter: `name` + `description` (description is the activation trigger)
2. Create `skills/<name>/README.md` — install instructions and usage examples
3. Add a row to the table in `skills/README.md`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect final repo structure"
```
