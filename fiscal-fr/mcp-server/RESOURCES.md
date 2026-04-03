# MCP Resources and Tools

This document describes what the `fiscal-fr` MCP server currently exposes.

## Transport

- Default mode: `stdio` (used by Claude Code plugin runtime)
- HTTP mode for manual testing: `MCP_TRANSPORT=http` on `http://localhost:3333/mcp`
- Recommended command for HTTP mode:

```bash
npm run dev:http
```

## MCP resources

The server currently does **not** expose MCP resources (`resources/list`, `resources/read`).

- Registered resources: none
- Resource templates: none

The functional surface is currently provided through MCP tools.

## MCP tools

### `qualify_tax_profile`

Qualifies a basic French tax profile and returns a source-backed payload for MVP scope handling.

#### Input schema

Required fields:
- `householdStatus`: `single | married | civil_union | divorced | widowed`
- `dependentsCount`: integer `>= 0`
- `incomeTypes`: array of
  - `salary`
  - `pension`
  - `bank_interest`
  - `rental_income`
  - `bic_bnc`
  - `foreign_income`
  - `crypto`
  - `other`

Optional fields:
- `charges`: array of `donations | childcare | home_services | alimony | none | other`
- `events`: array of strings

#### Output payload

The tool returns a JSON object serialized in `content[0].text` with:
- `factsConfirmed`: string[]
- `hypotheses`: string[]
- `pointsToConfirm`: string[]
- `complexity`: `simple | monitor | out_of_scope`
- `mvpDecision`: `supported | supported_with_caution | human_review`
- `nextQuestions`: string[]
- `detectedTopics`: string[]
- `suggestedCaseCodes`: string[]
- `requiredDocuments`: string[]
- `onlineUiHints`: string[]
- `knowledgeRecommendations`: list of matched rules with confidence + sources
- `sourceCoverage`: campaign, source analysis policy, and deduplicated `sourcesUsed`

#### Knowledge source policy

- Active knowledge rules and corpus are loaded from `mcp-server/src/data/qualify-tool.db.json`
- This file is curated from `mcp-server/assets/` with a strict traceability policy:
  - explicit official URLs only
  - priority to `impots.gouv.fr`
  - `service-public.gouv.fr` as secondary official source
  - ambiguous/non-traceable extracts are not promoted to active rules

#### Architecture note (hexagonal POC)

- Use case: `mcp-server/src/usecases/domains/qualify-tool/qualify-tax-profile.usecase.ts`
- Repository port: `mcp-server/src/usecases/domains/qualify-tool/qualify-tool.repository.ts`
- DB adapter port: `mcp-server/src/adapters/db/db.abstract.ts`
- JSON DB adapter: `mcp-server/src/adapters/db/db.json.ts`
- JSON repository implementation: `mcp-server/src/adapters/db/qualify-tool.repository.json.ts`
- DI container: `mcp-server/src/inversify.ts`

#### Validation errors

On invalid input, the tool returns:
- `isError: true`
- `content[0].text` containing:
  - `error: "INVALID_INPUT"`
  - Zod validation details

## Quick manual test

Use `mcp-server/test.http` with the VS Code REST Client extension.
