# Plan unique d'implementation - fiscal-fr

## 1) Cadrage unique

### Objectif

Fournir un plugin MCP d'assistance a la preparation de la declaration de revenus francaise (cas simples), qui qualifie la situation, prepare le dossier, et guide la saisie sans remplacer un conseil fiscal humain.

### Cible

- particulier francais,
- cas standard,
- besoin d'aide pedagogique, progressive et structuree.

### Entrees

- situation familiale,
- revenus,
- charges et credits/reductions,
- evenements de vie,
- pieces justificatives disponibles.

### Sorties

- profil fiscal,
- checklist de documents,
- points de vigilance,
- estimation indicative,
- pre-declaration structuree,
- guide de saisie etape par etape.

### Limites non negociables

- pas de conseil juridique opposable,
- pas de depot automatique,
- pas de prise en charge des cas complexes,
- distinction systematique `faits / hypotheses / points a confirmer`.

## 2) Regles d'architecture (a respecter partout)

### Deterministe (code/regles)

- qualification de base,
- controles de coherence,
- mapping formulaires/rubriques/cases,
- generation des justificatifs,
- estimation simple,
- decisions de blocage et hors perimetre.

Regle de modelisation MCP obligatoire:

- separer les champs "affichage utilisateur" (libelles lisibles) des champs "valeurs techniques" (codes/enum),
- ne jamais deduire un code technique a partir d'un texte libre sans regle explicite,
- dans chaque sortie tool, conserver les deux niveaux quand pertinent:
  - niveau metier lisible (ex: "revenus salariaux"),
  - niveau technique stable (ex: `salary`, case/code formulaire).

### LLM (orchestration/UX)

- reformuler,
- poser les bonnes questions au bon moment,
- expliquer simplement,
- produire des syntheses claires.

### Interdits LLM

- inventer une case ou un formulaire,
- inventer une eligibilite,
- conclure sans regle/source,
- masquer l'incertitude.

## 3) Plan d'execution unique (phases)

## Phase 0 - Socle technique

**Statut actuel: PARTIAL (maj 2026-04-05)**

**A faire**

- finaliser serveur MCP TypeScript (dev/build/test),
- fournir `.mcp.json` exemple projet,
- poser `types/schemas` communs avec validation stricte.

**Livrables**

- serveur compilable et executable,
- contrats d'entrees/sorties pour tous les tools,
- aucun payload libre non valide.

**Definition de done**

- build OK,
- chargement MCP OK,
- validations IO actives.

**Etat constate (maj 2026-04-05)**

- build OK,
- chargement MCP via `.mcp.json` OK,
- validation stricte active pour les 4 tools implementes,
- erreur MCP non-conforme corrigee (`throw Error` → `isError: true`),
- schemas/contrats complets des 6 tools: 4/6 livres.

**Reste a faire pour passer DONE**

- ajouter les schemas d'entree/sortie pour les 2 tools manquants (phases 3-4),
- brancher ces schemas dans l'exposition MCP (`tools/list` + `tools/call`),
- ajouter un test de contrat par tool (validation OK + INVALID_INPUT).

## Phase 1 - Qualification et dossier minimal

**Statut actuel: DONE (maj 2026-04-04)**

**Tools a livrer**

1. `qualify_tax_profile` - **DONE**
2. `list_supporting_documents` - **DONE**
3. `detect_review_points` - **DONE**

**A faire**

- classifier la situation (`simple|monitor|out_of_scope`),
- donner statut (`supported|unsupported|needs_human_review`),
- produire checklist documentaire (`required|recommended|missing`),
- produire points d'attention priorises (`severity`, justification).

**Livrables**

- premier parcours utilisateur utile: cadrage -> qualification -> documents -> vigilance.

**Etat constate (maj 2026-04-04)**

