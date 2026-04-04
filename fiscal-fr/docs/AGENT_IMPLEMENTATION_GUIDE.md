# Guide d'implémentation d'un agent Claude

Ce document aide à créer ou faire évoluer un agent dans `fiscal-fr`.

## 1) Lire avant d'écrire

Avant toute modification d'agent :

1. Lire `README.md` pour le périmètre fonctionnel.
2. Lire `docs/PLAN_IMPLEMENTATION.md` pour l'état d'avancement et les phases.
3. Vérifier `AGENTS.md` pour les conventions obligatoires.

## 2) Contrat minimum d'un agent

Chaque fichier `agents/<nom-agent>.md` doit contenir :

- frontmatter YAML : `name`, `description`, `tools`, `model`,
- section `Mission`,
- section périmètre (ce que l'agent fait / ne fait pas),
- format de sortie stable si requis.

## 3) Règles de comportement

- Toujours distinguer : faits, hypothèses, points à confirmer.
- Ne pas inventer de règle fiscale, case, formulaire ou éligibilité.
- S'appuyer sur les tools MCP pour la logique déterministe.
- Si cas hors périmètre : refus propre + recommandation de revue humaine.
- Rester progressif dans les questions.
- Séparer systématiquement:
  - ce qui est affiché à l'utilisateur (libellés métier),
  - ce qui est transporté techniquement dans MCP (codes, enums, identifiants).

## 4) Intégration orchestrateur

Quand un nouvel agent est ajouté :

- vérifier si `skills/assistant-fiscal/SKILL.md` doit l'appeler,
- documenter le moment d'appel dans le flux conversationnel,
- éviter les chevauchements de responsabilité entre agents.

## 5) Checklist avant commit

- frontmatter valide,
- mission testable sur un cas simple,
- format de sortie conforme à l'orchestrateur,
- cohérence avec le périmètre fonctionnel du README,
- mise à jour de `docs/PLAN_IMPLEMENTATION.md` si impact roadmap,
- pas de promesse hors périmètre MVP.
