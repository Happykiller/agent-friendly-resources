# Paramètres officiels pour estimate_impact — IR 2026 sur revenus 2025

## Périmètre et sources

Ce document (rédigé par Jarvis) rassemble les paramètres **déterministes** nécessaires à une estimation indicative de l’impôt sur le revenu **2026 (revenus 2025)**, en se limitant strictement à des sources publiques officielles françaises : entity["organization","DGFiP","french tax authority"] (sites et simulateur), entity["organization","Service-Public.fr","french public service portal"], entity["organization","Légifrance","french legal portal"] et entity["organization","Ministère de l'Économie, des Finances et de la Souveraineté industrielle et numérique","french ministry"]. citeturn40view0turn41view0turn14view1turn30search3

Les montants ci-dessous correspondent aux règles applicables à l’**impôt dû au titre de l’année 2025** (déclaré en 2026), dès lors que vous restez dans un **foyer fiscal “simple”** et les catégories de revenus/avantages listées dans votre demande. citeturn40view0turn18view0turn16view0

## Barème progressif de l’impôt sur le revenu

Le barème progressif applicable aux **revenus 2025** est défini par le CGI, avec 5 tranches et les taux 0 %, 11 %, 30 %, 41 %, 45 % pour **1 part** (le calcul s’opère sur le **revenu imposable par part** puis on multiplie par le nombre de parts). citeturn40view0turn30search3

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636",
  "source_title": "Code général des impôts - Article 197 (version en vigueur depuis le 21 février 2026) - Barème de l'IR applicable aux revenus 2025",
  "confidence_level": "high",
  "rule_id": "ir_2026_bareme_progressif_tranches_1_part",
  "rule_type": "bareme",
  "description": "Barème progressif IR 2026 (revenus 2025) : seuils et taux par part",
  "data": {
    "unit": "eur",
    "per": "part",
    "brackets": [
      { "lower_bound_inclusive": 0, "upper_bound_inclusive": 11600, "rate": 0.0 },
      { "lower_bound_inclusive": 11601, "upper_bound_inclusive": 29579, "rate": 0.11 },
      { "lower_bound_inclusive": 29580, "upper_bound_inclusive": 84577, "rate": 0.30 },
      { "lower_bound_inclusive": 84578, "upper_bound_inclusive": 181917, "rate": 0.41 },
      { "lower_bound_inclusive": 181918, "upper_bound_inclusive": null, "rate": 0.45 }
    ],
    "applies_to_tax_year": 2025
  },
  "changed_from_2025": true,
  "change_note": "Seuils revalorisés pour l'imposition des revenus 2025 (LF 2026, CGI art. 197 modifié)."
}
```

## Quotient familial

Le nombre de parts est fixé par le CGI (règles générales + enfants à charge, et règles spécifiques en cas de résidence alternée). citeturn41view0  
Le **plafonnement** de l’avantage en impôt procuré par les parts supplémentaires (plafond par demi-part, plafond spécifique “parent isolé” sur le 1er enfant, etc.) est prévu par le CGI. citeturn40view0

**Parent isolé (case T)** : le CGI prévoit une majoration du nombre de parts **de 0,5** pour les contribuables célibataires/divorcés vivant seuls supportant la charge exclusive/principale d’au moins un enfant ; si la charge est **uniquement** en résidence alternée, la majoration est **0,25** (1 enfant) ou **0,5** (2 enfants ou plus). citeturn41view0

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033817781",
  "source_title": "Code général des impôts - Article 194 (version en vigueur depuis le 1er janvier 2018) - Nombre de parts du quotient familial",
  "confidence_level": "high",
  "rule_id": "quotient_familial_parts_caps_2026",
  "rule_type": "bareme",
  "description": "Quotient familial : règles de parts (situation familiale/enfants), plafonnement de l'avantage et règle parent isolé (case T)",
  "data": {
    "parts_rules": {
      "base_parts": {
        "single_divorced_separated_widowed_no_dependents": 1.0,
        "married_pacsed_joint_no_dependents": 2.0
      },
      "dependent_children_exclusive_or_principal_charge": {
        "increment_first_child": 0.5,
        "increment_second_child": 0.5,
        "increment_from_third_child": 1.0
      },
      "children_alternate_custody_only_or_mixed": {
        "when_no_child_exclusive_or_principal": {
          "increment_child_1": 0.25,
          "increment_child_2": 0.25,
          "increment_from_child_3": 0.5
        },
        "when_one_child_exclusive_or_principal": {
          "increment_first_alternate_child": 0.25,
          "increment_from_second_alternate_child": 0.5
        },
        "when_two_or_more_children_exclusive_or_principal": {
          "increment_each_alternate_child": 0.5
        }
      },
      "single_parent_case_T": {
        "additional_parts_if_lives_alone_and_has_at_least_one_child_exclusive_or_principal": 0.5,
        "additional_parts_if_only_alternate_custody": {
          "one_child": 0.25,
          "two_or_more_children": 0.5
        }
      }
    },
    "advantage_cap_rules": {
      "general_cap_per_half_part_eur": 1807,
      "general_cap_per_quarter_part_eur": 903.5,
      "single_parent_first_child_special_cap_eur": 4262,
      "notes": "Plafonds issus du CGI art. 197."
    },
    "additional_sources": [
      {
        "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636",
        "source_title": "CGI - Article 197 (version en vigueur depuis le 21 février 2026) - Plafonnement du quotient familial (1 807 €/demi-part, 4 262 € cas particulier)"
      }
    ]
  },
  "changed_from_2025": true,
  "change_note": "Plafond général du quotient familial et plafonds spécifiques revalorisés pour revenus 2025 (CGI art. 197 modifié par LF 2026)."
}
```

