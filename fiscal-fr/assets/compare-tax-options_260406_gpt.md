Voici une version directement exploitable pour ton moteur. J’ai pris les **sources officielles** comme base de vérité, et j’ai séparé ce qui relève de la **règle légale**, du **commentaire administratif**, et du **paramètre de campagne 2026**. Pour l’arbitrage PFU, j’intègre bien le fait que **pour les revenus perçus en 2025, le PFU reste à 30 % (12,8 % IR + 17,2 % PS)** ; le **31,4 %** ne vaut qu’à compter des revenus de placements 2026 dans le cas général. ([Légifrance][1])

### 1) PFU vs barème progressif sur RCM

```json
{
  "arbitrage_id": "pfu_vs_bareme",
  "rules": [
    {
      "rule_id": "pfu_default_2025",
      "type": "stable_law",
      "label": "Imposition par défaut",
      "if": "revenus_capitaux_mobiliers_percus_en_2025",
      "then": "PFU par défaut = 12.8% IR + 17.2% prélèvements sociaux",
      "formula": "impot_total_pfu_2025 = 0.128 * assiette_ir + 0.172 * assiette_ps",
      "notes": [
        "Pour dividendes ordinaires et intérêts ordinaires, l'assiette PFU est en pratique le montant brut imposable.",
        "Le moteur doit paramétrer séparément le taux de PS par année de perception."
      ]
    },
    {
      "rule_id": "barreme_option_global",
      "type": "stable_law",
      "label": "Option globale pour le barème",
      "if": "case_2OP = true",
      "then": "Tous les revenus de capitaux mobiliers et gains mobiliers entrant dans le champ de l'option basculent au barème progressif",
      "formula": "impot_ir_bareme = tmi_effective_appliquee_aux_rcm_apres_regles_propres",
      "notes": [
        "L'option n'est pas ligne par ligne.",
        "Le moteur doit comparer PFU global vs barème global, pas revenu par revenu isolé si d'autres RCM/gains existent."
      ]
    },
    {
      "rule_id": "dividendes_barreme",
      "type": "stable_law",
      "label": "Dividendes au barème",
      "if": "revenu_type = dividende_eligible_abattement_40 AND case_2OP = true",
      "then": "Application de l'abattement de 40% avant barème",
      "formula": "base_ir_dividendes = dividendes_bruts * 0.60 - frais_deductibles_eventuels",
      "notes": [
        "L'abattement de 40% n'est pas universel : certains revenus distribués sont exclus.",
        "Sous PFU, pas d'abattement de 40%."
      ]
    },
    {
      "rule_id": "interets_barreme",
      "type": "stable_law",
      "label": "Intérêts au barème",
      "if": "revenu_type = interets AND case_2OP = true",
      "then": "Pas d'abattement de 40%",
      "formula": "base_ir_interets = interets_bruts - frais_deductibles_eventuels"
    },
    {
      "rule_id": "csg_deductible_barreme",
      "type": "administrative_commentary",
      "label": "CSG déductible en cas d'option barème",
      "if": "case_2OP = true AND revenus_ouvrant_droit_csg_deductible",
      "then": "6.8% de la base concernée est déduit du revenu global l'année suivante",
      "formula": "gain_differe_csg = 0.068 * base_eligible * tmi_future_attendue",
      "notes": [
        "Effet réel mais différé d'un an.",
        "Pour un moteur de comparaison, prévoir deux modes : comparaison cash immédiat / comparaison économique complète."
      ]
    },
    {
      "rule_id": "seuil_rentabilite_dividendes_sans_csg",
      "type": "derived_formula",
      "label": "Seuil analytique simple dividendes",
      "if": "dividendes_eligibles_40_only AND frais_deductibles = 0 AND csg_deductible_ignoree",
      "then": "Barème meilleur si TMI < 21.33%",
      "formula": "0.60 * TMI < 12.8%  =>  TMI < 21.333...%"
    },
    {
      "rule_id": "seuil_rentabilite_interets_sans_csg",
      "type": "derived_formula",
      "label": "Seuil analytique simple intérêts",
      "if": "interets_only AND frais_deductibles = 0 AND csg_deductible_ignoree",
      "then": "Barème meilleur si TMI < 12.8%",
      "formula": "TMI < 12.8%"
    },
    {
      "rule_id": "cas_systematiquement_meilleurs",
      "type": "derived_rule",
      "label": "Cas structurels",
      "if": "portefeuille_dividendes_eligibles_majoritaire AND TMI faible",
      "then": "Le barème peut être structurellement favorable",
      "notes": [
        "Typiquement TMI 0% ou 11% avec dividendes éligibles et peu d'intérêts.",
        "À l'inverse, avec intérêts majoritaires, PFU est souvent meilleur dès que TMI > 12.8%."
      ]
    },
    {
      "rule_id": "irrevocabilite",
      "type": "stable_law",
      "label": "Nature de l'option",
      "if": "declaration_annee_N",
      "then": "Option annuelle, exercée par la déclaration, donc réversible d'une année sur l'autre",
      "notes": [
        "Elle n'est pas irrévocable pluriannuellement.",
        "En revanche, pour l'année concernée, elle s'exerce globalement."
      ]
    },
    {
      "rule_id": "interactions",
      "type": "interaction",
      "label": "Interactions fortes",
      "then": [
        "Le choix 2OP modifie le revenu imposable au barème, donc peut déplacer la TMI utilisée pour l'arbitrage frais réels, pension déductible, micro-foncier/réel.",
        "La comparaison doit être faite au niveau foyer fiscal entier, pas revenu isolé."
      ]
    }
  ],
  "cases": [
    {
      "form": "2042",
      "case": "2OP",
      "meaning": "Option pour l'imposition au barème de l'ensemble des revenus et gains mobiliers entrant dans le champ"
    },
    {
      "form": "2042",
      "case": "2DC",
      "meaning": "Revenus des actions et parts / dividendes ordinaires"
    },
    {
      "form": "2042",
      "case": "2FU",
      "meaning": "Dividendes imposables de titres non cotés détenus dans un PEA/PEA-PME"
    },
    {
      "form": "2042",
      "case": "2TS",
      "meaning": "Autres revenus distribués et assimilés"
    },
    {
      "form": "2042",
      "case": "2TR",
      "meaning": "Intérêts et autres produits de placement à revenu fixe"
    },
    {
      "form": "2042",
      "case": "2TT",
      "meaning": "Intérêts des prêts participatifs et des minibons"
    },
    {
      "form": "2042",
      "case": "2CK",
      "meaning": "Crédit d'impôt correspondant au prélèvement forfaitaire non libératoire déjà prélevé"
    },
    {
      "form": "2042",
      "case": "2CA",
      "meaning": "Frais et charges déductibles des RCM soumis au barème"
    },
    {
      "form": "2042",
      "case": "2BH/2DF selon nature",
      "meaning": "Revenus déjà soumis aux prélèvements sociaux pouvant ouvrir droit à CSG déductible selon les cas"
    }
  ],
  "exclusions": [
    {
      "rule": "2OP globale",
      "incompatibility": "Impossible d'appliquer le PFU à certains RCM et le barème à d'autres revenus entrant dans le même périmètre de l'option"
    },
    {
      "rule": "Dividendes sous PFU",
      "incompatibility": "Pas d'abattement de 40% sous PFU"
    },
    {
      "rule": "Frais RCM",
      "incompatibility": "Les frais déductibles de type 2CA n'ont d'intérêt que pour les revenus imposés au barème"
    }
  ],
  "sources": [
    {
      "type": "CGI",
      "ref": "CGI art. 200 A",
      "scope": "PFU et option globale pour le barème"
    },
    {
      "type": "CGI",
      "ref": "CGI art. 158, 3-2°",
      "scope": "abattement de 40% sur certains dividendes"
    },
    {
      "type": "BOFiP",
      "ref": "BOI-RPPM-RCM-30-20",
      "scope": "prélèvements forfaitaires sur RCM"
    },
    {
      "type": "BOFiP",
      "ref": "BOI-RPPM-RCM-20-10-30-10",
      "scope": "abattement de 40%"
    },
    {
      "type": "Impots",
      "ref": "Brochure pratique IR 2025 / section RCM",
      "scope": "cases 2OP, 2DC, 2TR, 2CK, 2CA"
    }
  ],
  "test_scenarios": [
    {
      "id": "pfu_1",
      "label": "Dividendes, TMI 11%",
      "inputs": {
        "dividendes_eligibles_40": 10000,
        "interets": 0,
        "tmi": 0.11,
        "frais_rcm": 0
      },
      "expected": {
        "pfu_ir_ps": 3000,
        "bareme_ir_ps_hors_csg_future": 2380,
        "recommended": "bareme"
      }
    },
    {
      "id": "pfu_2",
      "label": "Intérêts, TMI 30%",
      "inputs": {
        "dividendes_eligibles_40": 0,
        "interets": 10000,
        "tmi": 0.30,
        "frais_rcm": 0
      },
      "expected": {
        "pfu_ir_ps": 3000,
        "bareme_ir_ps_hors_csg_future": 4720,
        "recommended": "pfu"
      }
    },
    {
      "id": "pfu_3",
      "label": "Dividendes, seuil théorique d'égalité",
      "inputs": {
        "dividendes_eligibles_40": 10000,
        "interets": 0,
        "tmi": 0.213333,
        "frais_rcm": 0
      },
      "expected": {
        "pfu_vs_bareme": "quasi_egalite_hors_effet_csg_deductible",
        "recommended": "egalite_technique_a_affiner"
      }
    },
    {
      "id": "pfu_4",
      "label": "Mix dividendes + intérêts",
      "inputs": {
        "dividendes_eligibles_40": 8000,
        "interets": 12000,
        "tmi": 0.11,
        "frais_rcm": 0
      },
      "expected": {
        "comment": "L'option 2OP étant globale, les intérêts peuvent faire perdre l'avantage obtenu sur les dividendes",
        "recommended": "simulation_globale_obligatoire"
      }
    },
    {
      "id": "pfu_5",
      "label": "Données insuffisantes",
      "inputs": {
        "dividendes_eligibles_40": null,
        "interets": 10000,
        "tmi": null,
        "frais_rcm": null
      },
      "expected": {
        "recommended": "incomparable",
        "missing_data": [
          "tmi",
          "qualification_des_dividendes",
          "frais_deductibles",
          "prise_en_compte_csg_deductible"
        ]
      }
    }
  ],
  "warnings": [
    "Ne pas comparer ligne par ligne si d'autres RCM/gains mobiliers existent : l'option 2OP est globale.",
    "L'effet de la CSG déductible est différé et dépend du revenu global futur ; sans ce paramètre, la comparaison n'est qu'approximative.",
    "L'abattement de 40% ne s'applique pas à tous les revenus distribués.",
    "Pour les revenus perçus en 2025, utiliser PS = 17.2%. Pour les revenus de placements 2026 en cas général, paramétrer PS = 18.6%."
  ]
}
```

