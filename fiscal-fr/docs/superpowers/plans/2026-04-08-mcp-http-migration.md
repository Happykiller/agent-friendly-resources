# MCP HTTP Transport Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer le plugin fiscal-fr pour qu'il se connecte au serveur MCP via HTTP au lieu de stdio.

**Architecture:** Le serveur MCP (déjà capable de HTTP) est démarré manuellement via `npm run dev:http` depuis `mcp-server/`. Claude Code se connecte ensuite à `http://localhost:3333/mcp`. La config stdio est supprimée du `.mcp.json`.

**Tech Stack:** Node.js 20.6+, tsx, MCP SDK `@modelcontextprotocol/sdk` (StreamableHTTPServerTransport déjà implémenté)

---

### Task 1: Créer `mcp-server/.env` et `.env.example`

**Files:**
- Create: `mcp-server/.env`
- Create: `mcp-server/.env.example`

- [ ] **Step 1: Créer `mcp-server/.env`**

Ce fichier contient la config locale du serveur HTTP. Il ne sera pas commité.

```
MCP_PORT=3333
MCP_LOG_LEVEL=debug
MCP_LOG_FILE=../logs/mcp-server-{date}.log
MCP_LOG_STDERR=true
```

- [ ] **Step 2: Créer `mcp-server/.env.example`**

Copie identique, sert de référence pour les autres contributeurs.

```
MCP_PORT=3333
MCP_LOG_LEVEL=debug
MCP_LOG_FILE=../logs/mcp-server-{date}.log
MCP_LOG_STDERR=true
```

- [ ] **Step 3: Vérifier que les deux fichiers existent**

```bash
ls mcp-server/.env mcp-server/.env.example
```

Expected: les deux fichiers listés, pas d'erreur.

---

### Task 2: Exclure `.env` du suivi git

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Ajouter `mcp-server/.env` au `.gitignore`**

Contenu actuel de `.gitignore` :
```
node_modules/
dist/
*.log
*.tmp
/.DS_Store
CODEX.md
GEMINI.md
CLAUDE.md
```

Ajouter à la fin :
```
mcp-server/.env
```

- [ ] **Step 2: Vérifier que git ignore bien le `.env`**

```bash
git status mcp-server/.env
```

Expected: le fichier n'apparaît pas dans les fichiers suivis (ou apparaît en "ignored").

- [ ] **Step 3: Commiter**

```bash
git add .gitignore mcp-server/.env.example
git commit -m "chore: add .env support for MCP HTTP mode"
```

---

### Task 3: Mettre à jour le script `dev:http`

**Files:**
- Modify: `mcp-server/package.json`

- [ ] **Step 1: Mettre à jour le script `dev:http`**

Ligne actuelle dans `mcp-server/package.json` :
```json
"dev:http": "MCP_TRANSPORT=http MCP_PORT=3333 tsx src/index.ts"
```

Remplacer par :
```json
"dev:http": "MCP_TRANSPORT=http tsx --env-file=.env src/index.ts"
```

`MCP_TRANSPORT=http` reste inline (discriminant de mode).  
`MCP_PORT`, `MCP_LOG_LEVEL`, etc. viennent maintenant du `.env`.

- [ ] **Step 2: Vérifier que le serveur démarre correctement**

Depuis le répertoire `mcp-server/` :
```bash
npm run dev:http
```

Expected dans les logs :
```
{"level":"info","message":"HTTP MCP server started","endpoint":"http://localhost:3333/mcp"}
```

Arrêter avec `Ctrl+C`.

- [ ] **Step 3: Commiter**

```bash
git add mcp-server/package.json
git commit -m "chore: update dev:http to load config from .env file"
```

---

### Task 4: Migrer `.mcp.json` vers le transport HTTP

**Files:**
- Modify: `.mcp.json`

- [ ] **Step 1: Remplacer la config stdio par l'URL HTTP**

Contenu actuel de `.mcp.json` :
```json
{
  "mcpServers": {
    "fiscal-fr-local": {
      "command": "node",
      "args": [
        "-e",
        "require(require('path').join(process.cwd(), 'fiscal-fr', 'start-mcp.js'))"
      ],
      "env": {
        "MCP_PROFILE": "debug",
        "MCP_LOG_FILE": "./logs/mcp-server-{date}.log",
        "MCP_LOG_STDERR": "true"
      }
    }
  }
}
```

Remplacer par :
```json
{
  "mcpServers": {
    "fiscal-fr-local": {
      "url": "http://localhost:3333/mcp"
    }
  }
}
```

- [ ] **Step 2: Vérifier la connexion plugin → serveur**

1. Démarrer le serveur en arrière-plan :
   ```bash
   cd mcp-server && npm run dev:http &
   ```
2. Tester manuellement la connexion HTTP :
   ```bash
   curl -s -X POST http://localhost:3333/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' | head -c 200
   ```
   Expected: une réponse JSON contenant `"tools"` avec la liste des outils.
3. Arrêter le serveur :
   ```bash
   kill %1
   ```

- [ ] **Step 3: Commiter**

```bash
git add .mcp.json
git commit -m "feat: migrate plugin MCP transport from stdio to HTTP"
```

---

## Vérification finale

Workflow complet post-migration :

```bash
# Terminal 1 — démarrer le serveur
cd mcp-server && npm run dev:http

# Terminal 2 — ouvrir Claude Code (le plugin se connecte à http://localhost:3333/mcp)
# Vérifier dans l'UI que le MCP "fiscal-fr-local" est bien connecté
```
