# AGENTS.md

Ce fichier décrit les agents du plugin Claude Code `fiscal-fr` et les conventions de rédaction.

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

## Orchestration attendue

Le skill `skills/assistant-fiscal/SKILL.md` pilote les interactions utilisateur.

Pour la qualification fiscale, l'orchestrateur doit s'appuyer sur `tax-qualifier` avant de conclure.

## Ajouter un nouvel agent

1. Créer `agents/<nouvel-agent>.md`.
2. Définir un rôle spécialisé et non redondant.
3. Décrire explicitement les limites et cas hors périmètre.
4. Définir un format de sortie clair et stable.
5. Mettre à jour le skill orchestrateur si ce nouvel agent doit être invoqué.

## Vérification rapide

Avant commit :
- vérifier que le frontmatter est valide,
- vérifier que la mission est testable sur un cas simple,
- vérifier que la sortie est compatible avec l'orchestrateur.