Sources utilisées pour cet objet : CGI art. 200 A et 158, brochure pratique IR et pages impots.gouv.fr sur les valeurs mobilières, plus la mise à jour 2026 sur les prélèvements sociaux. ([Légifrance][1])

### 2) Abattement 10 % salaires vs frais réels

```json
{
  "arbitrage_id": "abattement_10_vs_frais_reels",
  "rules": [
    {
      "rule_id": "deduction_forfaitaire_default",
      "type": "stable_law",
      "label": "Déduction par défaut",
      "if": "revenus_imposes_dans_categorie_traitements_salaires AND pas_option_frais_reels",
      "then": "Déduction forfaitaire automatique de 10%",
      "formula": "deduction_forfaitaire = min(max(0.10 * salaire_imposable, 509), 14555) par salarié pour la campagne 2026 sur revenus 2025"
    },
    {
      "rule_id": "option_frais_reels",
      "type": "stable_law",
      "label": "Option frais réels",
      "if": "frais_reels_demandes",
      "then": "Déduction du montant réel justifié des dépenses professionnelles",
      "formula": "deduction_reelle = somme(frais_professionnels_necessaires_et_justifies)"
    },
    {
      "rule_id": "condition_deductibilite",
      "type": "administrative_commentary",
      "label": "Conditions de déductibilité",
      "if": "depense_candidate",
      "then": "La dépense doit être nécessité par l'emploi, engagée pour acquérir ou conserver le revenu, payée en 2025 et justifiable",
      "notes": [
        "Inclut notamment déplacements, repas supplémentaires, documentation, certains frais de télétravail selon conditions."
      ]
    },
    {
      "rule_id": "decision_rule",
      "type": "derived_rule",
      "label": "Règle de décision",
      "if": "frais_reels_justifies > deduction_forfaitaire",
      "then": "frais_reels_recommandes",
      "else": "abattement_10_recommande"
    },
    {
      "rule_id": "seuil_rentabilite",
      "type": "derived_formula",
      "label": "Seuil analytique",
      "if": "aucun_effet_secondaire",
      "then": "Les frais réels deviennent meilleurs dès qu'ils dépassent la déduction forfaitaire",
      "formula": "seuil = min(max(10% * salaire_imposable, 509), 14555)"
    },
    {
      "rule_id": "cas_systematiquement_meilleurs",
      "type": "derived_rule",
      "label": "Cas structurels",
      "then": [
        "Si frais justifiés très faibles ou absents, l'abattement de 10% est structurellement meilleur.",
        "Si forts trajets domicile-travail, double résidence, frais spécifiques élevés et justifiés, les frais réels deviennent souvent meilleurs."
      ]
    },
    {
      "rule_id": "scope_by_taxpayer",
      "type": "administrative_commentary",
      "label": "Choix par membre du foyer",
      "then": "Chaque membre du foyer peut choisir individuellement son régime",
      "notes": [
        "On ne peut pas mixer 10% et frais réels pour une même personne sur la même catégorie de salaires."
      ]
    },
    {
      "rule_id": "revocability",
      "type": "stable_law",
      "label": "Nature de l'option",
      "then": "Option annuelle, réversible d'une année sur l'autre"
    },
    {
      "rule_id": "interactions",
      "type": "interaction",
      "label": "Interactions",
      "then": [
        "Le choix modifie le revenu net imposable, donc potentiellement la TMI utilisée dans les autres arbitrages.",
        "Les remboursements ou indemnités de frais par l'employeur doivent être retraités différemment selon l'option choisie."
      ]
    }
  ],
  "cases": [
    {
      "form": "2042",
      "case": "1AJ à 1DJ",
      "meaning": "Salaires et assimilés à déclarer"
    },
    {
      "form": "2042",
      "case": "1AK à 1DK",
      "meaning": "Montant des frais réels demandés en déduction"
    }
  ],
  "exclusions": [
    {
      "rule": "meme_personne_meme_categorie",
      "incompatibility": "Impossible de cumuler abattement 10% et frais réels sur une même base salariale pour un même contribuable"
    },
    {
      "rule": "indemnites_employeur",
      "incompatibility": "Une dépense remboursée par l'employeur ne peut pas être redéduite"
    }
  ],
  "sources": [
    {
      "type": "CGI",
      "ref": "CGI art. 83, 3°",
      "scope": "déduction forfaitaire et frais réels"
    },
    {
      "type": "BOFiP",
      "ref": "BOI-IR-BASE-10-10-10 / BOI-RSA-BASE-30-50-20 / BOI-RSA-BASE-30-50-30",
      "scope": "règles de détermination du revenu net et frais réels"
    },
    {
      "type": "Impots",
      "ref": "Question pratique impots.gouv.fr sur la déduction forfaitaire de 10%",
      "scope": "paramètres 2026 : min 509 €, max 14 555 €"
    },
    {
      "type": "Service Public",
      "ref": "Frais professionnels : forfait ou frais réels",
      "scope": "choix par membre du foyer et conditions pratiques"
    }
  ],
  "test_scenarios": [
    {
      "id": "frais_1",
      "label": "Favorable au forfait",
      "inputs": {
        "salaire_imposable": 30000,
        "frais_reels_justifies": 1800
      },
      "expected": {
        "forfait": 3000,
        "frais_reels": 1800,
        "recommended": "abattement_10"
      }
    },
    {
      "id": "frais_2",
      "label": "Favorable aux frais réels",
      "inputs": {
        "salaire_imposable": 30000,
        "frais_reels_justifies": 4200
      },
      "expected": {
        "forfait": 3000,
        "frais_reels": 4200,
        "recommended": "frais_reels"
      }
    },
    {
      "id": "frais_3",
      "label": "Egalité",
      "inputs": {
        "salaire_imposable": 30000,
        "frais_reels_justifies": 3000
      },
      "expected": {
        "forfait": 3000,
        "frais_reels": 3000,
        "recommended": "egalite_technique"
      }
    },
    {
      "id": "frais_4",
      "label": "Cas plancher",
      "inputs": {
        "salaire_imposable": 4000,
        "frais_reels_justifies": 450
      },
      "expected": {
        "forfait": 509,
        "frais_reels": 450,
        "recommended": "abattement_10"
      }
    },
    {
      "id": "frais_5",
      "label": "Données manquantes",
      "inputs": {
        "salaire_imposable": 30000,
        "frais_reels_justifies": null,
        "justificatifs": false
      },
      "expected": {
        "recommended": "abattement_10_par_defaut",
        "missing_data": [
          "detail_des_frais",
          "justificatifs",
          "remboursements_employeur"
        ]
      }
    }
  ],
  "warnings": [
    "Le moteur doit retraiter les remboursements de frais par l'employeur ; sinon le calcul est faux.",
    "Les frais réels sans justificatifs ne sont pas fiables pour un arbitrage automatisé.",
    "Les barèmes kilométriques ne suffisent pas à eux seuls : il faut aussi vérifier distance, fréquence, type de véhicule, éventuelles limitations et remboursements."
  ]
}
```