## Abattement de 10 % sur salaires et pensions

**Principe** : abattement forfaitaire **10 %**. citeturn8view0turn10view0

**Salaires (revenus 2025)** : minimum de déduction **509 €**, maximum **14 555 €**. citeturn8view0  
**Pensions (revenus 2025)** : minimum **454 €** par bénéficiaire et plafond **4 439 €** pour l’ensemble du foyer, avec règle “si pension < minimum, la déduction est limitée au montant de la pension”. citeturn10view0  

Pour signaler l’évolution par rapport à la campagne précédente (revenus 2024), la fiche de calcul associée à la déclaration 2025 indiquait notamment : salaires min **504 €** / max **14 426 €** et pensions min **450 €** / plafond **4 399 €**. citeturn39view3turn29view1

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm",
  "source_title": "Simulateur IR 2026 (revenus 2025) - Aide 'Frais' - Déduction forfaitaire de 10% sur salaires",
  "confidence_level": "high",
  "rule_id": "abattement_10pct_salaires_et_pensions_2026",
  "rule_type": "abattement",
  "description": "Abattement forfaitaire 10% : paramètres 2026 (revenus 2025) pour salaires et pensions",
  "data": {
    "rate": 0.10,
    "salaries": {
      "minimum_deduction_eur": 509,
      "maximum_deduction_eur": 14555,
      "applies_to_income_year": 2025,
      "applies_if_not_using_actual_expenses": true
    },
    "pensions": {
      "minimum_deduction_per_beneficiary_eur": 454,
      "maximum_deduction_per_household_eur": 4439,
      "special_case_if_pension_below_minimum": "deduction_limited_to_pension_amount",
      "applies_to_income_year": 2025
    },
    "additional_sources": [
      {
        "source_url": "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/pensions.htm",
        "source_title": "Simulateur IR 2026 (revenus 2025) - Aide 'Pensions' - Abattement de 10% sur pensions"
      }
    ]
  },
  "changed_from_2025": true,
  "change_note": "Planchers/plafonds revalorisés pour revenus 2025 (ex. salaires 509/14 555 au lieu de 504/14 426 ; pensions 454/4 439 au lieu de 450/4 399)."
}
```

## Revenus de capitaux mobiliers

**Abattement 40% sur dividendes (option barème)** : le BOFiP rappelle que l’abattement est égal à **40% du montant brut perçu** des revenus distribués **éligibles**, et que les frais déductibles s’imputent **après** cet abattement. citeturn12view0  
Le site fiscal public précise que, sous option pour l’imposition au barème, l’abattement de 40% s’applique sur les dividendes éligibles (et ne s’applique pas au PFU). citeturn12view1

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://bofip.impots.gouv.fr/bofip/1562-PGP.html/identifiant=BOI-RPPM-RCM-20-10-30-20-20191220",
  "source_title": "BOI-RPPM-RCM-20-10-30-20 - Application de l'abattement de 40% sur les revenus distribués imposés au barème",
  "confidence_level": "high",
  "rule_id": "abattement_40pct_dividendes_option_bareme",
  "rule_type": "abattement",
  "description": "Dividendes au barème : abattement proportionnel de 40% sur le montant brut des revenus distribués éligibles",
  "data": {
    "rate": 0.40,
    "base": "montant_brut_percu_des_revenus_distribues_eligibles",
    "applies_only_if_option_progressive_scale": true,
    "notes": [
      "Les frais et charges déductibles s'imputent après l'application de l'abattement de 40%.",
      "L'abattement ne s'applique pas si les revenus mobiliers sont imposés au PFU."
    ]
  },
  "changed_from_2025": false
}
```

