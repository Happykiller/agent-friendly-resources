**1) INVENTAIRE SOURCES**

| sujet | source_title | source_url | publisher | authority_level | campagne | fiabilité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Revenus fonciers | Brochure Pratique 2025 - Impots.gouv | https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2025/accueil.htm | DGFiP | primary_official | 2026 (revenus 2025) | high |
| Dividendes et RCM | Impôt sur le revenu - Revenus d'épargne et de placement | https://www.service-public.gouv.fr/particuliers/vosdroits/F34913/1_7 | DILA / Service Public | primary_official | 2026 (revenus 2025) | high |
| Dispositifs immo | Loi de finances 2026 : ce qui change pour les particuliers | https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/loi-de-finances-2026-ce-qui-change-pour-les-particuliers | Ministère de l'Économie | primary_official | 2026 (revenus 2025) | high |
| Auto-entrepreneur | Formulaire n°2042 Déclaration des revenus (2042-C-PRO) | https://www.impots.gouv.fr/formulaire/2042/declaration-des-revenus | DGFiP | primary_official | 2026 (revenus 2025) | high |
| Frais réels | Impôt sur le revenu - Déclaration de revenus annuelle | https://www.service-public.gouv.fr/particuliers/vosdroits/F358 | DILA / Service Public | primary_official | 2026 (revenus 2025) | high |
| LMNP / LMP | Comptabilité LMNP 2026 : obligations, liasse fiscale | https://lmnp.ai/comptabilite-lmnp | lmnp.ai | secondary_official | 2026 (revenus 2025) | medium |

**2) MATRICE DE COUVERTURE**

| sujet | coverage_status | formulaires/cases identifiés | justification courte | recommandation produit |
| :--- | :--- | :--- | :--- | :--- |
| 1) Revenus fonciers | **PROMOTABLE** | 2042 (4BE), 2044 (4BA) | Règles Micro-foncier (<= 15 000€) vs Réel sourcées officiellement (Brochure DGFiP). | Supporter dans MVP (simple). |
| 2) Dividendes et RCM | **PROMOTABLE** | 2042 (2DC, 2BH, 2CK, 2TR, 2OP) | Hausse CSG à 18,6% (PFU 31,4%) et arbitrage 2OP documentés sur sources gouvernementales. | Supporter dans MVP (simple). |
| 3) LMNP / LMP | **CANDIDATE** | 2042 C PRO, Liasse 2031/2033 | Documentation majoritairement issue de sources secondaires (éditeurs logiciels). Manque le BOFiP. | Supporter avec prudence (monitor). |
| 4) Dispositifs immo | **PROMOTABLE** | 2042 RICI | Création "Relance logement" confirmée par Loi de finances 2026. Denormandie prolongé. | Supporter dans MVP (monitor). |
| 5) Auto-entrepreneur | **PROMOTABLE** | 2042 C PRO (5HQ, 5KO, 5KP, 5TA, 5TB, 5TE) | Formulaire officiel identifié. Catégorisation BIC/BNC et prélèvement libératoire validés. | Supporter dans MVP (simple). |
| 6) BIC/BNC (Réel) | **MISSING** | 2035, 2042 C PRO | Règles comptables de détermination du résultat net absentes des sources primaires. | Hors périmètre (out_of_scope). |
| 7) NDF / Frais réels | **PROMOTABLE** | 2042 (1AK, 1AJ) | Option frais réels vs 10% et barème kilométrique 2026 identifiés. | Supporter dans MVP (simple). |

**3) REGLES PRETES A PROMOUVOIR (JSON)**