Sources utilisées pour cet objet : CGI art. 83, documentation impots.gouv.fr mise à jour au 1er avril 2026, brochure pratique et fiche Service public. ([Légifrance][2])

### 3) Micro-foncier vs régime réel

```json
{
  "arbitrage_id": "micro_foncier_vs_reel",
  "rules": [
    {
      "rule_id": "micro_foncier_eligibility",
      "type": "stable_law",
      "label": "Eligibilité au micro-foncier",
      "if": "revenus_bruts_fonciers_annuels <= 15000 AND locations_nues_eligibles AND non_exclu_regime_special",
      "then": "micro_foncier_applicable_de_plein_droit",
      "formula": "revenu_imposable_micro = recettes_brutes * 0.70"
    },
    {
      "rule_id": "micro_foncier_exclusions",
      "type": "administrative_commentary",
      "label": "Exclusions",
      "then": [
        "Certains régimes spéciaux excluent le micro-foncier.",
        "Si revenus fonciers uniquement via certaines parts de sociétés immobilières/FPI, exclusion du micro-foncier."
      ]
    },
    {
      "rule_id": "reel_formula",
      "type": "stable_law",
      "label": "Régime réel",
      "if": "regime_reel_de_plein_droit OR option_reel",
      "then": "déduction des charges effectivement déductibles",
      "formula": "revenu_imposable_reel = loyers_bruts - charges_deductibles - interets_emprunt - travaux_deductibles - autres_charges_deductibles"
    },
    {
      "rule_id": "decision_rule",
      "type": "derived_rule",
      "label": "Règle de décision",
      "if": "charges_deductibles_totales > 30% des recettes brutes",
      "then": "regime_reel_tend_a_etre_meilleur",
      "else": "micro_foncier_tend_a_etre_meilleur",
      "notes": [
        "Règle heuristique seulement.",
        "Il faut intégrer aussi l'effet déficit foncier et la nature exacte des charges."
      ]
    },
    {
      "rule_id": "seuil_analytique_simple",
      "type": "derived_formula",
      "label": "Seuil analytique simple",
      "if": "pas_de_regles_speciales AND pas_de_deficit_foncier_complexe",
      "then": "Egalité quand charges_deductibles = 30% des recettes brutes",
      "formula": "micro = 0.70 * recettes ; reel = recettes - charges ; egalite si charges = 0.30 * recettes"
    },
    {
      "rule_id": "deficit_foncier",
      "type": "stable_law",
      "label": "Déficit foncier",
      "if": "charges_hors_interets > loyers",
      "then": "possibilite de deficit foncier imputable selon les règles du régime réel",
      "notes": [
        "Le micro-foncier ne permet pas de constater les charges réelles ni de déficit foncier calculé de cette manière."
      ]
    },
    {
      "rule_id": "option_reel_irrevocable",
      "type": "stable_law",
      "label": "Nature de l'option",
      "if": "micro_eligible AND depot_2044",
      "then": "option pour le réel exercée par le simple dépôt de la 2044",
      "notes": [
        "Option irrévocable pendant 3 ans.",
        "Ensuite renouvellement tacite annuel."
      ]
    },
    {
      "rule_id": "interactions",
      "type": "interaction",
      "label": "Interactions",
      "then": [
        "Le régime réel peut diminuer le revenu global taxable et modifier la TMI, donc influencer PFU/barème et pension alimentaire.",
        "En présence d'autres arbitrages, la comparaison doit être faite sur l'impôt foyer complet."
      ]
    }
  ],
  "cases": [
    {
      "form": "2042",
      "case": "4BE",
      "meaning": "Recettes brutes micro-foncier, sans abattement"
    },
    {
      "form": "2042",
      "case": "4BA",
      "meaning": "Revenus fonciers imposables reportés depuis la 2044 en régime réel"
    },
    {
      "form": "2042",
      "case": "4BB",
      "meaning": "Déficits fonciers imputables sur revenus fonciers des années suivantes selon report 2044"
    },
    {
      "form": "2042",
      "case": "4BC",
      "meaning": "Déficit foncier imputable sur le revenu global selon report 2044"
    },
    {
      "form": "2042",
      "case": "4BZ",
      "meaning": "Demande d'envoi de la 2044 spéciale l'année suivante sur papier ; pas une case d'option pour le réel simple"
    },
    {
      "form": "2044",
      "case": "declaration_annexe",
      "meaning": "L'option pour le réel s'exerce par le simple dépôt de la déclaration 2044"
    }
  ],
  "exclusions": [
    {
      "rule": "micro_vs_reel",
      "incompatibility": "Pour un même foyer et les mêmes revenus fonciers concernés, micro-foncier et réel sont mutuellement exclus pour l'année"
    },
    {
      "rule": "regimes_speciaux",
      "incompatibility": "Certains dispositifs immobiliers spéciaux excluent l'accès au micro-foncier"
    }
  ],
  "sources": [
    {
      "type": "CGI",
      "ref": "CGI art. 32",
      "scope": "micro-foncier"
    },
    {
      "type": "CGI",
      "ref": "CGI art. 13 et 28",
      "scope": "revenu foncier imposable et charges"
    },
    {
      "type": "BOFiP",
      "ref": "BOI-RFPI-DECLA-10",
      "scope": "micro-foncier"
    },
    {
      "type": "BOFiP",
      "ref": "BOI-RFPI-DECLA-20",
      "scope": "régime réel"
    },
    {
      "type": "Impots",
      "ref": "Brochure pratique IR / revenus fonciers + notice 2044",
      "scope": "cases 4BE, 4BA et irrévocabilité 3 ans"
    }
  ],
  "test_scenarios": [
    {
      "id": "foncier_1",
      "label": "Favorable au micro",
      "inputs": {
        "recettes_brutes": 10000,
        "charges_deductibles": 1500
      },
      "expected": {
        "micro_base": 7000,
        "reel_base": 8500,
        "recommended": "micro_foncier"
      }
    },
    {
      "id": "foncier_2",
      "label": "Favorable au réel",
      "inputs": {
        "recettes_brutes": 10000,
        "charges_deductibles": 4500
      },
      "expected": {
        "micro_base": 7000,
        "reel_base": 5500,
        "recommended": "regime_reel"
      }
    },
    {
      "id": "foncier_3",
      "label": "Egalité théorique",
      "inputs": {
        "recettes_brutes": 10000,
        "charges_deductibles": 3000
      },
      "expected": {
        "micro_base": 7000,
        "reel_base": 7000,
        "recommended": "egalite_technique"
      }
    },
    {
      "id": "foncier_4",
      "label": "Cas limite de seuil",
      "inputs": {
        "recettes_brutes": 15000,
        "charges_deductibles": 2900
      },
      "expected": {
        "eligibility_micro": true,
        "recommended": "micro_foncier_probable"
      }
    },
    {
      "id": "foncier_5",
      "label": "Données manquantes / régime spécial",
      "inputs": {
        "recettes_brutes": 12000,
        "charges_deductibles": null,
        "regime_special": true
      },
      "expected": {
        "eligibility_micro": "a_verifier",
        "recommended": "incomparable_sans_qualification_juridique"
      }
    }
  ],
  "warnings": [
    "La règle seuil 30% est seulement un raccourci ; elle devient fausse si déficit foncier, intérêts d'emprunt, travaux importants ou régime spécial.",
    "Le dépôt d'une 2044 déclenche une option réel irrévocable pendant 3 ans.",
    "Le moteur doit distinguer location nue, parts de SCI/FPI, régime spécial, travaux, intérêts, charges récupérables, assurances, taxe foncière."
  ]
}
```

