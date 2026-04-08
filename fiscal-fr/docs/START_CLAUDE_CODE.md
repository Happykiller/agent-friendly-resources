# Demarrage — Claude Code (CLI / desktop)

**Prerequis** : Node.js 20+, npm, Claude Code installe.

## 1. Recuperer le plugin et installer les dependances

```bash
git clone <url-du-repo>
npm ci --prefix fiscal-fr/mcp-server
```

## 2. Lancer Claude Code avec le plugin

```bash
claude --plugin-dir ./fiscal-fr
```

Le fichier `.mcp.json` present a la racine demarre le serveur MCP automatiquement en mode stdio.

## 3. Verifier que le plugin est charge

```text
/help
```

Le skill doit apparaitre : `/fiscal-fr:assistant-fiscal`.

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

Modes : `qualification`, `arbitrages`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

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