```json
[
  {
    "id": "qualif_revenus_fonciers",
    "topic": "Revenus fonciers / immobilier locatif",
    "trigger": "L'utilisateur mentionne la location d'un bien immobilier nu (non meublé).",
    "complexityImpact": "simple",
    "decisionImpact": "Orienter vers le régime micro-foncier ou le régime réel selon le montant des recettes.",
    "pointsToConfirm": [
      "Le montant brut annuel des loyers encaissés.",
      "Le choix du régime (Micro-foncier abattement 30% ou Réel avec déduction des charges)."
    ],
    "nextQuestions": [
      "Vos recettes locatives annuelles dépassent-elles 15 000 € ?",
      "Avez-vous des charges importantes (travaux, intérêts d'emprunt) justifiant l'option pour le régime réel ?"
    ],
    "suggestedCaseCodes": ["4BE", "4BA", "4BK", "4BL"],
    "requiredDocuments": [
      "Relevés de gérance ou quittances de loyer",
      "Justificatifs de charges, intérêts d'emprunt et travaux (si régime réel)"
    ],
    "onlineUiHints": "Si les revenus sont inférieurs à 15 000 €, saisir en case 4BE. L'abattement de 30 % est calculé automatiquement. Ne pas déduire les charges manuellement en micro-foncier.",
    "confidenceLevel": "high",
    "sources": [
      {
        "title": "Brochure Pratique 2025 - Impots.gouv",
        "url": "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2025/accueil.htm",
        "publisher": "DGFiP",
        "authorityLevel": "primary_official"
      }
    ]
  },
  {
    "id": "qualif_rcm_dividendes",
    "topic": "Dividendes et revenus de capitaux mobiliers",
    "trigger": "L'utilisateur mentionne des revenus de placements, dividendes, ou intérêts bancaires.",
    "complexityImpact": "simple",
    "decisionImpact": "Alerter sur la hausse des prélèvements sociaux (18,6% en 2026) et proposer la simulation pour l'option au barème (case 2OP).",
    "pointsToConfirm": [
      "La nature des revenus (actions, livrets fiscalisés, assurance-vie).",
      "La Tranche Marginale d'Imposition (TMI) du foyer pour l'arbitrage PFU / Barème."
    ],
    "nextQuestions": [
      "Connaissez-vous votre Tranche Marginale d'Imposition ? Si elle est de 0% ou 11%, l'option pour le barème progressif (case 2OP) est souvent plus avantageuse que le PFU à 31,4%."
    ],
    "suggestedCaseCodes": ["2DC", "2BH", "2CK", "2TR", "2OP"],
    "requiredDocuments": [
      "Imprimé Fiscal Unique (IFU) - Formulaire 2561 fourni par la banque"
    ],
    "onlineUiHints": "Vérifier le pré-remplissage des cases 2DC/2TR. Cocher la case 2OP pour renoncer au Prélèvement Forfaitaire Unique (PFU) et opter pour le barème progressif.",
    "confidenceLevel": "high",
    "sources": [
      {
        "title": "Impôt sur le revenu - Revenus d'épargne et de placement",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F34913/1_7",
        "publisher": "DILA",
        "authorityLevel": "primary_official"
      }
    ]
  },
  {
    "id": "qualif_dispositifs_immo_relance",
    "topic": "Dispositifs immo type Pinel / Relance logement",
    "trigger": "L'utilisateur demande des informations sur la défiscalisation immobilière ou les nouveaux dispositifs de 2026.",
    "complexityImpact": "monitor",
    "decisionImpact": "Qualifier l'éligibilité au nouveau dispositif 'Relance logement' ou aux dispositifs existants (Denormandie).",
    "pointsToConfirm": [
      "Date d'acquisition du bien.",
      "Engagement de location à titre de résidence principale (durée de 9 ans pour Relance logement)."
    ],
    "nextQuestions": [
      "Le bien loué est-il neuf ou ancien avec au moins 30 % de travaux ?",
      "Vous engagez-vous à louer le bien comme résidence principale pendant au moins 9 ans avec un loyer plafonné ?"
    ],
    "suggestedCaseCodes": ["Formulaire 2042 RICI (Cases à préciser à parution)"],
    "requiredDocuments": [
      "Bail de location",
      "Justificatifs de travaux et factures",
      "Acte d'acquisition"
    ],
    "onlineUiHints": "Le dispositif Relance logement permet de déduire jusqu'à 12 000 €/an du prix d'achat et l'intégralité des charges jusqu'à 10 700 €. Accéder aux rubriques d'engagements locatifs (ex 2044 EB).",
    "confidenceLevel": "high",
    "sources": [
      {
        "title": "Loi de finances 2026 : ce qui change pour les particuliers",
        "url": "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/loi-de-finances-2026-ce-qui-change-pour-les-particuliers",
        "publisher": "Ministère de l'Économie",
        "authorityLevel": "primary_official"
      }
    ]
  },
  {
    "id": "qualif_auto_entrepreneur",
    "topic": "Auto-entrepreneur / micro-entreprise",
    "trigger": "L'utilisateur déclare des revenus issus d'une activité d'auto-entrepreneur ou de micro-entreprise.",
    "complexityImpact": "simple",
    "decisionImpact": "Orienter la saisie vers les bonnes cases de la 2042-C-PRO en fonction du choix initial (prélèvement libératoire ou non) et de la nature de l'activité (BIC/BNC).",
    "pointsToConfirm": [
      "L'option ou non pour le prélèvement libératoire de l'impôt (IR).",
      "La catégorie des revenus : Vente/Prestation (BIC) ou Profession libérale (BNC)."
    ],
    "nextQuestions": [
      "Avez-vous opté pour le versement libératoire de l'impôt sur le revenu auprès de l'URSSAF ?",
      "Votre activité relève-t-elle de la vente de marchandises, des prestations de services (BIC) ou d'une profession libérale (BNC) ?"
    ],
    "suggestedCaseCodes": ["5TA", "5TB", "5TE", "5KO", "5KP", "5HQ"],
    "requiredDocuments": [
      "Attestation fiscale annuelle délivrée par l'URSSAF"
    ],
    "onlineUiHints": "Saisir le Chiffre d'Affaires BRUT sans déduire de charges. L'administration appliquera l'abattement forfaitaire automatiquement (71% ventes, 50% prestations BIC, 34% BNC).",
    "confidenceLevel": "high",
    "sources": [
      {
        "title": "Formulaire n°2042 Déclaration des revenus (2042-C-PRO)",
        "url": "https://www.impots.gouv.fr/formulaire/2042/declaration-des-revenus",
        "publisher": "DGFiP",
        "authorityLevel": "primary_official"
      }
    ]
  },
  {
    "id": "qualif_frais_reels",
    "topic": "NDF / frais réels",
    "trigger": "L'utilisateur souhaite déduire des dépenses professionnelles (déplacements, repas) de ses revenus salariés.",
    "complexityImpact": "simple",
    "decisionImpact": "Évaluer si les frais réels dépassent l'abattement automatique de 10% appliqué sur les salaires.",
    "pointsToConfirm": [
      "Le calcul estimatif des frais professionnels annuels (barème kilométrique 2026, repas).",
      "La possession des justificatifs."
    ],
    "nextQuestions": [
      "Le total de vos frais professionnels annuels est-il supérieur à 10 % de votre salaire net imposable ?",
      "Avez-vous conservé l'ensemble des justificatifs (factures, carte grise) exigibles en cas de contrôle ?"
    ],
    "suggestedCaseCodes": ["1AK", "1AJ"],
    "requiredDocuments": [
      "Carte grise du véhicule",
      "Justificatifs de frais de repas",
      "Attestation de l'employeur (le cas échéant)"
    ],
    "onlineUiHints": "Inscrire le montant des frais réels en case 1AK. Ne pas déduire ce montant du salaire net inscrit en case 1AJ ; le calcul comparatif avec les 10% se fera automatiquement.",
    "confidenceLevel": "high",
    "sources": [
      {
        "title": "Impôt sur le revenu - Déclaration de revenus annuelle",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F358",
        "publisher": "DILA",
        "authorityLevel": "primary_official"
      }
    ]
  }
]
```