Sources utilisées pour cet objet : BOFiP micro-foncier/réel, brochure pratique, notice 2044 et page Service public sur les revenus locatifs non meublés. ([Bofip][3])

### 4) Rattachement enfant majeur vs détachement avec pension alimentaire

```json
{
  "arbitrage_id": "rattachement_enfant_majeur_vs_pension",
  "rules": [
    {
      "rule_id": "rattachement_conditions_celibataire",
      "type": "stable_law",
      "label": "Rattachement enfant majeur célibataire",
      "if": "enfant_majeur_celibataire_age < 21_au_1_janvier_2025 OR (etudiant AND age < 25_au_1_janvier_2025) OR enfant_handicape",
      "then": "rattachement_possible",
      "notes": [
        "Pour un enfant majeur célibataire rattaché, les parents bénéficient d'une augmentation du nombre de parts de quotient familial."
      ]
    },
    {
      "rule_id": "rattachement_conditions_marie_pacse",
      "type": "stable_law",
      "label": "Rattachement enfant majeur marié/pacsé/chargé de famille",
      "if": "conditions_age_ou_handicap_remplies",
      "then": "rattachement_possible_mais_pas_de_part_supplementaire",
      "formula": "avantage = abattement_revenu_imposable_de_6855_eur_par_personne_rattachee_en_campagne_2026"
    },
    {
      "rule_id": "effet_rattachement",
      "type": "stable_law",
      "label": "Effets du rattachement",
      "if": "rattachement = true",
      "then": [
        "Les revenus de l'enfant sont intégrés dans la déclaration des parents.",
        "Pour un enfant célibataire : effet quotient familial.",
        "Pour un enfant marié/pacsé/chargé de famille : abattement sur revenu, pas part supplémentaire."
      ]
    },
    {
      "rule_id": "pension_conditions",
      "type": "stable_law",
      "label": "Pension alimentaire déductible",
      "if": "enfant_non_rattache AND revenus_enfant_insuffisants",
      "then": "pension_deductible_du_revenu_global_dans_les_limites_legales"
    },
    {
      "rule_id": "pension_limits_2026",
      "type": "campaign_parameter",
      "label": "Plafonds 2026 sur revenus 2025",
      "then": [
        "Enfant majeur vivant chez vous : forfait logement/nourriture 4 039 €, possibilité d'ajouter d'autres dépenses justifiées dans la limite totale de 6 855 € par enfant.",
        "Enfant majeur ne vivant pas chez vous : plafond général 6 855 € par enfant célibataire.",
        "Plafonds doublés dans certains cas pour enfant marié/pacsé/chargé de famille selon participation des beaux-parents."
      ]
    },
    {
      "rule_id": "decision_rule",
      "type": "derived_rule",
      "label": "Règle de décision économique",
      "then": [
        "Comparer le gain d'impôt procuré par le rattachement (parts ou abattement) au gain d'impôt procuré par la déduction de pension.",
        "Pour la pension, le gain fiscal approximatif = pension_deductible * TMI_effective_du_foyer."
      ]
    },
    {
      "rule_id": "cas_systematiquement_meilleurs",
      "type": "derived_rule",
      "label": "Cas structurels",
      "then": [
        "Si foyer à TMI élevée et pension réellement versée proche du plafond, le détachement + pension devient souvent plus favorable.",
        "Si enfant célibataire sans revenus ou faibles revenus et foyer à TMI modeste, le rattachement via quotient familial peut être meilleur.",
        "Aucune des deux branches n'est toujours meilleure sans simulation complète, car le quotient familial est plafonné."
      ]
    },
    {
      "rule_id": "irrevocability",
      "type": "stable_law",
      "label": "Nature du choix",
      "then": "Choix annuel ; l'option de rattachement est irrévocable pour l'année concernée"
    },
    {
      "rule_id": "interactions",
      "type": "interaction",
      "label": "Interactions",
      "then": [
        "Le rattachement modifie le nombre de parts et parfois le revenu imposable total ; cela influe sur PFU/barème et l'intérêt des frais réels.",
        "La pension déductible baisse le revenu global ; cela peut aussi modifier la TMI."
      ]
    }
  ],
  "cases": [
    {
      "form": "2042",
      "case": "Cadre D page 2",
      "meaning": "Rattachement d'enfants majeurs ou mariés/pacsés"
    },
    {
      "form": "2042",
      "case": "6EL et 6EM",
      "meaning": "Pensions alimentaires versées à des enfants majeurs"
    },
    {
      "form": "2042",
      "case": "Cadre C page 2",
      "meaning": "Personnes à charge ; utile pour distinguer enfants à charge vs rattachés selon situation"
    }
  ],
  "exclusions": [
    {
      "rule": "rattachement_vs_pension",
      "incompatibility": "Le rattachement de l'enfant majeur exclut la déduction d'une pension alimentaire pour ce même enfant"
    },
    {
      "rule": "membre_du_foyer",
      "incompatibility": "On ne déduit pas de pension versée à un membre de son propre foyer fiscal"
    }
  ],
  "sources": [
    {
      "type": "CGI",
      "ref": "CGI art. 156, II-2°",
      "scope": "déduction des pensions alimentaires"
    },
    {
      "type": "Impots",
      "ref": "Notice 2042 / brochure situation du foyer",
      "scope": "cadre D, irrévocabilité annuelle du rattachement, cases 6EL 6EM"
    },
    {
      "type": "Service Public",
      "ref": "Revenus et rattachement d'un enfant majeur",
      "scope": "conditions d'âge, étudiant, handicap, effet part/abattement"
    },
    {
      "type": "Service Public",
      "ref": "Pensions alimentaires versées aux enfants",
      "scope": "conditions et limites"
    },
    {
      "type": "Service Public actualité 2026",
      "ref": "nouveaux plafonds de déduction des pensions alimentaires",
      "scope": "montants 2026 sur revenus 2025"
    }
  ],
  "test_scenarios": [
    {
      "id": "enfant_1",
      "label": "Favorable au rattachement",
      "inputs": {
        "enfant": {
          "statut": "celibataire_etudiant_20_ans",
          "revenus": 1500
        },
        "foyer": {
          "tmi": 0.11,
          "pension_versee": 3000
        }
      },
      "expected": {
        "comment": "Gain quotient familial potentiellement supérieur à l'économie liée à une pension modeste",
        "recommended": "rattachement"
      }
    },
    {
      "id": "enfant_2",
      "label": "Favorable à la pension",
      "inputs": {
        "enfant": {
          "statut": "non_rattache_celibataire",
          "revenus": 0
        },
        "foyer": {
          "tmi": 0.41,
          "pension_versee": 6855
        }
      },
      "expected": {
        "gain_pension_approx": 2810.55,
        "recommended": "detachement_pension"
      }
    },
    {
      "id": "enfant_3",
      "label": "Egalité à affiner",
      "inputs": {
        "enfant": {
          "statut": "celibataire_etudiant_22_ans",
          "revenus": 0
        },
        "foyer": {
          "tmi": 0.30,
          "pension_versee": 4000
        }
      },
      "expected": {
        "recommended": "simulation_complete_necessaire",
        "comment": "Comparer plafond quotient familial réellement utilisable vs économie de pension"
      }
    },
    {
      "id": "enfant_4",
      "label": "Cas limite d'éligibilité",
      "inputs": {
        "enfant": {
          "statut": "celibataire_non_etudiant_21_ans_au_1_janvier_2025"
        }
      },
      "expected": {
        "rattachement": false,
        "recommended": "detachement_si_aide_etat_de_besoin"
      }
    },
    {
      "id": "enfant_5",
      "label": "Données manquantes",
      "inputs": {
        "enfant": {
          "age": null,
          "etudiant": null,
          "revenus": null,
          "domicilie_chez_parents": null
        },
        "foyer": {
          "tmi": null,
          "pension_versee": null
        }
      },
      "expected": {
        "recommended": "incomparable",
        "missing_data": [
          "age_au_1_janvier_2025",
          "statut_etudiant",
          "handicap",
          "revenus_enfant",
          "montant_pension",
          "domiciliation",
          "situation_maritale"
        ]
      }
    }
  ],
  "warnings": [
    "Le moteur doit intégrer le plafonnement du quotient familial ; sinon il surestimera souvent l'intérêt du rattachement.",
    "Pour la pension, il faut vérifier l'état de besoin de l'enfant et la réalité des versements ou avantages en nature.",
    "Rattachement et pension sont mutuellement exclus pour le même enfant sur la même année.",
    "Le choix se fait à l'échelle du foyer fiscal complet et dépend aussi des revenus de l'enfant intégrés en cas de rattachement."
  ]
}
```

