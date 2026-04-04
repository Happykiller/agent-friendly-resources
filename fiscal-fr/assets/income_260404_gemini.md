# 1) INVENTAIRE SOURCES

| sujet | source_title | source_url | publisher | authority_level | campagne concernée | fiabilité |
| --- | --- | --- | --- | --- | --- | --- |
| Revenus fonciers | Simulateur d'impôt sur le revenu 2026 - Modèle simplifié | [https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm) | DGFiP | primary_official | fr-2026-revenus-2025 | high |
| LMNP / LMP | Les régimes d'imposition | [https://www.impots.gouv.fr/particulier/les-regimes-dimposition](https://www.impots.gouv.fr/particulier/les-regimes-dimposition) | DGFiP | primary_official | fr-2026-revenus-2025 | high |
| Dispositifs immo type Pinel | Réduction d'impôt pour investissement locatif | [https://www.service-public.gouv.fr/particuliers/vosdroits/F31151](https://www.service-public.gouv.fr/particuliers/vosdroits/F31151) | Service Public | primary_official | fr-2026-revenus-2025 | high |
| NDF / frais réels | Le barème des frais de carburant pour la déclaration de revenus 2026 est disponible | [https://www.service-public.gouv.fr/particuliers/actualites/A16343](https://www.service-public.gouv.fr/particuliers/actualites/A16343) | Service Public | primary_official | fr-2026-revenus-2025 | high |

# 2) MATRICE DE COUVERTURE

| sujet | coverage_status | formulaires/cases identifiés | justification courte |
| --- | --- | --- | --- |
| Revenus fonciers / immobilier locatif | PROMOTABLE | 2042 / 4BE | Règle claire pour le régime micro-foncier et case identifiée dans le simulateur 2026.[1] Recommandation produit: supporter dans MVP. |
| Dividendes et revenus de capitaux mobiliers | PROMOTABLE | 2042 / 2OP | Option globale pour le barème progressif au lieu du PFU disponible dans le simulateur 2026.[2] Recommandation produit: supporter dans MVP. |
| LMNP / LMP (location meublée) | PROMOTABLE | Aucun | Modifications des seuils (15 000 €) et taux (30 %) d'abattement pour les meublés de tourisme non classés confirmées pour 2025. Recommandation produit: supporter avec prudence. |
| Dispositifs immo type Pinel | PROMOTABLE | Aucun | Règle d'extinction claire: clôture du dispositif pour les investissements à partir du 1er janvier 2025. Recommandation produit: supporter dans MVP pour écarter les nouveaux entrants. |
| Auto-entrepreneur / micro-entreprise | CANDIDATE | Aucun | Sources officielles du périmètre muettes ou incomplètes sur les détails des cases pour la déclaration 2026 des revenus 2025. Recommandation produit: envoyer en revue humaine. |
| BIC/BNC | CANDIDATE | Aucun | Pas de règle d'éligibilité ou de qualification complète identifiée dans les sources de la campagne cible. Recommandation produit: envoyer en revue humaine. |
| NDF / frais réels | PROMOTABLE | 2042 / Aucun | Barème des carburants 2026 officiel pour le calcul des frais réels automobiles. Recommandation produit: supporter avec prudence. |

# 3) REGLES PRETES A PROMOUVOIR (JSON)

```json
.",
    "complexityImpact": "simple",
    "decisionImpact": "L'utilisateur relève du régime micro-foncier avec un abattement forfaitaire de 30 %. Les revenus bruts doivent être portés en case 4BE.[1]",
    "pointsToConfirm":.",
      "L'absence d'exclusion expresse du régime micro-foncier."
    ],
    "nextQuestions": [
      "Le total de vos loyers bruts perçus en 2025 dépasse-t-il 15 000 euros?"
    ],
    "suggestedCaseCodes":,
    "requiredDocuments":."
    ],
    "onlineUiHints": null,
    "confidenceLevel": "high",
    "sources":
  },
  {
    "id": "ir2026:pinel:cloture",
    "topic": "Dispositifs immo type Pinel",
    "trigger": "L'utilisateur souhaite bénéficier de la réduction Pinel pour un logement acquis ou achevé en 2025.",
    "complexityImpact": "out_of_scope",
    "decisionImpact": "Le dispositif Pinel est éteint pour les investissements réalisés à compter du 1er janvier 2025.",
    "pointsToConfirm":."
    ],
    "nextQuestions": [
      "Votre investissement a-t-il été finalisé avant le 1er janvier 2025?"
    ],
    "suggestedCaseCodes":,
    "requiredDocuments":,
    "onlineUiHints": null,
    "confidenceLevel": "high",
    "sources":
  },
  {
    "id": "ir2026:frais_reels:carburant",
    "topic": "NDF / frais réels",
    "trigger": "L'utilisateur souhaite déduire ses frais de carburant réels pour ses trajets professionnels avec son véhicule personnel.",
    "complexityImpact": "monitor",
    "decisionImpact": "Possibilité d'appliquer le barème officiel des frais de carburant 2026 pour les véhicules éligibles.",
    "pointsToConfirm":.",
      "La puissance fiscale du véhicule concerné."
    ],
    "nextQuestions": [
      "Pouvez-vous justifier du nombre de kilomètres parcourus à titre professionnel?"
    ],
    "suggestedCaseCodes":,
    "requiredDocuments":."
    ],
    "onlineUiHints": null,
    "confidenceLevel": "high",
    "sources":
  }
]
```

# 4) BACKLOG DOCUMENTAIRE

- [P0] Formulaires officiels Cerfa de la campagne 2026
- Pourquoi bloquant: Les formulaires et services en ligne définitifs pour les revenus 2025 ne sont pas encore publiés au moment de l'analyse. L'association visuelle et les codes des cases (notamment pour LMNP meublés de tourisme abaissés) manquent d'ancrage normatif direct.
- Source officielle à trouver: impots.gouv.fr (prochaines mises en ligne).
- Impact sur la qualification: monitor.

- [P1] Documentation des cases Auto-entrepreneur (Régime Micro-entrepreneur)
- Pourquoi bloquant: Absence de fiches détaillant l'impact déclaratif 2026 sur les cases spécifiques de la 2042 C PRO avec des sources filtrées aux stricts critères autorisés.
- Source officielle à trouver: impots.gouv.fr (mises à jour des pages de synthèse ou brochures).
- Impact sur la qualification: out_of_scope.