**4) BACKLOG DOCUMENTAIRE**

*   **[P0] Location Meublée Non Professionnelle (LMNP / LMP) :** 
    *   **Pourquoi bloquant :** La qualification précise entre micro-BIC (abattement 50% ou 30% tourisme non classé) et régime réel (amortissements complexes) nécessite des références officielles indiscutables. Actuellement sourcé via des éditeurs logiciels (lmnp.ai). 
    *   **Source officielle à trouver :** Instruction BOFiP-Impôts `BOI-BIC-CHAMP-40-20` ou page DGFiP "Fiscalité de la location meublée 2026".
    *   **Impact qualification :** Monitor (bascule potentielle vers expert-comptable).
*   **[P1] Régime d'imposition au Réel (BIC/BNC) :**
    *   **Pourquoi bloquant :** Les professionnels dépassant les seuils micro ou optant pour la déclaration contrôlée (formulaires 2031/2035) font face à une comptabilité d'engagement complexe hors du cadre de la simple 2042.
    *   **Source officielle à trouver :** Notice officielle 2035 et 2031 millésime 2026.
    *   **Impact qualification :** Out_of_scope pour un MVP purement conversationnel (réorientation vers revue humaine).
*   **[P2] Nomenclature exacte des nouvelles cases du dispositif "Relance Logement" et "Chambord" :**
    *   **Pourquoi bloquant :** Les lois de finances de fin 2025 ont créé ces dispositifs pour 2026, mais les nouveaux codes de cases exacts sur le Cerfa 2042 RICI n'ont pas encore été publiés.
    *   **Source officielle à trouver :** Formulaire Cerfa 2042 RICI millésime 2026 définitif.
    *   **Impact qualification :** Simple (mise à jour de mapping requise lors de la parution d'avril 2026).