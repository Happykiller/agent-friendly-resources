# Design: agent-friendly-resources repository structure

**Date:** 2026-03-24
**Status:** Approved

## Purpose

A public repository that serves as both a personal reference and a community resource for AI agents tooling: MCPs, Claude Code skills, and personal creations. Content is in English for maximum community reach.

## Goals

- Document favorite MCPs with install configs ready to copy
- Document recommended skills with install instructions
- Publish personal skill creations as installable artifacts for Claude Code agents
- Keep the structure simple and extensible

## Repository Structure

```
README.md                        ← General index: project purpose, links to sections

mcps/
  README.md                      ← All MCP documentation (Docker, MongoDB)

skills/
  README.md                      ← Skills index + external recommendations (e.g. OWASP)
  gitflow/
    SKILL.md                     ← The installable Claude Code skill file
    README.md                    ← Install guide and usage documentation
```

Future personal skill creations follow the same pattern: `skills/<name>/SKILL.md`.

## File Content Specifications

### `README.md` (root)
- Project title and one-line description
- Links to `mcps/README.md` and `skills/README.md` (section-level only; individual resource details live in those files)
- Brief explanation of how to use the resources (browse → find a resource → follow its install instructions)

### `mcps/README.md`
Initial list covers two MCPs: **Docker** and **MongoDB**. For each:
- Short description of what it does
- Prerequisites
- JSON config block ready to paste into `settings.json` (mcpServers)
- Link to the official repository

### `skills/README.md`
- Index table of personal creations with links to their subdirectory
- Recommendations section: external skills with name, description, install command, source link
- OWASP skill listed here: `agamm/claude-code-owasp`, curl install command, what it covers (OWASP Top 10 2025, ASVS 5.0, Agentic AI risks)

### `skills/gitflow/SKILL.md` (installable skill)
A Claude Code skill file following the standard format:
- **Frontmatter** (two keys only):
  - `name`: `gitflow` — used by the skill loader
  - `description`: one sentence describing when to activate this skill (this doubles as the trigger condition recognized by the agent)
- **Body**: Gitflow rules the agent must follow:
  - Branch model: `main` (production), `develop` (integration), `feature/*`, `release/*`, `hotfix/*`
  - Naming conventions for each branch type
  - Merge rules: always `--no-ff` to preserve history and enable clean reverts
  - Tagging on `main` after every release/hotfix merge (semantic versioning)
  - Full step-by-step workflow for each branch type: feature, release, hotfix
- Source: https://nvie.com/posts/a-successful-git-branching-model/ and https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow

### `skills/gitflow/README.md`
- What the skill does
- Install command: `cp skills/gitflow/SKILL.md ~/.claude/skills/gitflow/SKILL.md` (create the directory first)
- Example of when it triggers (e.g. "use gitflow to create a feature branch")
- Link to source documentation

## Design Decisions

- **Flat markdown over site generator**: readable directly on GitHub, zero tooling, easy to contribute
- **One file per personal creation**: allows the file to be the installable artifact itself
- **Recommendations stay in README**: no dedicated files for external resources, keeps the repo lean
- **Medium detail level**: description + prerequisites + install config/command + example
