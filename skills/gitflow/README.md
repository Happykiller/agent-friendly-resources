# gitflow skill

A Claude Code skill that enforces the [Gitflow branching workflow](https://nvie.com/posts/a-successful-git-branching-model/) in your agent.

## What it does

When activated, the agent will:
- Follow the Gitflow branch model (`main`, `develop`, `feature/*`, `release-*`, `hotfix-*`)
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