- `qualify_tax_profile` implemente et etendu (salaires, pensions, interets, dividendes, foncier nu, location meublee, micro-entrepreneur),
- `list_supporting_documents` implemente, expose en MCP, bug validation silencieuse corrige,
- `detect_review_points` implemente et expose en MCP :
  - 7 regles deterministes (revenus hors perimetre, evenement bloquant, regime foncier, LMNP/LMP, dons, garde alternee, incoherence declaredAmounts),
  - regles externalisees en JSON (`detect-review-points.db.json`) via la chaine DbAdapter → Repository → Usecase,
  - 13 tests couvrant tous les cas cibles,
- 32 tests au total, 100% verts,
- architecture data-access documentee dans `AGENTS.md`.

**Definition de done**

- cas simples correctement qualifies : OK,
- cas hors perimetre refuses proprement : OK,
- chaque sortie contient faits/hypotheses/points a confirmer : OK.

## Phase 2 - Pre-declaration exploitable

**Statut actuel: DONE (maj 2026-04-05)**

**Tool a livrer**

4. `build_pre_declaration` - **DONE**

**A faire**

- produire un JSON de brouillon structure,
- rattacher chaque valeur a son origine,
- marquer clairement ce qui est confirme vs a confirmer.
- separer explicitement:
  - les rubriques/formulaires presentes a l'utilisateur (libelles),
  - les identifiants techniques internes (codes, enums, references).

**Livrables**

- pre-declaration directement exploitable en conversation et en controle final.

**Definition de done**

- aucune rubrique sans source,
- sortie stable et affichable telle quelle.
- aucune confusion entre libelle utilisateur et valeur technique.

**Etat constate (maj 2026-04-05)**

- `build_pre_declaration` implemente et expose en MCP :
  - 11 mappings de rubriques (salary, pension, bank_interest, dividends, rental_income, furnished_rental, micro_entrepreneur, donations, childcare, home_services, alimony),
  - chaque rubrique tracee : label lisible, code case, amountKey technique, origine documentaire, sourceUrls,
  - statut par rubrique : `confirmed` (montant declare) ou `to_confirm` (montant absent),
  - sections ordonnees : revenus_activite → revenus_capitaux → revenus_fonciers → revenus_bic_bnc → charges_deductions,
  - `draftStatus` global : `complete` ou `incomplete`,
  - regles externalisees dans `build-pre-declaration.db.json` via la chaine DbAdapter → Repository → Usecase,
  - 10 tests couvrant tous les cas cibles, 100% verts,
- 42 tests au total, 100% verts,
- mode `predeclaration` du SKILL.md aligne sur le contrat du tool.

## Phase 3 - Estimation prudente

**Statut actuel: DONE (maj 2026-04-05)**

**Tool a livrer**

5. `estimate_impact` - **DONE**

**Etat constate (maj 2026-04-05)**

- `estimate_impact` implemente et expose en MCP :
  - bareme IR 2026 progressif (5 tranches, CGI art. 197),
  - quotient familial avec plafonnement (1 807 €/demi-part, 4 262 € parent isole),
  - abattements : salaires 10% (plancher 509€, plafond 14 555€), pensions 10% (plancher 454€, plafond 4 439€), micro-foncier 30%, dividendes barème 40%, micro-entrepreneur (BIC vente 71%, services 50%, BNC 34%),
  - decote : celibataire (seuil 1 982€, base 897€) et couple (seuil 3 277€, base 1 483€),
  - PFU 31,4% (12,8% IR + 18,6% PS) sur revenus du capital hors option bareme,
  - reductions dons 66%/75% Coluche (plafond 2 000€ depuis 14/10/2025),
  - credits garde enfant (50%, plaf. 3 500€/enfant) et emploi domicile (50%, plaf. 12 000€+),
  - CEHR/CDHR (3% et 4% selon seuils),
  - disclaimer indicatif systematique + warnings contextuels,
  - regles externalisees dans `estimate-impact.db.json` (7 sources primaires officielles, haute confiance),
  - 15 tests couvrant tous les cas cibles, 100% verts,