### Prélèvement forfaitaire unique

Le PFU (“flat tax”) s’applique par défaut aux revenus du capital (dont dividendes et intérêts) et **comprend** l’impôt sur le revenu et les prélèvements sociaux. citeturn14view0turn14view1  
Au **1er janvier 2026**, le taux global évolue à **31,4%** (12,8% IR + 18,6% prélèvements sociaux) du fait d’une évolution du taux de CSG mentionnée sur le portail officiel. citeturn14view0turn14view1  
Pour votre campagne **IR 2026 sur revenus 2025**, l’ordre de grandeur usuel reste **PFU 30%** pour des revenus du capital perçus en 2025 (ancien taux global explicitement mentionné comme antérieur). citeturn14view0turn12view1

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://entreprendre.service-public.gouv.fr/actualites/A18796",
  "source_title": "Service-Public Entreprendre - Évolution du taux du Prélèvement Forfaitaire Unique (PFU) (publié le 10 février 2026)",
  "confidence_level": "high",
  "rule_id": "pfu_flat_tax_rates_2026_context",
  "rule_type": "pfu",
  "description": "PFU (flat tax) : taux global et décomposition (IR + prélèvements sociaux) ; application par défaut aux intérêts/dividendes, option possible pour le barème",
  "data": {
    "applies_by_default_to": ["dividendes", "interets"],
    "income_tax_component_rate": 0.128,
    "rate_for_income_year_2025": {
      "total_rate": 0.30,
      "social_contributions_rate": 0.172,
      "note": "Taux global antérieur au 1er janvier 2026 ; pertinent pour des revenus du capital perçus en 2025."
    },
    "rate_from_2026_01_01": {
      "total_rate": 0.314,
      "social_contributions_rate": 0.186,
      "note": "Hausse mentionnée au 1er janvier 2026 (CSG +1,4 point) sur les revenus du capital perçus à compter de 2026."
    },
    "option_progressive_scale": {
      "exists": true,
      "note": "Option globale pour imposition au barème des revenus mobiliers (et conséquences : abattement 40% sur dividendes éligibles, etc.)."
    },
    "additional_sources": [
      {
        "source_url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F34913/1_7",
        "source_title": "Service-Public - Impôt sur le revenu : revenus d'épargne et de placement (mention du passage des prélèvements sociaux à 18,6% au 1.1.2026)"
      }
    ]
  },
  "changed_from_2025": true,
  "change_note": "Le PFU global passe à 31,4% au 1.1.2026 (12,8% IR + 18,6% PS) ; pour l'estimation IR 2026 sur revenus 2025, conserver 30% pour des revenus du capital perçus en 2025."
}
```

## Crédits et réductions d’impôt

### Crédit d’impôt garde d’enfant hors du domicile

Le crédit d’impôt pour frais de garde d’enfant hors du domicile est de **50%**, avec un plafond de **3 500 € de dépenses par enfant** (et **1 750 €** en cas de garde alternée). citeturn17search1turn18view0  
Sur la condition d’âge, la référence officielle précise (pour la déclaration 2026 des revenus 2025) : l’enfant doit avoir **moins de 6 ans au 1er janvier de l’année d’imposition** (donc né en **2019 ou après**). citeturn17search1

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F8",
  "source_title": "Service-Public - Frais de garde d'enfant hors du domicile (crédit d'impôt)",
  "confidence_level": "high",
  "rule_id": "credit_garde_enfant_hors_domicile_moins_6_ans_7ga",
  "rule_type": "credit",
  "description": "Crédit d'impôt garde d'enfant hors du domicile (7GA) : 50% des dépenses plafonnées",
  "data": {
    "credit_rate": 0.50,
    "expense_cap_per_child_eur": 3500,
    "expense_cap_per_child_alternate_custody_eur": 1750,
    "child_age_condition": "moins_de_6_ans_au_1er_janvier_de_l_annee_d_imposition",
    "income_year_specific_note": "Pour revenus 2025 déclarés en 2026 : enfant né en 2019 ou après.",
    "eligible_expenses_notes": [
      "Garde à l'extérieur du domicile (assistant maternel agréé, crèche/garderie/centre...).",
      "Les aides perçues doivent être déduites ; les frais de nourriture ne sont pas pris en compte."
    ],
    "ref_legal_basis": "CGI, art. 200 quater B"
  },
  "changed_from_2025": false
}
```

