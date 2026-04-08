# Demarrage — Claude Code (CLI / desktop)

**Prerequis** : Node.js 20+, npm, Claude Code installe.

Voir aussi : [Demarrage — Claude.ai web](./START_CLAUDE_WEB.md)

## 1. Recuperer le plugin et installer les dependances

```bash
git clone <url-du-repo>
npm ci --prefix fiscal-fr/mcp-server
```

## 2. Lancer Claude Code avec le plugin

```bash
claude --plugin-dir ./fiscal-fr
```

Commande a lancer depuis le dossier parent de `fiscal-fr`.

Le fichier `.mcp.json` present a la racine configure automatiquement le connecteur MCP HTTP (`https://kalifa.happykiller.net/mcp`).

## 3. Verifier que le plugin est charge

```text
/help
```

Le skill doit apparaitre : `/fiscal-fr:assistant-fiscal`.

Verification optionnelle du connecteur MCP :

```text
/mcp
```

Si les commandes n'apparaissent pas :

```text
/reload-plugins
```

## 4. Demarrer l'assistant

```text
/fiscal-fr:assistant-fiscal
```

Ou directement en langage naturel :

```
Je suis celibataire, salarie. Aide-moi a preparer ma declaration.
```

## Commandes disponibles

```text
/fiscal-fr:assistant-fiscal [mode]
/fiscal-fr:start [mode]
/fiscal-fr:help
/fiscal-fr:infos
```

Modes de `/fiscal-fr:assistant-fiscal` : `qualification`, `arbitrages`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

Modes de `/fiscal-fr:start` : `qualification`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

## Commandes de developpement

```bash
# Installer les dependances
npm ci --prefix mcp-server

# Lancer en mode dev stdio
npm run dev --prefix mcp-server

# Lancer en mode dev HTTP
npm run dev:http --prefix mcp-server

# Compiler
npm run build --prefix mcp-server

# Tests
npm test --prefix mcp-server
```
