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
