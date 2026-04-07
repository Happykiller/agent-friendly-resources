# fiscal-fr MCP Server

README technique du serveur MCP local utilise par le plugin `fiscal-fr`.

## Prerequis

- Node.js 20+
- npm

## Installation

Depuis la racine du repo:

```bash
npm ci --prefix mcp-server
```

## Lancer le serveur

### Mode stdio (runtime plugin)

```bash
npm run dev --prefix mcp-server
```

Ce mode est celui attendu par Claude Code quand le plugin est charge.

### Logs serveur (fichier)

Le serveur peut ecrire ses logs dans un fichier via variables d'environnement:

- `MCP_LOG_FILE` : chemin du fichier de logs (defaut `./logs/mcp-server.log`)
- `MCP_LOG_LEVEL` : niveau minimum (`debug`, `info`, `warn`, `error`), defaut `info`
- `MCP_LOG_STDERR` : `true|false` pour garder/couper la sortie sur stderr, defaut `true`
- `MCP_LOG_ROTATE_DAILY` : `true|false` pour rotation quotidienne, defaut `true`
- `MCP_ACCOUNT_HEADER` : header HTTP principal pour identifier le compte appelant, defaut `x-user-account`
- `MCP_STDIO_ACCOUNT` : identifiant compte a afficher en mode stdio, defaut `stdio`

Quand la rotation quotidienne est active, le logger ecrit dans un fichier date:

- `./logs/mcp-server.log` devient `./logs/mcp-server-YYYY-MM-DD.log`
- si `MCP_LOG_FILE` contient `{date}`, le placeholder est remplace (ex: `./logs/mcp-{date}.log`)

Pour chaque sollicitation MCP, les logs incluent `requesterAccount`. En HTTP, le serveur tente de le resoudre depuis les headers (`MCP_ACCOUNT_HEADER`, puis fallbacks usuels) ou depuis un JWT Bearer si present.

Exemple:

```bash
MCP_LOG_FILE=./logs/mcp-server.log MCP_LOG_LEVEL=info npm run dev --prefix mcp-server
```

### Mode HTTP (test manuel)

```bash
npm run dev:http --prefix mcp-server
```

Endpoint: `http://localhost:3333/mcp`

## Tester

### Tests unitaires

```bash
npm test --prefix mcp-server
```

### Build

```bash
npm run build --prefix mcp-server
```

Le build compile TypeScript puis copie les DB JSON runtime dans `dist/data`.

### Test manuel MCP (HTTP)

Fichier de requetes: `mcp-server/test.http`

Ce fichier couvre:

- `tools/list`
- `tools/call` pour `qualify_tax_profile`
- `tools/call` pour `list_supporting_documents`
- `tools/call` pour `detect_review_points`
- `tools/call` pour `build_pre_declaration`
- `tools/call` pour `estimate_impact`
- `tools/call` pour `guide_filing_step`
- un cas `INVALID_INPUT`

## Tools exposes

- `qualify_tax_profile`
- `list_supporting_documents`
- `detect_review_points`
- `build_pre_declaration`
- `estimate_impact`
- `guide_filing_step`

Pour les schemas d'entree/sortie et la politique de sources, voir `mcp-server/RESOURCES.md`.

## Donnees runtime

Les regles chargees au runtime sont dans:

- `mcp-server/src/data/qualify-tool.db.json`
- `mcp-server/src/data/list-supporting-documents.db.json`
- `mcp-server/src/data/detect-review-points.db.json`
- `mcp-server/src/data/build-pre-declaration.db.json`
- `mcp-server/src/data/estimate-impact.db.json`
- `mcp-server/src/data/guide-filing.db.json`

Ces DB sont alimentees a partir des assets documentaires du repo:

- `assets/`
