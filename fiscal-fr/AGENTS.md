# AGENTS.md

Ce fichier décrit les agents du plugin Claude Code `fiscal-fr` et les conventions de rédaction.

## Sources de vérité documentaire

Pour éviter les écarts entre produit, implémentation et agents, appliquer cette hiérarchie :

1. `README.md` : référence fonctionnelle (périmètre utilisateur, cas couverts, limites).
2. `docs/PLAN_IMPLEMENTATION.md` : référence d'exécution (phases, statut DONE|PARTIAL|TODO, reste à faire).
3. `docs/AGENT_IMPLEMENTATION_GUIDE.md` : aide pratique pour créer/faire évoluer un agent Claude.

Quand le périmètre fonctionnel change, mettre à jour **README + plan** dans la même PR.

## Objectif du projet

`fiscal-fr` est un plugin MVP d'assistance à la préparation de déclaration de revenus française.

Le plugin s'appuie sur :
- un orchestrateur (skill `assistant-fiscal`),
- des agents spécialisés (dossier `agents/`),
- un serveur MCP local (`mcp-server/`).

## Emplacement des agents

Chaque agent spécialisé vit dans `agents/<nom-agent>.md`.

Exemple actuel :
- `agents/tax-qualifier.md`
- `agents/documents-checklist.md`
- `agents/review-points.md`

## Contrat d'un agent

Chaque fichier agent doit inclure :
- un frontmatter YAML (`name`, `description`, `tools`, `model`),
- une section `Mission` claire,
- un périmètre explicite (ce que l'agent fait / ne fait pas),
- un format de sortie imposé quand nécessaire.

## Conventions de conception

- **Périmètre strict** : un agent ne doit traiter qu'un sous-problème précis.
- **Pas de sur-promesse** : ne jamais prétendre couvrir un cas complexe non supporté.
- **Traçabilité** : distinguer faits, hypothèses et points à confirmer.
- **Sécurité métier** : pas de calcul fiscal inventé, pas de conseil définitif hors périmètre.
- **Sortie actionnable** : produire des résultats structurés, exploitables par l'orchestrateur.
- **Séparation affichage/valeur** : distinguer les libellés lisibles utilisateur des codes/valeurs techniques MCP (enum, codes de cases, identifiants formulaires).

## Consignes produit et UX à respecter

- **Progressivité** : ne pas poser 100 questions d'un coup, avancer par étapes.
- **Transparence** : toujours distinguer faits, hypothèses, points à confirmer.
- **Refus propre** : signaler clairement les cas hors périmètre et recommander revue humaine.
- **Discipline outillée** : la logique fiscale déterministe doit vivre dans les tools MCP, pas dans des suppositions LLM.
- **Ton** : professionnel, rassurant, structuré, non juridique, non verbeux.

## Orchestration attendue

Le skill `skills/assistant-fiscal/SKILL.md` pilote les interactions utilisateur.

Pour la qualification fiscale, l'orchestrateur doit s'appuyer sur `tax-qualifier` avant de conclure.
Pour la phase justificatifs, l'orchestrateur doit s'appuyer sur `documents-checklist` apres appel de `list_supporting_documents`.
Pour la phase points de vigilance, l'orchestrateur doit s'appuyer sur `review-points` apres appel de `detect_review_points`.

L'orchestrateur doit suivre le fil conversationnel cible :

1. cadrage,
2. qualification,
3. justificatifs,
4. points de vigilance,
5. pré-déclaration,
6. estimation indicative,
7. copilote de saisie,
8. contrôle final.

## Ajouter un nouvel agent

1. Créer `agents/<nouvel-agent>.md`.
2. Définir un rôle spécialisé et non redondant.
3. Décrire explicitement les limites et cas hors périmètre.
4. Définir un format de sortie clair et stable.
5. Mettre à jour le skill orchestrateur si ce nouvel agent doit être invoqué.
6. Mettre à jour la documentation associée si le périmètre fonctionnel est impacté (`README.md`, `docs/PLAN_IMPLEMENTATION.md`).

## Architecture du serveur MCP — règle obligatoire

Toute donnée ou règle métier utilisée par un usecase **doit passer par la chaîne complète** :

```
src/data/<nom>.db.json       ← données/règles (source de vérité)
    ↓
DbAdapter (db.abstract.ts)   ← port : déclare getX()
    ↓
JsonDbAdapter (db.json.ts)   ← lit + valide le JSON via Zod au démarrage, cache en mémoire
    ↓
QualifyToolRepository        ← port domaine : déclare getX()
    ↓
JsonQualifyToolRepository    ← délègue au DbAdapter
    ↓
Inversify (inversify.ts)     ← câble les dépendances
    ↓
Usecase                      ← reçoit le repository par injection, appelle this.repository.getX()
```

**Interdit** : hardcoder des règles, des valeurs métier ou des listes de référence directement dans le code TypeScript d'un usecase.

**Obligatoire** : pour chaque nouveau jeu de règles/données, créer ou étendre :
1. `src/data/<nom>.db.json` — les données
2. Le schéma Zod correspondant dans `db.json.ts` (validation au chargement)
3. Le type TypeScript dans `qualify-tool.types.ts`
4. La méthode `getX()` dans `DbAdapter`, `QualifyToolRepository`, et `JsonQualifyToolRepository`
5. Le usecase utilise `this.repository.getX()` uniquement

## Vérification rapide

Avant commit :
- vérifier que le frontmatter est valide,
- vérifier que la mission est testable sur un cas simple,
- vérifier que la sortie est compatible avec l'orchestrateur.
