# Plan d'implementation - fiscal-fr - Lots post-MVP

*Document de reference pour Claude Code*
*Cree le 2026-04-06, source de verite pour les lots 1 a 8*

---

## 0) Cadrage general post-MVP

### Objectif

Faire evoluer l'assistant fiscal d'un **outil de conformite** (lot 0) vers un **assistant d'optimisation** capable de :
- comparer les options declaratives,
- detecter les avantages oublies,
- simuler des scenarios,
- guider les arbitrages.

### Principes constants

- pas de conseil juridique opposable,
- pas de depot automatique,
- distinction systematique `faits / hypotheses / points a confirmer`,
- toute optimisation est conditionnelle a la situation et aux donnees fournies,
- les arbitrages sont deterministes (code/DB), jamais LLM,
- le LLM orchestre, reformule, explique — il n'invente jamais une regle.

### Architecture conservee

- architecture hexagonale : DbAdapter → Repository → Usecase,
- regles externalisees en `.db.json` via la chaine existante,
- validation Zod stricte sur toutes les entrees/sorties,
- sources officielles tracees dans chaque regle.

### Convention pour chaque lot

Avant chaque phase d'implementation, une etape de **recherche documentaire** est prevue.
Le prompt de recherche est fourni dans ce plan.
Le resultat de la recherche alimente les `.db.json` avant le code.

---

## Lot 1 — Moteur d'arbitrages fiscaux

### Pourquoi maintenant

Le lot 0 calcule mais ne compare pas. L'utilisateur ne sait pas si le PFU, les frais reels, le micro-foncier ou le rattachement sont les meilleurs choix pour lui.
C'est LE lot qui transforme l'assistant de "formulaire intelligent" en "assistant qui fait economiser de l'argent".

### Segments vises

- Epargnant (PFU vs bareme) — impact : 100 a 2 000 €.
- Salarie avec trajets longs (frais reels vs 10%) — impact : 200 a 3 000 €.
- Bailleur micro-foncier (micro vs reel) — impact : 500 a 5 000 €.
- Parent avec enfant majeur (rattachement vs detachement + pension) — impact : 200 a 1 500 €.

### Perimetre fonctionnel

