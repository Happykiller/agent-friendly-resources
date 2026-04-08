# Design : Migration MCP server en mode HTTP

**Date :** 2026-04-08  
**Scope :** fiscal-fr — plugin Claude Code

---

## Contexte

Le serveur MCP tourne actuellement en mode **stdio** : Claude Code démarre un nouveau processus à chaque session via `.mcp.json` (`command: node`). Le code supporte déjà les deux transports (`StdioServerTransport` et `StreamableHTTPServerTransport`), mais seul stdio est activé côté plugin.

L'objectif est de basculer le plugin en mode **HTTP** : le serveur tourne en arrière-plan, Claude Code s'y connecte via URL.

---

## Décisions

| Question | Décision |
|---|---|
| Démarrage du serveur | Manuel (`npm run dev:http`) avant chaque session |
| Config stdio | Supprimée — remplacement complet par HTTP |
| Variables d'environnement | Fichier `.env` chargé via `--env-file` natif Node.js |

---

## Architecture cible

```
[Claude Code plugin]
        │
        │ HTTP POST /mcp
        ▼
[fiscal-fr MCP server — port 3333]
  démarré manuellement : npm run dev:http
  config : mcp-server/.env
```

---

## Changements

### 1. `.mcp.json`

Remplacer le bloc `command`/`args`/`env` par une URL :

```json
{
  "mcpServers": {
    "fiscal-fr-local": {
      "url": "http://localhost:3333/mcp"
    }
  }
}
```

### 2. `mcp-server/package.json` — script `dev:http`

```json
"dev:http": "MCP_TRANSPORT=http tsx --env-file=.env src/index.ts"
```

`MCP_TRANSPORT=http` reste inline (discriminant de mode, pas une valeur à personnaliser).  
Le reste de la config vient du `.env`.

### 3. `mcp-server/.env` (non commité)

```env
MCP_PORT=3333
MCP_LOG_LEVEL=debug
MCP_LOG_FILE=../logs/mcp-server-{date}.log
MCP_LOG_STDERR=true
```

### 4. `mcp-server/.env.example` (commité)

Même contenu que `.env`, sert de référence.

### 5. `.gitignore`

Ajouter `mcp-server/.env`.

---

## Ce qui ne change pas

- Le code TypeScript de `index.ts` — `startHttpServer()` est déjà implémenté
- Le port 3333 par défaut
- `start-mcp.js` — gardé tel quel (stdio, pour référence ou rollback)

---

## Workflow d'utilisation post-migration

```bash
# 1. Démarrer le serveur (une fois par session)
cd mcp-server && npm run dev:http

# 2. Ouvrir Claude Code — le plugin se connecte automatiquement à http://localhost:3333/mcp
```

---

## Hors périmètre

- Authentification HTTP (pas nécessaire en local)
- Déploiement distant
- Mode démon / auto-restart
