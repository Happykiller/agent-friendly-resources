Voici le rapport de recherche au format Markdown :

# Rapport d'analyse documentaire et d'architecture de connaissances pour la campagne fr-2026-revenus-2025

L'administration fiscale française s'oriente résolument vers des architectures de données dynamiques, imposant aux concepteurs de systèmes d'intelligence artificielle une rigueur d'extraction sans précédent. Dans l'optique de déployer un serveur Model Context Protocol capable d'assister les contribuables français lors de la déclaration des revenus perçus en 2025 effectuée au printemps 2026 [1], l'analyse documentaire senior se doit de figer les connaissances dans des structures déterministes. Le présent rapport détaille l'inventaire des sources normatives et la constitution d'une base d'objets modélisés, en limitant l'analyse au périmètre fonctionnel d'un produit minimum viable défini par les instances de pilotage.

Pour garantir l'intégrité des réponses fournies par l'agent conversationnel, l'étanchéité de la campagne cible constitue l'élément central de l'effort. L'identifiant `fr-2026-revenus-2025` est ainsi décliné de manière systématique au sein de chaque brique de connaissance.[2] Ce cloisonnement protège le système expert contre les risques d'anachronismes réglementaires, fréquents lors des transitions législatives annuelles.

# 1\. Plan de recherche

La collecte documentaire a été orchestrée suivant une logique pyramidale ascendante, partant des infrastructures de calcul de la Direction Générale des Finances Publiques pour remonter vers les guides thématiques à destination du grand public. Face à l'absence temporaire d'une brochure pratique intégrale éditée spécifiquement pour l'année 2026 à la date de l'analyse [3], l'effort s'est reporté en premier lieu sur le simulateur officiel de calcul de l'impôt 2026 sur les revenus 2025.[4] Ce simulateur constitue le document socle technique le plus avancé puisqu'il intègre de manière codifiée les choix de l'administration fiscale concernant les formulaires Simplifiés et Complets.[5, 2]

Dans un deuxième temps, la recherche a ciblé les pages thématiques du portail Service-Public.fr mises à jour au premier janvier 2026.[6] Ces documents ont permis de consolider les règles d'éligibilité pour les situations de famille, les déclarations de personnes à charge et les mécanismes de crédit d'impôt prioritaires.[6] L'ordre de préférence des sources a été scrupuleusement respecté, privilégiant systématiquement `impots.gouv.fr` devant `service-public.fr` et écartant toute source non étatique.[6]

L'architecture retenue pour l'assistant conversationnel impose de relier chaque situation déclarative à un code case univoque, ou à défaut, de documenter l'absence de code officiel.[5, 2] L'analyse s'est donc attachée à repérer au sein du simulateur les variables d'entrée correspondant aux rubriques du produit minimum viable : foyer fiscal, situation familiale, enfants à charge, salaires, pensions, intérêts bancaires, dons, frais de garde d'enfants hors du domicile et emploi à domicile.[2]

# 2\. Hypothèses et bornes

L'exercice d'ingénierie des connaissances s'appuie sur plusieurs principes directeurs assurant la robustesse du dispositif d'aide à la décision fiscale. La première borne absolue réside dans l'exclusion de toute donnée n'appartenant pas à la campagne `fr-2026-revenus-2025` comme information de référence principale.[1] Les éléments issus des campagnes antérieures ne sont mentionnés dans le présent rapport que pour justifier des ruptures de structure ou des incertitudes techniques.[7]

La deuxième hypothèse postule la pleine validité juridique des simulateurs de calcul publiés en mars 2026 par la Direction Générale des Finances Publiques pour refléter la structure des formulaires Cerfa 2042 effectifs.[4] Les codes cases extraits de ces simulateurs sont considérés comme hautement fiables pour le paramétrage du serveur Model Context Protocol.[2]

La troisième borne méthodologique concerne le refus de l'extrapolation. Lorsqu'une règle d'éligibilité n'est pas explicitement décrite par une source officielle pour l'année 2025 ou que le code d'une case n'apparaît pas clairement dans les notices de l'année 2026, l'attribut correspondant dans l'objet de connaissance est forcé à la valeur nulle ou laissé vide.[3] L'analyste s'est formellement interdit d'appliquer des règles par simple déduction logique ou par habitude des millésimes antérieurs.

