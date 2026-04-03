Voici les informations extraites des sources, structurées en objets JSON pour le MVP de la campagne `fr-2026-revenus-2025`, conformément à l'architecture de la base de connaissances :

```json
[
  {
    "id": "mvp_salaires_heures_supp",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Salaires",
    "eligibility_rule": "Le plafond des heures supplémentaires exonérées d'impôt est maintenu à 7 500 € pour les revenus 2025. Ces revenus sont exclus de l'impôt mais doivent être intégrés au Revenu Fiscal de Référence (RFR).",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Vérifier le cumul net imposable figurant sur le bulletin de paie de décembre 2025 pour s'assurer que les heures exonérées sont isolées.",
    "form": "2042",
    "section": "Traitements et salaires",
    "case_code": "1GH",
    "field_label": "Heures Supplémentaires Exonérées",
    "related_case_codes": [
      "1AJ"
    ],
    "required_documents": [
      "Bulletin de paie de décembre 2025"
    ],
    "common_mistakes": "Oublier que le dépassement du plafond de 7 500 € ou l'intégration au RFR peut gonfler ce dernier et impacter l'éligibilité à des aides sociales sous condition de ressources.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_salaires_frais_reels",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Salaires",
    "eligibility_rule": "Possibilité d'opter pour la déduction des frais réels (en utilisant le barème kilométrique 2026) au lieu de l'abattement forfaitaire automatique de 10 %.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Alerter l'utilisateur si ses frais réels calculés (ex: kilomètres + repas) sont supérieurs à 10% de son salaire net imposable, l'incitant à passer en saisie détaillée.",
    "form": "2042",
    "section": "Traitements et salaires",
    "case_code": "1AK",
    "field_label": "Frais Réels Professionnels",
    "related_case_codes": [
      "1AJ"
    ],
    "required_documents": [
      "Justificatifs de frais kilométriques (carte grise, attestation d'employeur)",
      "Justificatifs de frais de repas et de télétravail"
    ],
    "common_mistakes": "Oublier de conserver les justificatifs ou payer des dépenses en espèces (non acceptées comme preuve par l'administration).",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_pensions_enfant_majeur",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Pensions",
    "eligibility_rule": "Déduction de la pension alimentaire versée à un enfant majeur (ne vivant pas sous le toit des parents), plafonnée à 6 855 € pour l'année 2025.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Ne pas inscrire l'enfant dans le cadre des personnes à charge si une pension alimentaire est déduite.",
    "form": "2042",
    "section": "Charges déductibles",
    "case_code": "6GU",
    "field_label": "Pension Enfant Majeur Versée",
    "related_case_codes": [
      "1AS",
      "6EL",
      "6EM"
    ],
    "required_documents": [
      "Preuves de virements bancaires",
      "Justificatifs des besoins de l'enfant"
    ],
    "common_mistakes": "Cumuler le rattachement de l'enfant majeur (demi-part fiscale) avec la déduction d'une pension alimentaire pour ce même enfant.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_garde_enfant",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Frais de Garde d'Enfants",
    "eligibility_rule": "Crédit d'impôt égal à 50 % des dépenses de garde hors domicile pour les enfants de moins de 6 ans, dans la limite de 3 500 € de dépenses par enfant pour l'année 2025.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Diviser les plafonds par deux automatiquement dès que le statut de résidence alternée (cases 7GE à 7GG) est détecté.",
    "form": "2042 RICI",
    "section": "Frais de garde des enfants de moins de 6 ans",
    "case_code": "7GA",
    "field_label": "Garde Enfant < 6 ans (1er enfant)",
    "related_case_codes": [
      "7GB",
      "7GC",
      "7GE",
      "7GF",
      "7GG"
    ],
    "required_documents": [
      "Attestation fiscale annuelle délivrée par Pajemploi",
      "Factures de crèche ou d'assistante maternelle (distinguant frais de garde et nourriture)"
    ],
    "common_mistakes": "Omettre de déduire les aides perçues, comme le Complément de libre choix du Mode de Garde (CMG) versé par la CAF, de la base de calcul.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_emploi_domicile",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Emploi à Domicile",
    "eligibility_rule": "Crédit d'impôt de 50 % dans la limite de base de 12 000 €. Exigence de transparence totale pour 2026 : l'identité détaillée des bénéficiaires/prestataires est obligatoire.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Mettre en place une interface de saisie granulaire avec champs obligatoires pour les prestataires. Bloquer la validation si l'utilisateur ne fournit pas le nom ou le SIRET.",
    "form": "2042 RICI",
    "section": "Services à la personne, emploi à domicile",
    "case_code": "7DB",
    "field_label": "Dépenses d'emploi à domicile",
    "related_case_codes": [
      "7DR",
      "7DQ",
      "7DG"
    ],
    "required_documents": [
      "Attestation annuelle URSSAF/CESU",
      "Factures détaillées des organismes prestataires avec n° de SIRET"
    ],
    "common_mistakes": "Saisir un montant brut orphelin sans identifier le prestataire, ou omettre de déduire les aides perçues (ex. APA, PCH) en case 7DR.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_dons_coluche",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Dons",
    "eligibility_rule": "Le plafond du dispositif 'Coluche' (réduction de 75 %) est doublé et passe à 2 000 € pour les dons réalisés à compter du 14 octobre 2025. Un plafond spécifique de 1 000 € s'applique pour le domaine de Chambord en 2026.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Proposer une calculatrice de dons segmentée par date (avant/après le 14 octobre 2025) pour appliquer correctement la règle du 'double plafond'.",
    "form": "2042 RICI",
    "section": "Dons versés à des organismes établis en France",
    "case_code": "7UD",
    "field_label": "Dons Organismes Personnes Difficulté",
    "related_case_codes": [
      "7UF"
    ],
    "required_documents": [
      "Reçus fiscaux (Modèle 200 / Cerfa n° 11580)"
    ],
    "common_mistakes": "Ne pas faire la distinction chronologique des dons, appliquant ainsi l'ancien plafond de 1 000 € sur l'ensemble de l'année 2025.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_placement_bareme",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Intérêts Bancaires",
    "eligibility_rule": "Hausse des prélèvements sociaux à 18,6 % pour les revenus du capital (PFU global à 31,4 %). Le contribuable a la possibilité de renoncer au Prélèvement Forfaitaire Unique (PFU) en optant pour le barème progressif, souvent plus avantageux pour les tranches d'imposition à 0 % ou 11 %.",
    "declaration_step": "Étape 4 : Déclaration des Revenus et Charges",
    "online_ui_hint": "Effectuer systématiquement un test de simulation sur la case 2OP dès que des montants sont saisis en section 2 (RCM), afin d'alerter sur le gain fiscal potentiel.",
    "form": "2042",
    "section": "Revenus de capitaux mobiliers",
    "case_code": "2OP",
    "field_label": "Option Barème Progressif",
    "related_case_codes": [
      "2TR",
      "2DC",
      "2BH",
      "2CK"
    ],
    "required_documents": [
      "Imprimé Fiscal Unique (IFU) - Formulaire 2561",
      "Relevés bancaires ou de courtiers"
    ],
    "common_mistakes": "Subir le PFU par défaut en oubliant de cocher la case 2OP, même lorsque son Taux Marginal d'Imposition (TMI) est très faible ou nul.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "mvp_famille_parent_isole",
    "campaign": "fr-2026-revenus-2025",
    "topic": "Situation Familiale",
    "eligibility_rule": "Majoration d'une demi-part de quotient familial pour les parents élevant seuls leur(s) enfant(s) au 1er janvier 2025. Une demi-part s'applique aussi pour un parent vivant seul ayant élevé seul un enfant pendant au moins 5 ans (enfant non rattaché).",
    "declaration_step": "Étape 3 : Quotient Familial",
    "online_ui_hint": "Alerter l'utilisateur de confirmer ce statut (vérification de la case T ou L), car celui-ci n'est jamais reconduit automatiquement d'une année sur l'autre.",
    "form": "2042",
    "section": "Situation du foyer fiscal",
    "case_code": "T",
    "field_label": "Parent Isolé (Célibataire vivant seul avec enfant à charge)",
    "related_case_codes": [
      "L",
      "J"
    ],
    "required_documents": [
      "Justificatifs d'état civil (livret de famille, jugement de divorce)",
      "Justificatifs de domicile"
    ],
    "common_mistakes": "Croire que la case T est pré-remplie automatiquement ou cocher cette case alors que le contribuable vit en concubinage.",
    "confidence_level": "high",
    "source_refs": [
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  }
]
``` 