- 57 tests au total, 100% verts.

**Limites du perimetre MVP**

- pensions alimentaires deduites de facon simplifiee (pas de plafonnement CGI art. 156),
- micro-entrepreneur : abattement BIC services 50% par defaut (warning si type different),
- RFR pour CDHR calcule hors revenus PFU (warning explicite),
- pas de gestion de l'imposition separee des epoux, ni des revenus exceptionnels.

## Phase 4 - Copilote de saisie

**Statut actuel: TODO (maj 2026-04-04)**

**Tool a livrer**

6. `guide_filing_step` - **TODO**

**A faire**

- guider ecran par ecran selon contexte,
- indiquer: a verifier maintenant, oublis frequents, pieges,
- conserver la logique "guide sans faire a la place".

**Livrables**

- accompagnement operationnel pendant la saisie sur impots.gouv.fr.

**Definition de done**

- pour une etape donnee, la checklist est immediate, priorisee et actionnable.

**Reste a faire pour passer DONE**

- implementer le tool `guide_filing_step`,
- definir l'entree minimale (`currentStep`, `knownContext`),
- structurer la sortie (a verifier maintenant / oublis / pieges),
- valider sur 3 ecrans types de saisie.

## Phase 5 - Orchestration et tests

**Statut actuel: PARTIAL (maj 2026-04-05)**

**A faire**

- stabiliser `SKILL.md` (ordre d'appel des tools, ton, limites, refus),
- couvrir minimum 10 scenarios metier,
- verifier le parcours complet conversationnel.

**Scenarios minimum**

1. celibataire salarie simple,
2. couple avec enfant,
3. dons,
4. emploi a domicile,
5. interets bancaires,
6. donnees incoherentes,
7. cas complexe rejete,
8. justificatifs manquants,
9. estimation incomplete,
10. guidage ecran par ecran.

**Definition de done**

- tests verts,
- parcours complet executable de l'ouverture au controle final,
- README utilisateur + exemple `.mcp.json` presents.

**Etat constate (maj 2026-04-05)**

- `SKILL.md` aligne sur les 3 tools Phase 1 : modes `qualification`, `justificatifs`, `vigilance` presents,
- agent `tax-qualifier` present (reformulation qualification),
- agent `documents-checklist` present (restitution justificatifs),
- agent `review-points` present (restitution points de vigilance) — **nouveau**,
- `detect_review_points` integre dans l'orchestrateur (`SKILL.md` mode `vigilance`) — **nouveau**,
- parcours cadrage -> qualification -> justificatifs -> vigilance -> predeclaration orchestrable de bout en bout,
- orchestration complete des 6 tools impossible tant que les tools phases 3-4 ne sont pas livres,
- tests automatises : 42 tests unitaires verts (qualification, documents, points de vigilance, pre-declaration),
- tests de parcours multi-tools : non livres.

**Reste a faire pour passer DONE**

- aligner `SKILL.md` avec les 6 tools une fois implementes (phases 2-4),
- ajouter au moins 10 tests metier automatises de parcours,
- verifier le parcours conversationnel complet de l'ouverture au controle final,
- valider les cas hors perimetre et refus propres.

## 4) Sequence d'usage cible (reference produit)

1. ouverture et cadrage,
2. qualification,
3. justificatifs,
4. points de vigilance,
5. pre-declaration,
6. estimation indicative,
7. mode copilote de saisie,
8. controle final avant validation.

## 5) Definition finale de done MVP

Le MVP est "Done" uniquement si:

- Claude Code charge le serveur MCP sans manipulation speciale,
- les 6 tools sont implementes et stables,
- toutes les entrees/sorties sont validees,
- les cas hors perimetre sont refuses proprement,
- les reponses distinguent toujours faits/hypotheses/points a confirmer,
- au moins 10 tests metier passent,
- la doc client (`README.md`) et la doc d'implementation (ce fichier) sont a jour.