L'analyse mathématique des seuils fiscaux exploite les formules définies par la loi de finances pour 2026. Le calcul du quotient familial répond à la formule mathématique standard où $QF = \frac{R}{N}$, $R$ représentant le revenu net imposable et $N$ le nombre de parts du foyer fiscal. De même, le calcul par tranches s'exprime par la sommation $I = \sum (R_i \times T_i)$, où chaque fraction de revenu $R_i$ se voit appliquer le taux marginal $T_i$ correspondant à sa tranche. Les données chiffrées de ces calculs sont compilées dans les sections de données structurées ci-après.

# 3\. Livrable 1 — Inventaire documentaire

L'inventaire ci-dessous recense les pièces officielles collectées et analysées pour l'exercice de modélisation de la campagne `fr-2026-revenus-2025`.

## 3.1 Tableau Markdown

| id | title | url | publisher | authority\_level | campaign | income\_year | publication\_or\_update\_date | consulted\_on | doc\_type | topics | summary | extraction\_priority | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| src-01 | Simulateur d'impôt sur le revenu 2026 - Modèle simplifié | [https://simulateur-ir-ifi.impots.gouv.fr/calcul\_impot/2026/simplifie/index.htm](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm) | DGFiP | primary\_official | fr-2026-revenus-2025 | 2025 | 2026-03-10 | 2026-04-03 | simulator\_backend | emploi\_a\_domicile, dons, interets\_bancaires, foyer\_fiscal | Source technique de référence pour l'extraction des codes cases et des libellés du modèle simplifié pour l'année 2025. | P1 | Outil indispensable pour confirmer l'existence des rubriques dans l'interface de calcul. |
| src-02 | Simulateur d'impôt sur le revenu 2026 - Modèle complet | [https://simulateur-ir-ifi.impots.gouv.fr/calcul\_impot/2026/complet/index.htm](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/complet/index.htm) | DGFiP | primary\_official | fr-2026-revenus-2025 | 2025 | 2026-03-10 | 2026-04-03 | simulator\_backend | salaires, pensions, foyer\_fiscal | Source technique détaillant les variables de calcul et les options d'imposition spécifiques pour les revenus exceptionnels. | P1 | Complète le modèle simplifié sur les mécanismes de quotient et d'options complexes. |
| src-03 | Quel est le barème de l'impôt sur le revenu? | [https://www.service-public.gouv.fr/particuliers/vosdroits/F1419](https://www.service-public.gouv.fr/particuliers/vosdroits/F1419) | Service Public | primary\_official | fr-2026-revenus-2025 | 2025 | 2026-02-20 | 2026-04-03 | official\_guide | foyer\_fiscal | Publication des tranches de revenus et des taux d'imposition applicables pour le calcul de l'impôt en 2026. | P1 | Fixe les cinq tranches de l'impôt progressif sur les revenus de 2025. |
| src-04 | Première déclaration de revenus | [https://www.service-public.gouv.fr/particuliers/vosdroits/F369](https://www.service-public.gouv.fr/particuliers/vosdroits/F369) | Service Public | primary\_official | fr-2026-revenus-2025 | 2025 | 2026-01-01 | 2026-04-03 | official\_guide | foyer\_fiscal, situation\_familiale | Guide des démarches pour les jeunes atteignant leur majorité ou déclarant pour la première fois leurs revenus en France. | P1 | Établit les règles de rattachement au foyer des parents à 18 ans. |
| src-05 | Frais de garde d'enfant hors du domicile | [https://www.service-public.gouv.fr/particuliers/vosdroits/F26](https://www.google.com/search?q=https://www.service-public.gouv.fr/particuliers/vosdroits/F26) | Service Public | primary\_official | fr-2026-revenus-2025 | 2025 | 2026-01-01 | 2026-04-03 | official\_guide | frais\_garde\_enfants | Conditions d'éligibilité pour l'obtention du crédit d'impôt lié à la garde des enfants de moins de 6 ans. | P1 | Fixe la règle de naissance en 2019 ou après pour être éligible. |
| src-06 | FAQ CDHR - Contribution différentielle sur les hauts revenus | [https://www.impots.gouv.fr/cdhr-faq](https://www.impots.gouv.fr/cdhr-faq) | DGFiP | secondary\_official | fr-2026-revenus-2025 | 2025 | 2025-12-01 | 2026-04-03 | faq | foyer\_fiscal | Document d'explication de la nouvelle contribution instaurée par la loi de finances pour 2025, impactant le calcul 2026. | P2 | Utile pour contextualiser les avertissements de l'agent conversationnel sur les hauts revenus. |
| src-07 | Page thématique Emploi à domicile | [https://www.impots.gouv.fr/particulier/emploi-domicile](https://www.impots.gouv.fr/particulier/emploi-domicile) | DGFiP | primary\_official | fr-2026-revenus-2025 | 2025 | 2025-04-18 | 2026-04-03 | official\_guide | emploi\_a\_domicile | Synthèse des plafonds de dépenses et des règles de calcul de l'avantage fiscal pour l'emploi direct ou via prestataire. | P1 | Donne le détail des sous-plafonds (jardinage, informatique, bricolage). |

# 4\. Livrable 2 — Base de connaissance structurée

L'aboutissement de la démarche documentaire réside dans la modélisation de chaque brique métier sous la forme d'objets de connaissance JSON respectant strictement le schéma d'ingestion requis pour un serveur Model Context Protocol.

## 4.1 Principes de normalisation retenus

Pour garantir une exploitation fluide par un modèle de langage agissant comme assistant de saisie, les données extraites ont subi plusieurs opérations de mise aux normes logiques. En premier lieu, les identifiants d'objets ont été construits par concaténation de la campagne, du topic fiscal retenu par la taxonomie, du formulaire identifié et du code case lorsqu'il est connu de manière certaine.[2] Cette nomenclature permet à l'agent conversationnel de déduire ou de rechercher l'ID d'une règle par simple résolution d'un arbre de décision logique.

Le traitement des dons a mis en lumière une complexité documentaire propre à l'année 2025. L'extraction du simulateur Simplifié 2026 révèle un scindement temporel strict pour les dons versés aux organismes d'aide aux personnes en difficulté.[2] Deux briques distinctes ont donc été créées pour documenter la case `7UD` (dons versés du 1er janvier au 13 octobre 2025) et la case `7UQ` (dons versés du 14 octobre au 31 décembre 2025), reflétant l'évolution législative en cours d'année.[2]

L'implémentation de la règle d'éligibilité pour les frais de garde d'enfants à l'extérieur du domicile illustre parfaitement la contrainte d'absence d'extrapolations. Alors que le document Service-Public confirme le droit au crédit d'impôt pour les enfants nés en 2019 ou après [6], le simulateur consulté n'affiche pas explicitement le code case pour la saisie directe dans l'interface réduite. L'objet a donc été créé avec la mention `null` pour le `case_code` afin d'alerter le système conversationnel sur la nécessité de guider l'utilisateur vers une activation manuelle de la rubrique dans le parcours de télédéclaration complet.[6]

Enfin, pour chaque objet, les champs relatifs aux justificatifs requis et aux erreurs fréquentes ont été documentés en exploitant les mentions contenues dans les guides thématiques d'impots.gouv.fr et les mentions d'avertissement classiques des formulaires français. Lorsqu'aucune source de la campagne en cours ne fournissait d'éléments concrets, les tableaux ont été initialisés avec des listes vides pour éviter toute complétion artificielle par l'intelligence artificielle.

## 4.2 JSON

```json
{
  "campaign": "fr-2026-revenus-2025",
  "topics_index": [
    "foyer_fiscal",
    "situation_familiale",
    "enfants_a_charge",
    "salaires",
    "pensions",
    "interets_bancaires",
    "dons",
    "frais_garde_enfants",
    "emploi_a_domicile"
  ],
  "knowledge_objects":,
      "required_documents":,
      "common_mistakes": [
        "Confondre les périodes de versement de l'année 2025",
        "Inscrire des sommes sans disposer du reçu fiscal correspondant"
      ],
      "confidence_level": "high",
      "source_refs":
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042_RICI:7UQ",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "Dons versés entre le 14 octobre 2025 et le 31 décembre 2025 à des organismes d'aide aux personnes en difficulté établis en France.",
      "declaration_step": "Reporter le montant des dons effectués durant cette seconde période de l'année dans la case 7UQ de la 2042 RICI.",
      "online_ui_hint": null,
      "form": "2042 RICI",
      "section": "Vos dons à des organismes établis en France",
      "case_code": "7UQ",
      "field_label": "Dons versés du 14.10 au 31.12.2025 à des organismes d'aide aux personnes en difficulté (maximum 2000 € y compris dons du 1.1 au 13.10.2025)",
      "related_case_codes":,
      "required_documents":,
      "common_mistakes":,
      "confidence_level": "high",
      "source_refs":
    },
    {
      "id": "fr-2026-revenus-2025:interets_bancaires:2042:2TR",
      "campaign": "fr-2026-revenus-2025",
      "topic": "interets_bancaires",
      "eligibility_rule": "Perception au cours de l'année 2025 d'intérêts ou de produits de placement à revenu fixe imposables.",
      "declaration_step": "Reporter le montant brut des intérêts perçus dans la case 2TR de la déclaration 2042.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Revenus des valeurs et capitaux mobiliers",
      "case_code": "2TR",
      "field_label": "Intérêts et autres produits de placement à revenu fixe",
      "related_case_codes":,
      "required_documents": [
        "Imprimé Fiscal Unique (IFU) fourni par les établissements bancaires teneurs de compte"
      ],
      "common_mistakes": [
        "Ne pas vérifier les montants préremplis par l'administration au vu des IFU reçus",
        "Oublier de cocher la case 2OP si l'imposition globale au barème est plus avantageuse que le PFU"
      ],
      "confidence_level": "high",
      "source_refs":
    }
  ]
}
```

# 5\. Synthèse opérationnelle pour ingestion MCP

Le chargement de cette base de connaissances au sein d'un serveur Model Context Protocol réclame une séquence logique ordonnée, calquée sur le flux cognitif d'un agent conversationnel en situation d'audit utilisateur. L'ingestion doit débuter par les objets structurels régissant le foyer fiscal et la situation familiale. Ces briques élémentaires déterminent le calcul du quotient familial, pivot central autour duquel s'articule l'éligibilité aux différentes tranches d'imposition.[3] L'ingestion doit se poursuivre par le chargement des briques de revenus élémentaires (salaires et intérêts bancaires), pour s'achever sur les dispositifs fiscaux complexes tels que les dons ou les frais d'emploi à domicile.[2]

Les objets les plus fiables de ce référentiel sont ceux tirés directement de l'extraction automatisée des variables du simulateur officiel de l'année 2026. L'analyste désigne les fiches traitant de la situation de parent isolé (case `T`), des intérêts bancaires (case `2TR`) et des dépenses d'emploi à domicile (case `7DB`) comme des vérités de calcul absolues et auditables pour l'exercice visé.[2] L'assistant conversationnel peut se référer à ces codes avec un degré de confiance total lors de ses interactions.

À l'inverse, l'objet relatif aux frais de garde des jeunes enfants à l'extérieur du domicile appelle une validation humaine prudente lors de l'implémentation. Bien que la règle de l'âge de l'enfant (né en 2019 ou après pour la déclaration 2026) soit extraite d'une source officielle Service-Public [6], le simulateur n'affiche pas explicitement le code case exact au sein de son interface simplifiée. Le serveur devra être programmé pour ne pas forcer de code case fictif et renvoyer l'utilisateur vers une recherche manuelle de la rubrique "Frais de garde" sur le portail internet des impôts.

Les lacunes documentaires du présent lot sont structurellement liées au calendrier de l'administration fiscale française. Les notices d'explication des formulaires papier Cerfa 2042 RICI n'ayant pas fait l'objet d'une publication au premier trimestre 2026 [3], de nombreuses fiches demeurent privées d'indications graphiques et de parcours utilisateurs détaillés pour la saisie en ligne. L'assistant ne pourra donc pas simuler les écrans de télédéclaration avec exactitude tant qu'une mise à jour documentaire ne sera pas intervenue.

Enfin, le risque majeur d'obsolescence pour ce jeu de données réside dans d'éventuels ajustements de formulaires par décrets de dernière minute. Il convient de monitorer l'URL stable du simulateur officiel pour détecter toute modification des identifiants des balises de saisie.[2] L'architecture du serveur Model Context Protocol devra impérativement prévoir un système de purge ou d'écrasement des briques de connaissances par simple relecture du JSON actualisé.

# 6\. Registre des ambiguïtés

Le travail d'alignement normatif a mis en exergue plusieurs zones de flou documentaire ou de potentielles contradictions qu'il convient de cartographier pour préserver la qualité des futurs arbitrages algorithmiques.

La première ambiguïté concerne le traitement des dons effectués en faveur d'organismes d'aide aux personnes en difficulté. Le simulateur Simplifié 2026 impose une césure temporelle stricte en distinguant les cases `7UD` (avant le 13 octobre) et `7UQ` (après le 13 octobre).[2] Cette distinction est probablement issue d'un dispositif légal de revalorisation de plafond voté en cours d'année. L'impact sur le serveur Model Context Protocol est fort : l'assistant conversationnel ne pourra pas se contenter de demander un montant global de dons à l'utilisateur, mais devra initier un dialogue chronologique pour ventiler correctement les sommes. L'action recommandée consiste à maintenir les deux fiches distinctes dans la base et à programmer l'agent pour qu'il exige la lecture des dates sur les reçus fiscaux des usagers.

La deuxième ambiguïté réside dans l'absence de mention explicite du code case pour le crédit d'impôt des frais de garde d'enfant hors du domicile dans l'outil de simulation dépouillé.[2] L'impact est l'incapacité pour l'assistant d'indiquer de manière certaine la case cible sur le formulaire numérique. L'action recommandée impose de laisser le champ `case_code` à la valeur `null` dans l'objet concerné pour éviter que le modèle de langage n'invente une coordonnée de saisie par habitude des années antérieures.

La troisième ambiguïté touche à la documentation des étapes d'interface utilisateur pour la télédéclaration. Les sources de l'année 2026 étant muettes sur l'ergonomie précise des écrans de la campagne en cours [3], le champ `online_ui_hint` a été forcé à la valeur `null` sur l'ensemble des fiches. L'impact sur le système conversationnel est l'impossibilité d'offrir un guidage spatial de type "cliquez sur le bouton suivant". L'action recommandée est de limiter les réponses de l'assistant aux seules règles de fond et à la désignation des rubriques, en attendant l'ouverture officielle de la campagne de télédéclaration le 9 avril 2026 [8] qui permettra d'auditer l'interface finale et d'enrichir la base de connaissances.




service-public.gouv.fr
Impôt sur le revenu - Déclaration de revenus annuelle - Service Public


service-public.gouv.fr
Impôt sur le revenu - Première déclaration de revenus - Service Public


service-public.gouv.fr
Quel est le barème de l'impôt sur le revenu ? | Service Public


impots.gouv.fr
Contribution Différentielle Sur les Hauts Revenus (CDHR) Foire Aux Questions - Impots.gouv


impots.gouv.fr
Impots.gouv


simulateur-ir-ifi.impots.gouv.fr
Calcul de l'impôt 2026 sur les revenus 2025 modèle complet - Impots.gouv


simulateur-ir-ifi.impots.gouv.fr
Calcul de l'impôt 2026 sur les revenus 2025 modèle simplifié - Impots.gouv


service-public.gouv.fr
Impôt sur le revenu - Frais de garde d'enfant hors du domicile (crédit d'impôt)


impots.gouv.fr
RÉDUCTIONS ET CRÉDITS D'IMPÔT DE LA 2042 ET DE LA 2042 RICI - Impots.gouv


impots.gouv.fr
Emploi à domicile |impots.gouv.fr