### Crédit d’impôt emploi à domicile

Le CGI prévoit un crédit d’impôt égal à **50%** des dépenses effectivement supportées, retenues dans une limite de **12 000 €** (avec règles de majoration et cas particuliers, dont 1ère année d’emploi direct à 15 000 € et plafond à 20 000 € en cas d’invalidité). citeturn19search2turn19search13turn19search3  
La FAQ fiscale officielle explicite également les majorations typiques (enfants à charge, personnes de plus de 65 ans, etc.). citeturn19search1

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053543952",
  "source_title": "Code général des impôts - Article 199 sexdecies - Crédit d'impôt pour l'emploi d'un salarié à domicile",
  "confidence_level": "high",
  "rule_id": "credit_emploi_a_domicile_7db",
  "rule_type": "credit",
  "description": "Crédit d'impôt emploi à domicile (7DB) : 50% des dépenses nettes d'aides, plafond de droit commun et majorations",
  "data": {
    "credit_rate": 0.50,
    "general_expense_cap_eur": 12000,
    "cap_after_majorations_eur": 15000,
    "first_year_direct_employment_cap_eur": 15000,
    "first_year_cap_after_majorations_eur": 18000,
    "special_invalidity_cap_eur": 20000,
    "majorations_common_cases": [
      { "reason": "per_child_at_charge_or_attached", "amount_eur": 1500 },
      { "reason": "per_child_alternate_custody", "amount_eur": 750 },
      { "reason": "per_household_member_age_65_or_more", "amount_eur": 1500 },
      { "reason": "per_ascendant_age_65_or_more_beneficiary_APA_at_home", "amount_eur": 1500 }
    ],
    "expenses_net_of_aids": true,
    "aids_reported_separately_examples": ["APA", "PCH", "CESU_prefinance"],
    "additional_sources": [
      {
        "source_url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
        "source_title": "impots.gouv.fr - Comment bénéficier du crédit d'impôt pour l'emploi d'un salarié à domicile ?"
      },
      {
        "source_url": "https://bofip.impots.gouv.fr/bofip/3968-PGP.html/identifiant=BOI-IR-RICI-150-20-20170920",
        "source_title": "BOFiP - Crédit d'impôt 'emploi d'un salarié à domicile' (plafonds et invalidité)"
      }
    ]
  },
  "changed_from_2025": false
}
```

### Réduction d’impôt pour dons

Le CGI prévoit : **66%** de réduction dans la limite de **20% du revenu imposable**, avec report possible de l’excédent sur **5 ans**. citeturn16view0  
Le taux **75% (“Coluche”)** concerne certains organismes (aide alimentaire, logement, soins, et depuis extension, accompagnement des victimes de violence domestique), et le plafond est désormais **2 000 €**, sans prise en compte dans le plafond de 20%. citeturn16view0turn15search2  
Pour les **dons effectués en 2025**, l’aide officielle du simulateur précise un régime transitoire : plafond **1 000 €** pour les versements du 1.1 au 13.10.2025, et **2 000 €** pour les versements du 14.10 au 31.12.2025 (plafond global 2 000 € sur l’année, le surplus bascule au 66%). citeturn15search2turn28search5

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053543932",
  "source_title": "Code général des impôts - Article 200 (version en vigueur depuis le 21 février 2026) - Réduction d'impôt pour dons (66% et 75%)",
  "confidence_level": "high",
  "rule_id": "reduction_dons_66_75_2026",
  "rule_type": "reduction",
  "description": "Réduction d'impôt dons : 66% (plafond 20% RI) et 75% (plafond 'Coluche' 2026 à 2 000€ avec règle transitoire revenus 2025)",
  "data": {
    "rate_66": {
      "rate": 0.66,
      "income_cap_fraction": 0.20,
      "excess_carry_forward_years": 5
    },
    "rate_75_coluche": {
      "rate": 0.75,
      "plafond_eur": 2000,
      "not_counted_in_20pct_cap": true,
      "eligible_organizations_summary": "Organismes apportant aide alimentaire, logement, soins à personnes en difficulté, et organismes accompagnant les victimes de violence domestique / relogement."
    },
    "income_year_2025_transitional_rule": {
      "plafond_from_2025_01_01_to_2025_10_13_eur": 1000,
      "plafond_from_2025_10_14_to_2025_12_31_eur": 2000,
      "annual_plafond_2025_eur": 2000,
      "excess_over_plafond_treated_as_66pct": true
    },
    "additional_sources": [
      {
        "source_url": "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/reductions_s.htm",
        "source_title": "Simulateur IR 2026 - Aide 'Réductions' (dons 2025 : plafond 1 000€ puis 2 000€ à compter du 14.10.2025)"
      }
    ]
  },
  "changed_from_2025": true,
  "change_note": "Plafond 'Coluche' porté à 2 000€ pour les dons effectués à compter du 14 octobre 2025 (LF 2026), avec règle transitoire détaillée pour l'année 2025."
}
```

