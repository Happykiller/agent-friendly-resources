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

**Source:** [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp)

**Install:**

```bash
curl -sL https://raw.githubusercontent.com/agamm/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md \
  -o ~/.claude/skills/owasp-security/SKILL.md \
  --create-dirs
```
