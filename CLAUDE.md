# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a curated collection of MCPs, Claude Code skills, and personal creations for AI-assisted development. It serves both as a personal reference and a community resource.

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

## Development Notes

- Main branch for PRs: `develop`
- No build system or test runner — this is a pure markdown/content repository