Nouveau tool `compare_tax_options` avec 4 arbitrages :
1. PFU (30%) vs option bareme progressif (globale pour tous les RCM),
2. abattement 10% salaires vs frais reels (montant global fourni par l'utilisateur),
3. micro-foncier (30%) vs regime reel (charges globales fournies),
4. rattachement enfant majeur vs detachement + pension alimentaire deductible.

Extension de `estimate_impact` pour accepter un parametre `scenario` (variantes de calcul).

### Limites explicites

- frais reels : comparaison sur montant total, pas de calcul detaille IK/repas (→ lot 1b),
- foncier reel : comparaison sur charges globales, pas de formulaire 2044 detaille (→ lot 5),
- l'option bareme RCM est globale — warning systematique.

### Definition de done

- 4 arbitrages operationnels avec comparaison chiffree,
- chaque resultat affiche les hypotheses prises et les donnees manquantes,
- 20 tests minimum (5 par arbitrage, incluant egalite et seuils),
- resultats valides manuellement contre le simulateur officiel impots.gouv.fr sur 5 cas.

---

### Etape 1.0 — Recherche documentaire arbitrages

**Action** : lancer le prompt de recherche ci-dessous pour alimenter la base documentaire.

```
<role>
Tu es un fiscaliste senior specialise en impot sur le revenu des particuliers en France,
double d'un ingenieur knowledge qui structure des regles pour un assistant fiscal automatise.
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le MVP (lot 0) calcule l'IR 2026 (bareme progressif, QF, decote, PFU, reductions/credits).
Le lot 1 ajoute un moteur d'arbitrages comparatifs pour 4 options :
1. PFU (30% flat tax, dont 12,8% IR + 17,2% PS) vs option bareme progressif pour les RCM
   (dividendes avec abattement 40%, interets sans abattement).
2. Abattement 10% sur salaires vs frais reels.
3. Micro-foncier (abattement 30%, revenus < 15 000 €) vs regime reel (formulaire 2044).
4. Rattachement d'un enfant majeur au foyer vs detachement avec pension alimentaire deductible.
</contexte>

<tache>
Pour chacun des 4 arbitrages, produis un dossier complet contenant :

A) REGLES DE DECISION
- Conditions d'eligibilite a chaque option.
- Formule de calcul pour chaque branche.
- Seuils de rentabilite (si calculables analytiquement).
- Cas ou une option est systematiquement meilleure.
- Cas ou le choix depend des montants.
- Caractere irrevocable ou revocable de l'option.
- Interactions entre arbitrages (ex : l'option bareme RCM est globale).

B) CASES DECLARATIVES
- Numeros de cases concernees (formulaire 2042, 2042-C, 2044).
- Signification exacte de chaque case.
- Cases a cocher pour exercer l'option.

C) REGLES D'EXCLUSION MUTUELLE
- Quels avantages sont incompatibles entre eux.
- Ex : rattachement enfant majeur exclut la deduction de pension alimentaire pour ce meme enfant.

D) SOURCES OFFICIELLES
- Articles du CGI.
- References BOI pertinentes.
- URL impots.gouv.fr ou service-public.gouv.fr.

E) SCENARIOS DE TEST
- 5 scenarios par arbitrage couvrant : cas favorable option A, cas favorable option B,
  cas d'egalite, cas limite (seuils), cas avec donnees manquantes.
- Pour chaque scenario : donnees d'entree, resultat attendu pour chaque option, option recommandee.

F) ZONES GRISES ET PRUDENCE
- Cas ou l'arbitrage ne peut pas etre automatise.
- Risques de fausse optimisation.
- Donnees minimales necessaires pour que la comparaison soit fiable.
</tache>

<format_attendu>
Pour chaque arbitrage, structure la sortie en JSON exploitable :
{
  "arbitrage_id": "pfu_vs_bareme",
  "rules": [...],
  "cases": [...],
  "exclusions": [...],
  "sources": [...],
  "test_scenarios": [...],
  "warnings": [...]
}
</format_attendu>

<sources_a_privilegier>
- CGI articles 200 A, 158-3-2°, 83, 13, 28, 156-II-2°
- BOI-RPPM-RCM-30-20, BOI-IR-BASE-10-10-10, BOI-RFPI-DECLA, BOI-IR-LIQ-10-10-10
- Brochure pratique IR (impots.gouv.fr)
- service-public.gouv.fr
</sources_a_privilegier>

<sources_a_eviter>
- Forums, blogs non officiels, articles de presse financiere sans source CGI
</sources_a_eviter>

<regles_de_prudence>
- Ne jamais affirmer qu'une option est "toujours meilleure" sans condition.
- Signaler toute interaction entre arbitrages.
- Distinguer "regle stable (CGI)" vs "tolerance administrative (BOI)" vs "pratique non ecrite".
</regles_de_prudence>
```

**Livrable attendu** : fichier `compare-tax-options.research.md` dans `assets/research/`.

---

### Etape 1.1 — Creation du fichier de regles

**Action** : a partir de la recherche documentaire, creer `mcp-server/src/data/compare-tax-options.db.json`.

**Contenu** :
- 4 blocs d'arbitrage, chacun avec :
  - `arbitrageId` (string),
  - `eligibility` (conditions),
  - `formulaA` / `formulaB` (pseudo-formules),
  - `breakEvenRule` (seuil de rentabilite si calculable),
  - `exclusions` (incompatibilites),
  - `caseCodes` (cases declaratives),
  - `sourceUrls` (sources officielles),
  - `warnings` (messages de prudence).

**Definition de done** :
- fichier JSON valide,
- 4 arbitrages documentes,
- chaque regle a au moins 1 source officielle.

---

### Etape 1.2 — Repository et Usecase

**Action** : creer la chaine hexagonale pour le nouveau tool.

**Fichiers a creer** :
- `mcp-server/src/usecases/domains/compare-tax-options/compare-tax-options.usecase.ts`
- `mcp-server/src/usecases/domains/compare-tax-options/compare-tax-options.repository.ts`
- `mcp-server/src/adapters/db/compare-tax-options.repository.json.ts`

**Contenu du usecase** :
- prend en entree le profil fiscal + le type d'arbitrage demande (ou `all`),
- charge les regles depuis le repository,
- pour chaque arbitrage applicable :
  - calcule le resultat option A,
  - calcule le resultat option B,
  - compare,
  - produit la recommandation conditionnelle,
  - liste les hypotheses prises et donnees manquantes.

**Schema de sortie** :
```typescript
interface ComparisonResult {
  arbitrageId: string;
  optionA: { label: string; amount: number; details: string };
  optionB: { label: string; amount: number; details: string };
  difference: number;
  recommendation: 'option_a' | 'option_b' | 'neutral' | 'insufficient_data';
  hypotheses: string[];
  missingData: string[];
  warnings: string[];
  sourceUrls: string[];
}
```

**Definition de done** :
- usecase compile sans erreur,
- injecte dans le conteneur DI.

---

### Etape 1.3 — Logique de calcul par arbitrage

**Action** : implementer les 4 fonctions de comparaison dans le usecase.

**Arbitrage 1 : PFU vs bareme**
- Option A (PFU) : 12,8% IR + 17,2% PS sur (interets + dividendes).
- Option B (bareme) : dividendes avec abattement 40% integres au revenu imposable, interets integres sans abattement, ajouter au revenu imposable, recalculer l'IR, retrancher le credit d'impot de 12,8% deja preleve. PS 17,2% dans les deux cas.
- Warning : option globale (tous les RCM passent au bareme).
- Seuil indicatif : TMI <= 11% → bareme souvent favorable.

**Arbitrage 2 : abattement 10% vs frais reels**
- Option A : abattement 10% (plancher 509 €, plafond 14 555 €).
- Option B : montant de frais reels declare par l'utilisateur.
- Comparaison directe : si frais reels > abattement 10% → option B.
- Warning : les frais reels doivent etre justifiables.

**Arbitrage 3 : micro-foncier vs reel**
- Option A : abattement 30% sur revenus bruts (si < 15 000 €).
- Option B : revenus bruts - charges declarees.
- Comparaison : si charges > 30% des revenus bruts → option B.
- Warning : le reel engage pour 3 ans et s'applique a tous les biens.

**Arbitrage 4 : rattachement enfant majeur vs detachement**
- Option A : rattachement → +0,5 part (ou +1 part a partir du 3eme enfant), plafonnement QF.
- Option B : detachement → deduction pension alimentaire (plafond ~6 674 € par enfant, a verifier campagne 2026).
- Comparaison : calculer l'IR dans les deux cas.
- Warning : le rattachement est irrevocable pour l'annee.

**Definition de done** :
- 4 fonctions de comparaison implementees,
- chaque fonction retourne un `ComparisonResult`.

---

### Etape 1.4 — Tool MCP `compare_tax_options`

**Action** : exposer le usecase comme tool MCP.

**Schema d'entree (Zod)** :
```
{
  householdStatus: enum,
  dependentsCount: number,
  incomeTypes: array,
  // Donnees specifiques par arbitrage :
  salary?: { grossAnnual: number, taxableAnnual: number },
  realExpenses?: { totalAmount: number },
  capitalIncome?: { interests: number, dividends: number },
  rentalIncome?: { grossRevenue: number, totalCharges?: number },
  adultChild?: { childAge: number, pensionPaidAmount?: number },
  // Quels arbitrages lancer :
  requestedArbitrages?: ('pfu_vs_bareme' | 'real_expenses_vs_10pct' | 'micro_vs_real_rental' | 'child_attachment_vs_detachment' | 'all')[]
}
```

**Schema de sortie** :
```
{
  comparisons: ComparisonResult[],
  globalWarnings: string[],
  disclaimer: string
}
```

**Definition de done** :
- tool enregistre dans le serveur MCP,
- validation Zod stricte,
- erreur explicite si donnees insuffisantes pour un arbitrage demande.

---

### Etape 1.5 — Tests

**Action** : creer `mcp-server/src/__tests__/compare-tax-options.test.ts`.

**Cas de test minimum (20)** :

PFU vs bareme (5) :
1. TMI 0% + dividendes 5 000 € → bareme favorable.
2. TMI 30% + dividendes 5 000 € → PFU favorable.
3. TMI 11% + dividendes 10 000 € + interets 2 000 € → bareme favorable.
4. TMI 41% + dividendes 2 000 € → PFU favorable.
5. Pas de RCM → arbitrage non applicable.

Frais reels vs 10% (5) :
1. Salaire 30 000 €, frais reels 4 000 € → frais reels (4 000 > 3 000).
2. Salaire 30 000 €, frais reels 2 000 € → abattement 10% (3 000 > 2 000).
3. Salaire 5 000 €, frais reels 400 € → abattement plancher 509 €.
4. Salaire 150 000 €, frais reels 16 000 € → frais reels (16 000 > 14 555).
5. Pas de salaire → non applicable.

Micro vs reel foncier (5) :
1. Loyers 12 000 €, charges 5 000 € → reel (5 000 > 3 600).
2. Loyers 12 000 €, charges 2 000 € → micro (3 600 > 2 000).
3. Loyers 16 000 € → micro non eligible (> 15 000 €), reel obligatoire.
4. Loyers 12 000 €, charges 3 600 € → egalite.
5. Pas de revenus fonciers → non applicable.

Rattachement enfant majeur (5) :
1. TMI 30%, 2 parts, enfant majeur, pension 6 000 € → a calculer.
2. TMI 11%, 1 part, enfant majeur → rattachement favorable.
3. TMI 41%, 3 parts, enfant majeur → pension favorable.
4. Enfant < 18 ans → non applicable.
5. Donnees manquantes → insufficient_data.

**Definition de done** :
- 20 tests verts,
- integration dans la suite de tests existante.

---

### Etape 1.6 — Integration parcours et SKILL.md

**Action** :
- ajouter le mode `arbitrages` dans le SKILL.md,
- inserer l'appel a `compare_tax_options` dans le parcours apres la qualification et avant l'estimation,
- mettre a jour `guide_filing_step` pour integrer les recommandations d'arbitrage dans les etapes pertinentes.

**Definition de done** :
- parcours complet : qualification → arbitrages → justificatifs → vigilance → predeclaration → estimation → copilote,
- le mode `arbitrages` est documenté dans le README.

---

## Lot 1b — Frais reels detailles (bareme IK, repas, double residence)

### Pourquoi maintenant

Le lot 1 compare frais reels vs abattement 10% sur un montant global.
Le lot 1b enrichit en permettant de *calculer* les frais reels a partir des donnees concretes du salarie.
C'est un quick win a forte valeur pour le segment "salarie avec trajets longs".

### Perimetre fonctionnel

Nouveau tool `calculate_real_expenses` :
- Indemnites kilometriques (bareme IK officiel selon puissance fiscale et distance annuelle),
- frais de repas (part deductible = cout reel - part non deductible, plafond),
- double residence (loyer, transport hebdomadaire — sous conditions),
- autres frais (formation, outils, vetements specifiques — liste limitative).

### Limites explicites

- les frais doivent etre justifiables (warning systematique),
- pas de calcul des frais de deplacement en transport en commun (remboursement employeur),
- double residence : conditions strictes, warning revue humaine.

### Definition de done

- calculateur IK conforme au bareme officiel,
- calcul des frais de repas conforme,
- integration avec `compare_tax_options` (le resultat alimente l'arbitrage frais reels vs 10%),
- 15 tests.

---

### Etape 1b.0 — Recherche documentaire frais reels

```
<role>
Tu es un fiscaliste senior specialise en frais professionnels des salaries en France,
expert du bareme kilometrique et des deductions de frais reels.
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le lot 1b ajoute un calculateur de frais reels detailles pour les salaries :
indemnites kilometriques, frais de repas, double residence.
</contexte>

<tache>
Produis un dossier complet contenant :

A) BAREME KILOMETRIQUE
- Bareme officiel en vigueur (derniere version connue).
- Structure : puissance fiscale (CV) × distance annuelle → montant deductible.
- Formule de calcul (3 tranches : jusqu'a 5 000 km, 5 001 a 20 000 km, au-dela).
- Vehicules concernes : auto, moto, cyclomoteur, velo.
- Conditions : usage professionnel, propriete ou location du vehicule.
- Cas du vehicule electrique (majoration 20%).

B) FRAIS DE REPAS
- Part deductible = cout du repas - valeur du repas pris a domicile (forfait administrtif).
- Plafond par repas.
- Valeurs officielles 2025/2026 (ou dernieres connues).
- Conditions : absence de cantine, justificatifs.

C) DOUBLE RESIDENCE
- Conditions d'eligibilite (2 foyers, raison professionnelle).
- Charges deductibles : loyer, frais de transport hebdomadaire, charges.
- Plafonds et limitations.
- Duree maximale.

D) AUTRES FRAIS DEDUCTIBLES
- Formation professionnelle.
- Cotisations syndicales (attention : credit d'impot 66% vs deduction).
- Vetements specifiques.
- Outils et materiel professionnel.
- Documentation technique.

E) CASES DECLARATIVES
- Cases 1AK/1BK (frais reels declarant 1/2).
- Detail a joindre.

F) SCENARIOS DE TEST
- 15 scenarios (trajet court, trajet long, double residence, repas, vehicule electrique,
  cas sans justificatif, cas ou l'abattement 10% est plus avantageux).

<sources_a_privilegier>
- BOI-RSA-BASE-30 (frais professionnels)
- Bareme kilometrique officiel (arrete annuel)
- Brochure pratique IR
- service-public.gouv.fr
</sources_a_privilegier>
```

**Livrable** : fichier `real-expenses.research.md` + `calculate-real-expenses.db.json`.

---

### Etape 1b.1 — Implementation du calculateur

**Fichiers** :
- `mcp-server/src/usecases/domains/real-expenses/calculate-real-expenses.usecase.ts`
- `mcp-server/src/data/calculate-real-expenses.db.json` (bareme IK, forfaits repas)

**Schema d'entree** :
```
{
  vehicleType: 'car' | 'motorcycle' | 'moped' | 'bicycle',
  fiscalPower?: number, // CV (pour auto)
  annualProfessionalKm: number,
  isElectric?: boolean,
  workDaysPerYear?: number, // defaut 220
  mealCostPerDay?: number,
  hasCanteen: boolean,
  doubleResidence?: { monthlyRent: number, weeklyTravelCost: number, months: number },
  otherExpenses?: { description: string, amount: number }[]
}
```

**Schema de sortie** :
```
{
  mileageAllowance: number,
  mealExpenses: number,
  doubleResidenceExpenses: number,
  otherExpenses: number,
  totalRealExpenses: number,
  comparisonWith10Pct: { abatement10Pct: number, difference: number, recommendation: string },
  warnings: string[],
  sourceUrls: string[]
}
```

---

### Etape 1b.2 — Tool MCP + Tests

- Exposer comme tool MCP `calculate_real_expenses`.
- 15 tests.
- Integration avec `compare_tax_options` : si l'utilisateur demande l'arbitrage frais reels et fournit les details, le calculateur est appele automatiquement.

---

## Lot 2 — PER et epargne retraite

### Pourquoi maintenant

Le PER est le levier d'optimisation le plus puissant et le plus accessible pour les contribuables a 30%+ de TMI.
Cas d'usage killer : "Combien verser avant le 31/12 pour optimiser mon impot ?".
Les parents de l'utilisateur ont un PER — cas d'usage reel et immediat.

### Perimetre fonctionnel

Nouveau tool `optimize_per_contribution` :
- calcul du plafond de deduction PER individuel (10% du revenu net d'activite ou 10% du PASS),
- recuperation des plafonds non utilises N-3 a N-1 (declares par l'utilisateur),
- mutualisation des plafonds entre conjoints/partenaires PACS,
- simulation de l'economie d'impot pour un versement donne,
- calcul du versement optimal (maximiser le gain dans la tranche marginale).

Extension de `build_pre_declaration` : cases 6NS/6NT (PER individuel), 6OS/6OT (PER entreprise).

### Limites explicites

- PER entreprise obligatoire (compartiment 3) : traitement simplifie,
- sortie en capital du PER (fiscalite de la sortie) : hors perimetre,
- PERP/Madelin ancienne generation : mentionnes, pas simules en detail,
- impact sur les droits a la retraite : hors perimetre.

### Definition de done

- calcul du plafond PER conforme aux regles CGI art. 163 quatervicies,
- simulation de l'economie pour un versement donne, coherente avec `estimate_impact`,
- gestion de la mutualisation couple,
- 15 tests (contribuable seul, couple, mutualisation, report, micro-entrepreneur, plafond plancher).

---

### Etape 2.0 — Recherche documentaire PER

```
<role>
Tu es un fiscaliste senior specialise en impot sur le revenu des particuliers en France,
avec une expertise approfondie sur les dispositifs d'epargne retraite (PER, PERP, Madelin).
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le lot 2 ajoute la gestion du PER (Plan d'Epargne Retraite) :
calcul du plafond de deduction, report des plafonds non utilises,
mutualisation couple, simulation du versement optimal.
</contexte>

<tache>
Produis un dossier complet sur la fiscalite du PER individuel a l'entree (deduction des versements) :

A) MECANISME DE DEDUCTION
- Base de calcul du plafond (10% du revenu net d'activite, definition exacte).
- Plafond plancher (10% du PASS) et plafond absolu (10% de 8 PASS).
- PASS 2024, 2025, 2026 (ou dernier connu).
- Deduction des versements PER entreprise du plafond individuel.

B) REPORT ET MUTUALISATION
- Mecanisme de report des plafonds non utilises (3 annees precedentes).
- Ordre d'utilisation des plafonds (annee en cours puis N-3, N-2, N-1).
- Mutualisation entre conjoints/partenaires PACS (CGI art. 163 quatervicies-II).
- Conditions de la mutualisation (declaration commune obligatoire).

C) CASES DECLARATIVES
- Cases 6NS, 6NT, 6OS, 6OT, 6PS, 6PT, 6QS, 6QT.
- Case speciale primo-declarants ou sans activite.

D) CALCUL DU VERSEMENT OPTIMAL
- Formule : montant qui maximise l'economie dans la tranche marginale actuelle.
- Prise en compte de l'effet sur la TMI.
- Cas du couple avec TMI differentes.

E) CAS PARTICULIERS
- Micro-entrepreneur : quel revenu de reference ?
- Salarie + micro-entrepreneur (cumul).
- Personne sans revenu d'activite (conjoint au foyer).

F) SCENARIOS DE TEST
- 15 scenarios couvrant : cas simple, couple, mutualisation, report maximal,
  micro-entrepreneur, plafond plancher, versement > plafond.

<sources_a_privilegier>
- CGI art. 163 quatervicies
- BOI-IR-BASE-20-50
- Brochure pratique IR (impots.gouv.fr)
- service-public.gouv.fr (fiche PER)
</sources_a_privilegier>
```

**Livrable** : `per-optimization.research.md` + `optimize-per.db.json`.

---

### Etape 2.1 — Fichier de regles `optimize-per.db.json`

**Contenu** :
- PASS par annee (2024, 2025, 2026),
- plafond plancher et plafond absolu,
- regles de report (3 ans),
- regles de mutualisation,
- cases declaratives,
- sources officielles.

---

### Etape 2.2 — Repository et Usecase

**Fichiers** :
- `mcp-server/src/usecases/domains/per/optimize-per.usecase.ts`
- `mcp-server/src/usecases/domains/per/per.repository.ts`
- `mcp-server/src/adapters/db/per.repository.json.ts`

**Logique** :
1. Calculer le plafond de l'annee en cours (10% revenu net d'activite, plancher = 10% PASS).
2. Ajouter les plafonds reportes N-3, N-2, N-1 (fournis par l'utilisateur).
3. Si couple : possibilite de mutualisation.
4. Deduire les versements PER deja effectues.
5. Plafond disponible = plafond total - versements deja faits.
6. Versement optimal = montant qui reduit le RNI sans descendre sous le seuil de la tranche actuelle (sauf si avantageux).
7. Economie d'impot = versement × TMI.

---

### Etape 2.3 — Tool MCP `optimize_per_contribution`

**Schema d'entree** :
```
{
  householdStatus: enum,
  taxableIncome: number,
  activityIncome?: number, // si different du revenu imposable
  previousYearCeilings?: { year: number, unusedAmount: number }[],
  alreadyContributed?: number,
  spouseActivityIncome?: number,
  spousePreviousCeilings?: { year: number, unusedAmount: number }[],
  spouseAlreadyContributed?: number
}
```

**Schema de sortie** :
```
{
  availableCeiling: number,
  spouseAvailableCeiling?: number,
  pooledCeiling?: number, // si mutualisation
  optimalContribution: number,
  estimatedTaxSaving: number,
  currentTMI: number,
  warnings: string[],
  caseCodes: { code: string, label: string }[],
  sourceUrls: string[],
  disclaimer: string
}
```

---

### Etape 2.4 — Extension de `build_pre_declaration`

**Action** : ajouter les cases PER (6NS, 6NT, 6OS, 6OT) dans `build-pre-declaration.db.json` et le usecase.

---

### Etape 2.5 — Tests (15 minimum)

1. Celibataire salarie 40 000 € → plafond = 4 000 €, economie = 1 200 € (TMI 30%).
2. Celibataire salarie 15 000 € → plafond plancher = 10% PASS.
3. Couple marie, revenus inegaux, mutualisation.
4. Report de plafonds N-3 a N-1.
5. Micro-entrepreneur : plafond sur BNC net apres abattement.
6. Conjoint sans activite : plafond = 10% PASS.
7. Versement > plafond disponible → warning.
8. TMI 41% → economie plus importante.
9. TMI 11% → versement peu avantageux, warning.
10-15. Cas limites et donnees manquantes.

---

### Etape 2.6 — Integration parcours et SKILL.md

- Ajouter le mode `per` dans le SKILL.md.
- Integrer dans le parcours apres les arbitrages.
- Le tool `detect_review_points` signale si TMI >= 30% et pas de versement PER declare.

---

## Lot 3 — Detection proactive d'avantages et plafonnement global

### Pourquoi maintenant

Apres les arbitrages (lot 1) et le PER (lot 2), l'assistant optimise ce que l'utilisateur declare.
Mais il ne detecte pas ce que l'utilisateur *oublie* ou *ignore*.
Ce lot cree le passage de l'assistant reactif a l'assistant proactif.
Il inclut aussi le plafonnement global des niches (10 000 €) et le Pinel (besoin personnel de l'utilisateur).

### Perimetre fonctionnel

**Nouveau tool `detect_potential_advantages`** :
- a partir du profil qualifie, parcourir un catalogue d'avantages et tester l'eligibilite potentielle,
- pour chaque avantage detecte : question de confirmation, estimation du gain, conditions, justificatifs.

**Catalogue initial (12 avantages)** :
1. Frais reels (si distance domicile-travail > 30 km).
2. PER (si TMI >= 30% et pas de versement declare).
3. Dons aux associations (question systematique).
4. Frais de garde enfant < 6 ans (credit 50%, plaf. 3 500 €/enfant).
5. Emploi a domicile (credit 50%, plaf. 12 000 €+).
6. Cotisation syndicale (credit 66%).
7. Pension alimentaire versee (si enfant majeur non rattache).
8. Frais de scolarite (reduction 61/153/183 € par enfant college/lycee/sup).
9. Investissement PME — IR-PME (reduction 25% ou 18%).
10. Pinel (reduction selon duree d'engagement 6/9/12 ans).
11. Denormandie ancien.
12. Loc'Avantages (ex-Cosse ancien).

**Nouveau tool `check_niche_ceiling`** :
- Plafonnement global 10 000 € (droit commun) / 18 000 € (Girardin/SOFICA).
- Calcul du solde disponible apres imputation des reductions/credits dans le plafond.
- Alerte si plafond atteint ou depasse.

### Limites explicites

- FCPI/FIP : mentionnes, pas simules en detail,
- Girardin industriel : hors perimetre,
- SOFICA : hors perimetre,
- Malraux / monuments historiques : hors plafond, mentionnes mais pas simules.

### Definition de done

- 12 avantages dans le catalogue,
- chaque avantage avec conditions d'eligibilite formalisees et testees,
- plafonnement global calcule,
- Pinel operationnel (taux selon duree, conditions),
- 30 tests minimum (avantages + plafonnement).

---

### Etape 3.0 — Recherche documentaire avantages + Pinel + plafonnement

```
<role>
Tu es un fiscaliste senior specialise en niches fiscales, reductions et credits d'impot
accessibles aux particuliers en France, expert du plafonnement global.
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le lot 3 ajoute :
1. Un moteur de detection proactive des avantages fiscaux (12 avantages),
2. Le calcul du plafonnement global des niches fiscales (10 000 € / 18 000 €),
3. La gestion du dispositif Pinel.
</contexte>

<tache>
A) Pour chacun des 12 avantages suivants, produis une fiche :
1. Frais reels (vs abattement 10%)
2. PER individuel (deduction versements)
3. Dons aux associations (reduction 66% / 75% Coluche)
4. Frais de garde enfant < 6 ans (credit 50%)
5. Emploi a domicile (credit 50%)
6. Cotisation syndicale (credit 66%)
7. Pension alimentaire versee (deduction)
8. Frais de scolarite (reduction forfaitaire college/lycee/superieur)
9. IR-PME (reduction 25%/18%)
10. Pinel (reduction selon duree 6/9/12 ans)
11. Denormandie ancien
12. Loc'Avantages

Pour chaque avantage :
- conditions d'eligibilite,
- signaux de detection dans le profil (ex : enfant < 6 ans → frais de garde),
- 2 a 4 questions a poser pour confirmer l'eligibilite,
- taux de reduction/credit/deduction,
- plafonds applicables,
- cases declaratives,
- justificatifs requis,
- inclusion dans le plafonnement global (oui/non),
- article CGI / reference BOI,
- validite 2026 (confirmer ou signaler extinction).

B) PINEL — DOSSIER APPROFONDI
- Historique des taux (2014-2024, taux reduits 2023-2024, extinction).
- Taux applicables aux investissements encore en cours en 2026.
- Duree d'engagement initiale (6/9 ans) et prolongation (3+3 ans).
- Conditions : plafonds de loyer, plafonds de ressources locataire, zone geographique.
- Cases declaratives : 7QA a 7QF (selon annee et duree).
- Prorogation : comment declarer un engagement prolonge.
- Interaction avec le plafonnement global.

C) PLAFONNEMENT GLOBAL
- Mecanisme (10 000 € / 18 000 €).
- Liste des avantages DANS le plafond (les plus frequents).
- Liste des avantages HORS plafond (Malraux, monuments, deficit foncier, etc.).
- Methode de calcul : base = montant des reductions/credits, pas les depenses.
- Ordre d'imputation.
- Report en cas de depassement (oui/non selon dispositif).

D) SCENARIOS DE TEST
- 30 scenarios : 2-3 par avantage + 5 cas de plafonnement global (cumul, depassement, Pinel + emploi domicile, etc.).

<sources_a_privilegier>
- CGI art. 199 novovicies (Pinel), 200-0 A (plafonnement), 199 terdecies-0 A (IR-PME)
- BOI-IR-RICI (sous-sections par avantage)
- BOI-IR-LIQ-20-20-10 (plafonnement global)
- Brochure pratique IR
- service-public.gouv.fr
</sources_a_privilegier>

<regles_de_prudence>
- Verifier la validite 2026 de chaque dispositif.
- Le Pinel est en extinction — preciser les investissements encore eligibles.
- Distinguer reductions (perdues si > impot) vs credits (rembourses).
- Ne jamais confondre deduction (du revenu) et reduction (de l'impot).
- Signaler les dispositifs temporaires ou en voie d'extinction.
</regles_de_prudence>
```

**Livrable** : `advantages-detection.research.md` + `detect-advantages.db.json` + `niche-ceiling.db.json`.

---

### Etape 3.1 — Fichiers de regles

**`detect-advantages.db.json`** :
- 12 blocs, chacun avec :
  - `advantageId`,
  - `detectionSignals` (conditions sur le profil qui declenchent la suggestion),
  - `confirmationQuestions` (questions a poser),
  - `eligibilityRules`,
  - `calculationRule` (taux, plafond),
  - `caseCodes`,
  - `inNicheCeiling` (boolean),
  - `sourceUrls`,
  - `validUntil` (date de validite du dispositif).

**`niche-ceiling.db.json`** :
- plafond droit commun (10 000 €),
- plafond etendu (18 000 €),
- liste des avantages dans/hors plafond,
- regles d'imputation.

---

### Etape 3.2 — Repository et Usecases

**Fichiers** :
- `mcp-server/src/usecases/domains/detect-advantages/detect-advantages.usecase.ts`
- `mcp-server/src/usecases/domains/niche-ceiling/check-niche-ceiling.usecase.ts`
- Repositories et adapters associes.

**Logique `detect_potential_advantages`** :
1. Charger le catalogue des 12 avantages.
2. Pour chaque avantage, evaluer les `detectionSignals` contre le profil.
3. Si match → generer la suggestion avec :
   - `status: 'potential'` (a confirmer) ou `'likely'` (profil tres compatible),
   - `estimatedGain` (si calculable),
   - `confirmationQuestions`,
   - `requiredDocuments`.
4. Trier par gain estime decroissant.

**Logique `check_niche_ceiling`** :
1. Lister toutes les reductions/credits declares ou detectes.
2. Pour chaque element, verifier s'il est dans le plafonnement.
3. Calculer le total dans le plafond.
4. Retourner : total utilise, solde disponible, liste detaillee, warning si depassement.

---

### Etape 3.3 — Tools MCP

**Tool `detect_potential_advantages`** :
- Entree : profil qualifie (meme structure que `qualify_tax_profile`).
- Sortie : liste de suggestions d'avantages potentiels.

**Tool `check_niche_ceiling`** :
- Entree : liste des reductions/credits declares (montants), plus ceux detectes.
- Sortie : tableau de bord du plafonnement.

---

### Etape 3.4 — Tests (30 minimum)

- 2-3 par avantage (12 × 2 = 24 tests avantages).
- 6 tests plafonnement global :
  1. Emploi domicile seul, sous le plafond.
  2. Emploi domicile + Pinel, sous le plafond.
  3. Emploi domicile + Pinel + IR-PME, depassement.
  4. Avantage hors plafond (deficit foncier) → non compte.
  5. Couple avec niches mutualisees.
  6. Plafond etendu 18 000 € (SOFICA).

---

### Etape 3.5 — Integration parcours et SKILL.md

- Nouveau mode `detection` dans le SKILL.md.
- Inserer dans le parcours apres la qualification et avant les arbitrages :
  qualification → detection → arbitrages → PER → justificatifs → vigilance → predeclaration → estimation → copilote.
- Le mode detection est aussi proposable en fin de parcours ("Avant de valider, l'assistant verifie si vous avez oublie quelque chose").

---

## Lot 4 — Evenements de vie et changements de situation

### Pourquoi maintenant

Le lot 0 detecte les evenements de vie comme "bloquants" et les refuse.
Ce sont pourtant les situations ou l'utilisateur a le plus besoin d'aide.
Mariage, PACS, divorce, naissance, deces : forte anxiete, erreurs frequentes, choix declaratifs importants.

### Perimetre fonctionnel

Extension de `qualify_tax_profile` et `estimate_impact`.

Nouveau tool `simulate_life_event` :
- mariage/PACS en cours d'annee : simulation commune vs 3 declarations separees,
- divorce/separation : 2 declarations distinctes, repartition revenus/charges,
- naissance/adoption : impact QF (part entiere quelle que soit la date),
- deces du conjoint : 2 declarations (commune jusqu'au deces, individuelle apres).

### Limites explicites

- depart/retour etranger : hors perimetre,
- changement de regime matrimonial sans divorce : hors perimetre,
- imposition separee des epoux : hors perimetre.

### Definition de done

- 4 evenements de vie couverts,
- simulation comparative commune vs separee pour mariage/PACS,
- 20 tests (5 par evenement),
- guide de saisie adapte par `guide_filing_step`.

---

### Etape 4.0 — Recherche documentaire evenements de vie

```
<role>
Tu es un fiscaliste senior specialise en impot sur le revenu des particuliers en France,
expert des changements de situation familiale et de leur impact declaratif.
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le lot 4 ajoute la gestion des evenements de vie en cours d'annee :
mariage/PACS, divorce/separation, naissance/adoption, deces du conjoint.
</contexte>

<tache>
Pour chacun des 4 evenements, produis :

A) REGLES DECLARATIVES
- Nombre de declarations a produire.
- Options disponibles (commune vs separees, si applicable).
- Prorata du quotient familial.
- Repartition des revenus et charges.
- Date de reference (01/01, 31/12, ou date de l'evenement).

B) CALCUL COMPARATIF (si options)
- Methode de comparaison commune vs separees (mariage).
- Variables necessaires.

C) IMPACT SUR LES AUTRES RUBRIQUES
- Credits/reductions : prorata ou totalite ?
- PER : mutualisation possible ou non ?
- Emploi a domicile, garde : repartition ?

D) CASES DECLARATIVES
- Cases d'etat civil, date de l'evenement.

E) SCENARIOS DE TEST
- 5 scenarios par evenement (dates variables, revenus inegaux, enfants).

F) ZONES DE PRUDENCE
- Cas necessitant rendez-vous aux impots.
- Erreurs les plus frequentes.
- Ton adapte (empathie deces/divorce).

<sources_a_privilegier>
- CGI art. 6 (imposition par foyer, changements de situation)
- BOI-IR-CHAMP-20-10
- Brochure pratique IR (section "Changements de situation familiale")
- service-public.gouv.fr
</sources_a_privilegier>
```

**Livrable** : `life-events.research.md` + `life-events.db.json`.

---

### Etape 4.1 — Fichier de regles `life-events.db.json`

- 4 blocs (mariage, divorce, naissance, deces),
- chacun avec : nombre de declarations, options, prorata QF, cases, sources, warnings.

---

### Etape 4.2 — Repository et Usecase `simulate_life_event`

**Logique** :
1. Identifier l'evenement et sa date.
2. Determiner le nombre de declarations.
3. Si options disponibles : calculer l'IR pour chaque option.
4. Retourner la comparaison avec recommandation conditionnelle.
5. Adapter les messages (ton empathique pour deces/divorce).

---

### Etape 4.3 — Tool MCP + Tests (20)

---

### Etape 4.4 — Extension des tools existants

- `qualify_tax_profile` : les evenements passent de `out_of_scope` a `supported` pour les 4 evenements couverts.
- `guide_filing_step` : etapes adaptees a chaque evenement.
- `build_pre_declaration` : gestion multi-declarations.

---

### Etape 4.5 — Integration parcours et SKILL.md

- Nouveau mode `evenements` dans le SKILL.md.
- Ton adapte dans le SKILL.md : empathie, pas de froideur administrative.
- Disclaimer renforce : "Cette simulation ne remplace pas un rendez-vous aux impots dans votre cas."

---

## Lot 5 — Revenus fonciers au reel et deficit foncier

### Pourquoi maintenant

Le lot 1 compare micro vs reel sur des montants globaux.
Le lot 5 modelise le formulaire 2044 avec ses charges detaillees et le deficit foncier.
Segment a tres forte valeur pour les proprietaires bailleurs.

### Perimetre fonctionnel

Extension de `build_pre_declaration` et `estimate_impact` :
- formulaire 2044 simplifie (6 categories de charges),
- calcul du revenu foncier net ou deficit,
- deficit foncier : imputation sur revenu global (plafond 10 700 €), report 10 ans,
- comparaison micro vs reel enrichie avec charges detaillees.

### Limites explicites

- SCI : hors perimetre,
- monuments historiques : hors perimetre,
- formulaire 2044-SPE : hors perimetre,
- LMNP : lot 7.

### Definition de done

- formulaire 2044 modelise (6 categories de charges),
- deficit foncier calcule (plafond 10 700 €, report 10 ans),
- comparaison micro vs reel avec charges detaillees,
- 15 tests.

---

### Etape 5.0 — Recherche documentaire revenus fonciers

```
<role>
Tu es un fiscaliste senior specialise en revenus fonciers et en declaration 2044,
expert des charges deductibles, du deficit foncier et de l'optimisation fonciere licite.
</role>

<contexte>
Je construis un assistant fiscal MCP pour particuliers francais.
Le lot 5 ajoute la gestion des revenus fonciers au regime reel (formulaire 2044),
le calcul du deficit foncier et la comparaison detaillee avec le micro-foncier.
</contexte>

<tache>
A) STRUCTURE DU FORMULAIRE 2044
- Liste des lignes avec signification (210 a 460).

B) CHARGES DEDUCTIBLES — CATALOGUE
Pour chaque categorie : nature, conditions, plafonds, exemples, justificatifs.
Categories : interets d'emprunt, assurances, travaux d'amelioration/reparation/entretien,
frais de gestion (20 € forfaitaires + reels), taxes foncieres, charges de copropriete.

C) TRAVAUX — CLASSIFICATION
- Travaux deductibles (amelioration, reparation, entretien) vs non deductibles (construction, agrandissement).
- Cas ambigus et jurisprudence.

D) DEFICIT FONCIER
- Mecanisme (plafond 10 700 €, report 10 ans).
- Interets d'emprunt : uniquement sur revenus fonciers (pas revenu global).
- Obligation maintien en location 3 ans.

E) CASES DECLARATIVES
- 4BA, 4BB, 4BC, 4BD, 4BE.

F) SCENARIOS DE TEST (15)

<sources_a_privilegier>
- BOI-RFPI-BASE-20, BOI-RFPI-SPEC-30
- CGI art. 31, 156-I-3°
- Notice 2044, brochure pratique IR
</sources_a_privilegier>
```

**Livrable** : `rental-income-real.research.md` + `rental-income-real.db.json`.

---

### Etapes 5.1 a 5.5

Meme structure que les lots precedents :
5.1 — Fichier de regles,
5.2 — Repository et Usecase,
5.3 — Tool MCP (extension de `build_pre_declaration` et `estimate_impact` + nouveau tool `model_rental_income_real`),
5.4 — Tests (15),
5.5 — Integration parcours.

---

## Lot 6 — Plus-values mobilieres et revenus financiers avances

### Pourquoi maintenant

L'investissement en bourse se democratise. Le lot 0 gere dividendes et interets au PFU, mais pas les plus-values, l'assurance-vie, ni le PEA.
Necessaire pour que l'arbitrage PFU/bareme du lot 1 soit complet (il doit integrer les PV).

### Perimetre fonctionnel

Extension de `estimate_impact` et `build_pre_declaration` :
- plus-values sur cession de titres (PFU ou bareme avec abattements duree de detention),
- assurance-vie : rachat, fiscalite selon anciennete et date des versements,
- PEA : sorties avant/apres 5 ans,
- moins-values : imputation et report 10 ans.

### Limites explicites

- crypto-actifs : hors perimetre (regime distinct),
- plus-values immobilieres : hors perimetre (notaire),
- stock-options/RSU/AGA : signales, revue humaine recommandee.

### Definition de done

- PV mobilieres avec PFU et bareme + abattements,
- AV : 3 cas d'anciennete avec abattement,
- moins-values : imputation et report,
- enrichissement de l'arbitrage PFU/bareme global,
- 20 tests.

---

### Etape 6.0 — Recherche documentaire

```
<role>
Tu es un fiscaliste senior specialise en fiscalite des revenus et plus-values mobilieres
des particuliers en France, expert PFU/bareme, assurance-vie, PEA.
</role>

<contexte>
Le lot 6 ajoute les plus-values mobilieres, les rachats AV, les sorties PEA,
et les mecanismes d'imputation des moins-values.
Le lot 0 gere deja dividendes et interets au PFU.
Le lot 1 gere l'arbitrage PFU vs bareme (a enrichir avec les PV).
</contexte>

<tache>
A) PLUS-VALUES DE CESSION DE VALEURS MOBILIERES
- Calcul PV brute, PFU, option bareme avec abattements duree de detention
  (regime transitoire avant 01/01/2018 : 50% 2-8 ans, 65% > 8 ans).
- Abattement renforce PME.

B) MOINS-VALUES
- Imputation PV meme nature, report 10 ans.
- Cases 3VG, 3VH.

C) ASSURANCE-VIE
- Fiscalite rachats selon anciennete (< 4 ans, 4-8 ans, > 8 ans) et date versements
  (avant/apres 27/09/2017), seuil 150 000 €.
- Abattement 4 600 € / 9 200 €.

D) PEA
- Sorties avant/apres 5 ans.

E) CASES DECLARATIVES
- 3VG, 3VH, 3UA, 3SG, 3SL, 2DH, 2CH, 2EE.

F) SCENARIOS DE TEST (20)

<sources_a_privilegier>
- CGI art. 150-0 A a 150-0 E, 150-0 D, 125-0 A, 157-5° bis
- BOI-RPPM-PVBMI, BOI-RPPM-RCM-10-10-80
- Notice 2074
</sources_a_privilegier>
```

**Livrable** : `capital-gains.research.md` + `capital-gains.db.json`.

---

### Etapes 6.1 a 6.5

Meme structure : fichier de regles, repository/usecase, tools MCP, tests, integration.

---

## Lot 7 — LMNP / LMP au reel simplifie

### Pourquoi maintenant

Le LMNP est le segment immobilier en plus forte croissance.
Le lot 0 ne couvre que le micro-BIC.
Le passage au reel avec amortissements est le levier d'optimisation le plus puissant pour les loueurs meubles.

### Perimetre fonctionnel

- LMNP reel simplifie : charges deductibles + amortissements par composants,
- distinction LMNP / LMP (seuils, consequences),
- comparaison micro-BIC vs reel avec amortissements,
- formulaire 2031/2033 simplifie.

### Limites explicites

- LMNP au reel normal : hors perimetre (expert-comptable obligatoire de fait),
- SCI en meuble : hors perimetre,
- parahotellerie : hors perimetre,
- recommander systematiquement un expert-comptable pour la liasse reelle.

### Definition de done

- simulation LMNP reel simplifie operationnelle,
- comparaison micro-BIC vs reel avec amortissements,
- alerte LMP si seuils proches,
- 15 tests.

---

### Etape 7.0 — Recherche documentaire LMNP

```
<role>
Tu es un fiscaliste senior specialise en location meublee (LMNP/LMP),
expert des BIC, des amortissements et de la fiscalite immobiliere des particuliers en France.
</role>

<contexte>
Le lot 7 ajoute la simulation du LMNP au reel simplifie : charges, amortissements,
comparaison micro-BIC vs reel, distinction LMNP/LMP.
Le MVP couvre deja le micro-BIC.
</contexte>

<tache>
A) DISTINCTION LMNP / LMP
- Criteres LMP (CGI art. 155-IV).
- Consequences (cotisations sociales, plus-values).

B) CHARGES DEDUCTIBLES (reel simplifie)
- Interets, assurances, travaux, copropriete, taxe fonciere, comptabilite, CFE, gestion locative.

C) AMORTISSEMENTS
- Composants et durees (structure 50-80 ans, toiture 25 ans, mobilier 5-10 ans, etc.).
- Valeur terrain non amortissable (15-20% province, 20-30% villes, 40%+ Paris).
- Amortissement non imputable (ne cree pas de deficit BIC, report illimite — CGI art. 39 C).
- Reforme LF 2025 : reintegration amortissements dans PV LMNP.

D) COMPARAISON MICRO-BIC VS REEL
- Seuil de rentabilite, exemples chiffres.

E) FORMULAIRES
- 2031, 2033, report sur 2042 C PRO (cases 5NA-5NK ou 5NG-5NJ).

F) SCENARIOS DE TEST (15)

<sources_a_privilegier>
- CGI art. 155-IV, 39 C
- BOI-BIC-CHAMP-40-20, BOI-BIC-AMT
- LF 2025 (reintegration amortissements)
</sources_a_privilegier>
```

**Livrable** : `lmnp.research.md` + `lmnp.db.json`.

---

### Etapes 7.1 a 7.5

Meme structure : fichier de regles, repository/usecase, tools MCP, tests, integration.

---

## Lot 8 — Parents separes, garde alternee, pension, rattachement (approfondissement)

### Pourquoi maintenant

Le lot 0 detecte la garde alternee et le lot 1 compare rattachement vs detachement.
Le lot 8 approfondit avec les exclusions mutuelles, les cas de recomposition familiale, et les arbitrages parent isole.

### Perimetre fonctionnel

Extension de `detect_review_points` et `compare_tax_options` :
- exclusions mutuelles : rattachement exclut pension pour le meme enfant,
- parent isole (case T) : demi-part supplementaire, conditions strictes,
- enfant en residence alternee : partage des parts entre les deux foyers,
- arbitrage pension alimentaire : montant optimal (plafond CGI art. 156, ~6 674 €).

### Limites explicites

- litiges judiciaires : hors perimetre,
- situations internationales : hors perimetre.

### Definition de done

- exclusions mutuelles formalisees et testees,
- parent isole (case T) gere,
- 20 tests familiaux complexes.

---

### Etape 8.0 — Recherche documentaire

```
<role>
Tu es un fiscaliste senior IR particuliers specialise en foyers separes,
enfants, pensions et rattachement.
</role>

<contexte>
Le lot 8 approfondit la gestion des situations familiales complexes :
garde alternee, pension alimentaire, rattachement enfant majeur,
parent isole, exclusions mutuelles.
</contexte>

<tache>
A) EXCLUSIONS MUTUELLES
- Rattachement enfant majeur exclut la deduction de pension pour ce meme enfant.
- Garde alternee : partage des parts entre les deux parents.
- Parent isole (case T) : conditions, duree, perte du benefice.

B) PENSION ALIMENTAIRE
- Plafond de deduction (art. 156-II-2° CGI, ~6 674 €).
- Conditions de deductibilite.
- Pension en nature (evaluation forfaitaire hebergement : ~3 786 €).
- Pension versee a un enfant majeur vs ex-conjoint.

C) RATTACHEMENT ENFANT MAJEUR
- Conditions (age, etudes, handicap).
- Impact QF (+0,5 ou +1 part selon rang).
- Abattement forfaitaire enfant majeur marie/pacse rattache (6 674 €).

D) PARENT ISOLE
- Case T : conditions (vivre seul au 01/01, avoir au moins un enfant a charge).
- Demi-part supplementaire.
- Perte du benefice : remise en couple, meme brievement.

E) SCENARIOS DE TEST (20)

<sources_a_privilegier>
- CGI art. 156-II-2°, 196, 196 B
- BOI-IR-LIQ-10-10-10
- Brochure pratique IR
</sources_a_privilegier>
```

**Livrable** : `family-situations.research.md` + `family-situations.db.json`.

---

### Etapes 8.1 a 8.5

Meme structure : fichier de regles, repository/usecase, extension des tools existants, tests, integration.

---

## Resume de la roadmap

| Lot | Nom | Tools | Tests | Priorite |
|-----|-----|-------|-------|----------|
| 1 | Moteur d'arbitrages | `compare_tax_options` | 20 | ★★★★★ |
| 1b | Frais reels detailles | `calculate_real_expenses` | 15 | ★★★★☆ |
| 2 | PER / epargne retraite | `optimize_per_contribution` | 15 | ★★★★★ |
| 3 | Detection proactive + Pinel + plafonnement | `detect_potential_advantages`, `check_niche_ceiling` | 30 | ★★★★★ |
| 4 | Evenements de vie | `simulate_life_event` | 20 | ★★★★☆ |
| 5 | Foncier reel + deficit | `model_rental_income_real` | 15 | ★★★★☆ |
| 6 | Plus-values mobilieres | extension `estimate_impact` | 20 | ★★★☆☆ |
| 7 | LMNP reel simplifie | `simulate_lmnp_real` | 15 | ★★★☆☆ |
| 8 | Parents separes approfondi | extension `detect_review_points` + `compare_tax_options` | 20 | ★★★☆☆ |

### Parcours cible complet (apres tous les lots)

1. Ouverture et cadrage
2. Qualification (+ evenements de vie)
3. **Detection proactive d'avantages**
4. **Arbitrages comparatifs**
5. **Simulation PER**
6. Justificatifs
7. Points de vigilance
8. Pre-declaration
9. Estimation indicative (avec arbitrages appliques)
10. **Plafonnement global des niches**
11. Mode copilote de saisie
12. Controle final

### Sequence d'implementation recommandee

```
Lot 1 (arbitrages)
  → Lot 1b (frais reels)
    → Lot 2 (PER)
      → Lot 3 (detection + Pinel + plafonnement)
        → Lot 4 (evenements de vie)
          → Lot 5 (foncier reel)
            → Lot 6 (plus-values)
              → Lot 7 (LMNP)
                → Lot 8 (parents separes)
```

Chaque lot suit le cycle :
`recherche documentaire → fichier de regles → repository/usecase → tool MCP → tests → integration parcours`.
