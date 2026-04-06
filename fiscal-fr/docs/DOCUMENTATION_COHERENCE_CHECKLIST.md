# Check-list coherence documentaire (fiscal-fr)

Objectif: eviter les ecarts entre produit, orchestration, serveur MCP et base documentaire,
sans alourdir le flux de livraison.

## Quand l'utiliser

- avant une PR qui touche le perimetre fonctionnel,
- avant une release documentaire,
- apres ajout/modification d'un tool MCP.

## Check-list rapide

- [ ] **Reference de perimetre**: `README.md` est aligne avec les modes/outils reels.
- [ ] **Plan d'execution**: statuts et livrables a jour dans `docs/PLAN_IMPLEMENTATION_MVP.md` (et `docs/PLAN_IMPLEMENTATION_MATURITE.md` si post-MVP).
- [ ] **Orchestration**: `skills/assistant-fiscal/SKILL.md` appelle les bons tools dans le bon ordre.
- [ ] **Agents**: les fichiers `agents/*.md` restent strictement specialises et compatibles avec l'orchestrateur.
- [ ] **Surface MCP**: `mcp-server/src/index.ts`, `mcp-server/README.md` et `mcp-server/RESOURCES.md` listent le meme set de tools.
- [ ] **Schemas IO**: les schemas de `getToolSchema` / `validateInput` correspondent a la doc exposee.
- [ ] **Regles metier**: aucune regle hardcodee en usecase si elle doit vivre en JSON (`src/data/*.db.json`).
- [ ] **Traçabilite sources**: chaque regle active pointe vers des sources officielles (URL explicites).
- [ ] **Cohérence affichage/technique**: separer labels utilisateur et codes techniques (cases, enums).
- [ ] **Cas hors perimetre**: refus propre + recommandation revue humaine explicite.

## Verifications express (5 minutes)

1. Lister les tools reels via `mcp-server/src/index.ts`.
2. Verifier qu'ils sont tous documentes dans `mcp-server/README.md` et `mcp-server/RESOURCES.md`.
3. Verifier les references de plans dans `AGENTS.md` et `docs/AGENT_IMPLEMENTATION_GUIDE.md`.
4. Lancer `npm test --prefix mcp-server`.

## Regle d'or

Si le perimetre change: mettre a jour dans la meme PR, au minimum:

- `README.md`
- `docs/PLAN_IMPLEMENTATION_MVP.md`
- `skills/assistant-fiscal/SKILL.md` (si orchestration impactee)
- docs MCP (`mcp-server/README.md`, `mcp-server/RESOURCES.md`) si un tool change