## CEHR et micro-foncier

### CEHR

La contribution exceptionnelle sur les hauts revenus est codifiée au CGI, avec des taux **3%** et **4%** appliqués par tranches de **revenu fiscal de référence** (RFR), selon la situation (imposition commune ou non). Les seuils restent ceux fixés depuis la version en vigueur depuis 2018. citeturn21view0

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036427364",
  "source_title": "Code général des impôts - Article 223 sexies - Contribution exceptionnelle sur les hauts revenus (CEHR)",
  "confidence_level": "high",
  "rule_id": "cehr_2026_thresholds_rates",
  "rule_type": "cehr",
  "description": "CEHR : seuils et taux applicables sur le revenu fiscal de référence (RFR)",
  "data": {
    "base": "revenu_fiscal_de_reference_rfr",
    "brackets": [
      {
        "filing_status": "single_divorced_separated_widowed",
        "lower_bound_exclusive_eur": 250000,
        "upper_bound_inclusive_eur": 500000,
        "rate": 0.03
      },
      {
        "filing_status": "single_divorced_separated_widowed",
        "lower_bound_exclusive_eur": 500000,
        "upper_bound_inclusive_eur": null,
        "rate": 0.04
      },
      {
        "filing_status": "married_pacsed_joint",
        "lower_bound_exclusive_eur": 500000,
        "upper_bound_inclusive_eur": 1000000,
        "rate": 0.03
      },
      {
        "filing_status": "married_pacsed_joint",
        "lower_bound_exclusive_eur": 1000000,
        "upper_bound_inclusive_eur": null,
        "rate": 0.04
      }
    ]
  },
  "changed_from_2025": false
}
```

### Micro-foncier

Le régime micro-foncier fixe le revenu imposable à **revenu brut – abattement 30%**, lorsque le **revenu brut annuel** (au sens des articles 29 et 30) n’excède pas **15 000 €** : cela revient à retenir un revenu net imposable égal à **recettes × 70%**. citeturn23view0turn22search7

```json
{
  "campaign": "2026",
  "source_authority": "primary_official",
  "source_url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053544766",
  "source_title": "Code général des impôts - Article 32 (version en vigueur depuis le 21 février 2026) - Régime micro-foncier",
  "confidence_level": "high",
  "rule_id": "micro_foncier_abatement_30pct_net_70pct",
  "rule_type": "abattement",
  "description": "Micro-foncier : abattement forfaitaire 30% sur recettes brutes (revenu net imposable = recettes × 70%)",
  "data": {
    "gross_receipts_cap_eur": 15000,
    "abatement_rate": 0.30,
    "net_multiplier": 0.70,
    "net_taxable_income_formula": "net_taxable = gross_receipts * 0.70",
    "base": "revenu_brut_annuel_defini_aux_articles_29_et_30_cgi",
    "notes": [
      "Le régime s'apprécie au niveau du foyer fiscal.",
      "Des exclusions et une option pour le régime réel existent (non détaillées ici)."
    ],
    "additional_sources": [
      {
        "source_url": "https://bofip.impots.gouv.fr/bofip/3973-PGP.html/identifiant=BOI-RFPI-DECLA-10-20250306",
        "source_title": "BOFiP - Revenus fonciers - Régime micro-foncier (abattement de 30%)"
      }
    ]
  },
  "changed_from_2025": false
}
```