Sources utilisées pour cet objet : Service public sur le rattachement et la pension, notice 2042 et brochure situation du foyer. ([Service Public][4])

### Points critiques pour ton moteur MCP

1. **PFU vs barème** doit être simulé **globalement au niveau foyer**, car **2OP est globale** sur le périmètre visé ; un moteur ligne par ligne donnera de faux arbitrages. 

2. **Frais réels** doivent être portés **par contribuable**, pas seulement par foyer, car chaque membre peut choisir son régime. ([Service Public][5])

3. **Micro-foncier vs réel** nécessite un état de qualification juridique du bien, pas seulement des montants ; le seuil des **30 %** n’est qu’une heuristique de premier niveau. ([impots.gouv.fr][6])

4. **Rattachement vs pension** exige l’intégration du **plafonnement du quotient familial** dans la simulation ; sinon le moteur survalorise le rattachement. ([Service Public][4])

5. Pour ton **lot 1**, je te conseille de stocker chaque arbitrage avec deux couches :

   * une couche **eligibility**
   * une couche **comparison**

   et, pour PFU/RCM et rattachement, une troisième couche **global_recompute_required = true**, car ces arbitrages modifient trop fortement le calcul du foyer pour être traités en delta local. Cette conclusion est une inférence d’architecture à partir des règles officielles ci-dessus. 

Je peux maintenant te faire la **version normalisée finale en un seul JSON array strict**, prête à injecter dans ton MCP, avec un schéma homogène et sans texte autour.

[1]: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053546896 "Article 200 A - Code général des impôts - Légifrance"
[2]: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053545390 "Article 83 - Code général des impôts - Légifrance"
[3]: https://bofip.impots.gouv.fr/bofip/3973-PGP.html/identifiant%3DBOI-RFPI-DECLA-10-20160706?utm_source=chatgpt.com "BOI-RFPI-DECLA-10 - Revenus fonciers - Régime micro-foncier"
[4]: https://www.service-public.fr/particuliers/vosdroits/F3085 "Impôt sur le revenu - Revenus et rattachement d'un enfant majeur | Service Public"
[5]: https://www.service-public.fr/particuliers/vosdroits/F1989?lang=en "Impôt sur le revenu - Frais professionnels : forfait ou frais réels (déduction) | Service Public"
[6]: https://www.impots.gouv.fr/sites/default/files/formulaires/2044/2025/2044_5135.pdf "210x305"
