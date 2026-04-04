# Jarvis — Base documentaire MCP pour la déclaration 2026 des revenus 2025

## Plan de recherche

La campagne cible est verrouillée sur **revenus 2025 / déclaration 2026** et l’identifiant unique **`fr-2026-revenus-2025`**.

Le plan suivi est volontairement court :
- Collecter les **documents socle** disponibles pour la campagne (2042 + 2042 RICI) et les **FAQ officielles** relatives au MVP.
- Compléter par **Service Public** uniquement pour cadrage campagne / points “justificatifs” (quand mieux spécifié), sans introduire de règles non confirmées.
- Extraire uniquement ce qui est **explicitement** mentionné (cases, rubriques, étapes UI, justificatifs), sinon laisser `null` / `[]`.
- Normaliser en objets versionnables (IDs déterministes, sources traçables, niveau de confiance).

## Hypothèses et bornes

**Campagne cible.** Tout ce livrable est construit pour `fr-2026-revenus-2025` (déclaration 2026, revenus 2025). Les sources “impots.gouv.fr” proviennent de la entity["organization","Direction générale des finances publiques (DGFiP)","france tax authority"]. citeturn17view0turn21view0turn9view0

**État de publication au 03/04/2026.** Les fiches Service Public indiquent que la **déclaration 2026 des revenus 2025 débute le 9 avril 2026**. citeturn23view0  
Service Public mentionne aussi que, pour certains contenus, les **formulaires / services en ligne / documents d’information ne sont “pas encore disponibles” pour la campagne 2026** (information de contexte utile à la robustesse produit). citeturn24view0  
En conséquence, les “documents socle” exploités côté impots.gouv.fr sont ici les **projets d’imprimés** (“PROJET”) disponibles en PDF pour **REVENUS 2025** (2042 et 2042 RICI). citeturn17view2turn21view0  
Cette mention “PROJET” crée un **risque d’ajustement** jusqu’à publication finale : le niveau de confiance est ajusté **au cas par cas** (voir `confidence_level` et `notes`). citeturn17view2turn21view0

**Périmètre MVP respecté.** Priorité donnée aux topics imposés : `foyer_fiscal`, `situation_familiale`, `enfants_a_charge`, `salaires`, `pensions`, `interets_bancaires`, `dons`, `frais_garde_enfants`, `emploi_a_domicile`. Tout ce qui sort de ce périmètre n’a pas été “promu” en connaissance de référence.

**Règle anti-hallucination.** Aucune case, libellé, justificatif, étape UI n’est inventé : si non trouvé explicitement dans les sources consultées, les champs restent `null` ou `[]`.

## Livrable 1 — Inventaire documentaire

### Tableau Markdown

| id | title | url | publisher | authority_level | campaign | income_year | publication_or_update_date | consulted_on | doc_type | topics | summary | extraction_priority | notes |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| fr-2026-revenus-2025:doc:2042_projet_rev2025 | Déclaration préremplie n°2042 — REVENUS 2025 (PROJET) | citeturn4view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | non indiqué dans le PDF (mention “PROJET”) citeturn17view2 | 2026-04-03 | pdf_form_project | foyer_fiscal, situation_familiale, enfants_a_charge, salaires, pensions, interets_bancaires, dons, emploi_a_domicile | Formulaire socle : repères de rubriques + cases (ex : 1AJ/1BJ, 1AS/1BS, 2TR, 7UD/7UF/7UJ/7UO, 7DB/7DR/7DQ/7DL). | P1 | Support “cases & libellés” le plus structurant, mais **statut PROJET**. |
| fr-2026-revenus-2025:doc:2042_RICI_projet_rev2025 | Déclaration n°2042 RICI — REVENUS 2025 (PROJET) | citeturn20view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | non indiqué dans le PDF (mention “PROJET”) citeturn21view0 | 2026-04-03 | pdf_form_project | emploi_a_domicile, frais_garde_enfants, dons | Annexe MVP : détail “services à la personne” (codes BDA…BEA) + cases frais de garde (7GA…7GG) + dons UE (7VA/7VC). | P1 | Support “détail RICI” ; PROJET. |
| fr-2026-revenus-2025:faq:garde_enfants_exterieur | Je fais garder mon jeune enfant à l’extérieur du domicile. Que puis-je déduire ? | citeturn8view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn8view0 | 2026-04-03 | faq_page | frais_garde_enfants | Règles & plafonds campagne 2026 (revenus 2025), + cases 7GA…7GG, + étape 3 télédéclaration, + exigence de justificatif distinguant nourriture / garde. | P1 | Source thématique MVP la plus “opérationnelle”. |
| fr-2026-revenus-2025:faq:emploi_domicile | Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ? | citeturn9view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn9view0 | 2026-04-03 | faq_page | emploi_a_domicile | Règles & plafonds + étapes UI (étape 3 “Charges” → “Réductions et crédits d’impôt”) + cases 7DB/7DR (+ mention détail BDA…BEA). | P1 | Une phrase contient un libellé “première fois en 2024” : à recouper avec le PROJET 2042 (qui indique 2025). citeturn9view0turn17view3 |
| fr-2026-revenus-2025:faq:dons_association | J’ai fait des dons à une association. Que puis-je déduire ? | citeturn10view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn10view0 | 2026-04-03 | faq_page | dons | Règles 2025/2026, plafonds, **cases** 7UF/7UD/7UQ/7UJ/7UO + UI étape 3 + “ne joignez pas les reçus”. | P1 | Contrôle d’ambiguïté : 7UQ est cité ici mais n’apparaît pas dans le PROJET 2042 consulté. citeturn10view0turn17view3 |
| fr-2026-revenus-2025:faq:placements_banque_ifu | J’ai des placements à la banque. Que faire du justificatif (IFU) ? | citeturn16view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn16view0 | 2026-04-03 | faq_page | interets_bancaires | Explique l’IFU, le pré-remplissage, et cite la rubrique RCM avec exemples de cases dont 2TR. | P2 | Très utile côté “justificatif” + “quoi faire si non prérempli”. |
| fr-2026-revenus-2025:faq:salaires_pensions_non_preremplis | Mes salaires ou pensions ne sont pas pré-remplis. Que faire ? | citeturn12view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn12view0 | 2026-04-03 | faq_page | salaires, pensions | Donne les sources de montants (bulletins / attestations) et indique comment corriger en ligne (icône “crayon”). | P2 | Sert surtout aux hints UI + justificatifs “montant imposable”. |
| fr-2026-revenus-2025:faq:enfant_majorite | Mon enfant atteint sa majorité au cours de l’année, comment le déclarer ? | citeturn11view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | (page sans “Publié” capturé, mais texte explicite “printemps 2026”) citeturn11view0 | 2026-04-03 | faq_page | enfants_a_charge, salaires | Règles spécifiques “18 ans en 2025” pour déclaration printemps 2026 ; cite 1CJ/1DJ et 1AJ dans les exemples. | P1 | Très utile pour qualification conversationnelle. |
| fr-2026-revenus-2025:faq:mariage_pacs | Je me marie ou me pacse, comment déclarer mes revenus ? | citeturn13view0 | DGFiP (impots.gouv.fr) | primary_official | fr-2026-revenus-2025 | 2025 | modifié le 01/04/2026 citeturn13view0 | 2026-04-03 | faq_page | situation_familiale, foyer_fiscal | Process pas-à-pas en ligne + papier (déclaration commune, option de déclarations séparées l’année de l’événement). | P1 | Source UI la plus explicite pour ce thème. |
| fr-2026-revenus-2025:sp:declaration_annuelle | Service Public — Impôt sur le revenu : déclaration annuelle | citeturn23view0 | Service Public (DILA) | secondary_official | fr-2026-revenus-2025 | 2025 | mention “débutera le 9 avril 2026” citeturn23view0 | 2026-04-03 | service_public_fiche | foyer_fiscal | Cadre campagne (démarrage 2026, logique “infos correctes / situation changée”). | P2 | Sert de garde-fou calendrier (temps réel). |
| fr-2026-revenus-2025:sp:justifs_emploi_domicile | Service Public — Crédit d’impôt emploi à domicile | citeturn23view1 | Service Public (DILA) | secondary_official | fr-2026-revenus-2025 | 2025 | section “Justificatifs des dépenses” citeturn23view1 | 2026-04-03 | service_public_fiche | emploi_a_domicile | Énumère explicitement les justificatifs à conserver (Urssaf, factures prestataires). | P2 | Utile pour `required_documents` sans extrapolation. |
| fr-2026-revenus-2025:sp:salaires_info_campagne | Service Public — Salaire imposable (contexte campagne) | citeturn24view0 | Service Public (DILA) | secondary_official | fr-2026-revenus-2025 | 2025 | vérifié le 20/02/2026 + “formulaires pas encore disponibles” citeturn24view0 | 2026-04-03 | service_public_fiche | salaires | Confirme le contexte “campagne 2026” et l’indisponibilité temporaire de formulaires (selon SP) au moment de vérification. | P3 | Rôle : borne d’obsolescence/disponibilité. |
| fr-2026-revenus-2025:sp:enfant_mineur_charge | Service Public — Enfant mineur à charge | citeturn23view2 | Service Public (DILA) | secondary_official | fr-2026-revenus-2025 | 2025 | mentions explicites “déclaration 2026 des revenus de 2025” citeturn23view2 | 2026-04-03 | service_public_fiche | enfants_a_charge | Définit enfant mineur à charge et repère année de naissance (2007+). | P3 | Complément utile si FAQ impots insuffisante. |

### JSON

```json
[
  {
    "id": "fr-2026-revenus-2025:doc:2042_projet_rev2025",
    "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
    "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "pdf_form_project",
    "topics": [
      "foyer_fiscal",
      "situation_familiale",
      "enfants_a_charge",
      "salaires",
      "pensions",
      "interets_bancaires",
      "dons",
      "emploi_a_domicile"
    ],
    "summary": "Formulaire socle (PROJET) : rubriques/cases 2042 pour revenus 2025 (déclaration 2026).",
    "extraction_priority": "P1",
    "notes": "Document marqué PROJET : risque de micro-ajustements avant publication finale."
  },
  {
    "id": "fr-2026-revenus-2025:doc:2042_RICI_projet_rev2025",
    "title": "Déclaration n°2042 RICI — REVENUS 2025 (PROJET)",
    "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rici_rev2025_projet.pdf",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "pdf_form_project",
    "topics": [
      "emploi_a_domicile",
      "frais_garde_enfants",
      "dons"
    ],
    "summary": "Annexe 2042 RICI (PROJET) : détail des dépenses (services à la personne) + cases garde d’enfants et certains dons.",
    "extraction_priority": "P1",
    "notes": "Document marqué PROJET."
  },
  {
    "id": "fr-2026-revenus-2025:faq:garde_enfants_exterieur",
    "title": "Je fais garder mon jeune enfant à l'extérieur du domicile. Que puis-je déduire ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/je-fais-garder-mon-jeune-enfant-lexterieur-du-domicile-que-puis-je-deduire",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "frais_garde_enfants"
    ],
    "summary": "Règles, plafonds, justificatifs et cases 7GA-7GG + hint UI étape 3 télédéclaration.",
    "extraction_priority": "P1",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:faq:emploi_domicile",
    "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "emploi_a_domicile"
    ],
    "summary": "Règles/plafonds + étapes UI + cases 7DB/7DR et détail BDA-BEA (2042 RICI).",
    "extraction_priority": "P1",
    "notes": "Une phrase mentionne 'première fois en 2024' : à recouper avec le PROJET 2042 (qui indique 2025)."
  },
  {
    "id": "fr-2026-revenus-2025:faq:dons_association",
    "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "dons"
    ],
    "summary": "Taux, plafonds, cases 7UF/7UD/7UQ/7UJ/7UO + UI étape 3 + conservation des reçus.",
    "extraction_priority": "P1",
    "notes": "7UQ cité dans la FAQ mais non vu dans le PROJET 2042 consulté."
  },
  {
    "id": "fr-2026-revenus-2025:faq:placements_banque_ifu",
    "title": "J'ai des placements à la banque. Que dois-je faire du justificatif adressé par la banque ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/jai-des-placements-la-banque-celle-ci-ma-adresse-un-justificatif-que-dois-je",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "interets_bancaires"
    ],
    "summary": "Explique l'IFU, le préremplissage, et citations de cases dont 2TR.",
    "extraction_priority": "P2",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:faq:salaires_pensions_non_preremplis",
    "title": "Mes salaires ou mes pensions ne sont pas pré-remplis. Que faire ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/mes-salaires-ou-mes-pensions-ne-sont-pas-preremplis-que-faire",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "salaires",
      "pensions"
    ],
    "summary": "Comment retrouver les montants imposables et corriger en ligne (icône 'crayon').",
    "extraction_priority": "P2",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:faq:enfant_majorite",
    "title": "Mon enfant atteint sa majorité au cours de l'année, comment le déclarer ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/mon-enfant-atteint-sa-majorite-au-cours-de-lannee-comment-le-declarer",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "enfants_a_charge",
      "salaires"
    ],
    "summary": "Cas '18 ans en 2025' et conséquences sur déclaration de revenus 2025 au printemps 2026.",
    "extraction_priority": "P1",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:faq:mariage_pacs",
    "title": "Je me marie ou me pacse, comment déclarer mes revenus ?",
    "url": "https://www.impots.gouv.fr/particulier/questions/comment-declarer-nos-revenus-lannee-du-mariage-ou-pacs",
    "publisher": "DGFiP (impots.gouv.fr)",
    "authority_level": "primary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-04-01",
    "consulted_on": "2026-04-03",
    "doc_type": "faq_page",
    "topics": [
      "situation_familiale",
      "foyer_fiscal"
    ],
    "summary": "Procédure en ligne/papier pour déclaration commune et option d'imposition séparée l'année de l'événement.",
    "extraction_priority": "P1",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:sp:declaration_annuelle",
    "title": "Impôt sur le revenu - Déclaration de revenus annuelle",
    "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F358",
    "publisher": "Service Public (DILA)",
    "authority_level": "secondary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "service_public_fiche",
    "topics": [
      "foyer_fiscal"
    ],
    "summary": "Cadre calendrier : début de la déclaration 2026 des revenus 2025 (9 avril 2026).",
    "extraction_priority": "P2",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:sp:justifs_emploi_domicile",
    "title": "Crédit d'impôt pour l'emploi d'un salarié à domicile",
    "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F12",
    "publisher": "Service Public (DILA)",
    "authority_level": "secondary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "service_public_fiche",
    "topics": [
      "emploi_a_domicile"
    ],
    "summary": "Liste explicite des justificatifs à conserver (Urssaf, factures prestataires).",
    "extraction_priority": "P2",
    "notes": null
  },
  {
    "id": "fr-2026-revenus-2025:sp:salaires_info_campagne",
    "title": "Impôt sur le revenu - Salaire et autres revenus d'activité salariée imposables",
    "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F1225",
    "publisher": "Service Public (DILA)",
    "authority_level": "secondary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": "2026-02-20",
    "consulted_on": "2026-04-03",
    "doc_type": "service_public_fiche",
    "topics": [
      "salaires"
    ],
    "summary": "Contexte campagne : page 'déclaration 2026 revenus 2025' et mention d'indisponibilité temporaire des formulaires/services/documents.",
    "extraction_priority": "P3",
    "notes": "Utilisé comme borne d'obsolescence/disponibilité."
  },
  {
    "id": "fr-2026-revenus-2025:sp:enfant_mineur_charge",
    "title": "Impôt sur le revenu - Enfant mineur à charge",
    "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2633",
    "publisher": "Service Public (DILA)",
    "authority_level": "secondary_official",
    "campaign": "fr-2026-revenus-2025",
    "income_year": 2025,
    "publication_or_update_date": null,
    "consulted_on": "2026-04-03",
    "doc_type": "service_public_fiche",
    "topics": [
      "enfants_a_charge"
    ],
    "summary": "Définition enfant mineur à charge + repère année de naissance (2007+).",
    "extraction_priority": "P3",
    "notes": null
  }
]
```

## Livrable 2 — Base de connaissance structurée

### Principes de normalisation retenus

Les objets ci-dessous sont normalisés pour être **interrogeables / versionnables** par un serveur MCP fiscal, en respectant strictement :
- **Campagne** forcée à `fr-2026-revenus-2025`.
- **IDs déterministes** au format `campaign:topic:form_or_none:case_or_slug`.
- `case_code` renseigné **uniquement si explicitement présent** dans une source (PDF/FAQ/Service Public), sinon `null`.  
- `online_ui_hint` renseigné **uniquement** quand une source décrit explicitement le parcours (ex : “étape 3”, activation de rubrique, barre de recherche, icône “crayon”). citeturn8view0turn9view0turn10view0turn12view0
- Gestion du statut **PROJET** : quand les cases/libellés proviennent des imprimés “PROJET”, la confiance est parfois abaissée à `medium` si un risque d’écart est détecté (ex : divergence 7UQ entre FAQ et PROJET 2042). citeturn10view0turn17view3

Extraction principale (cases & rubriques) depuis les formulaires PROJET 2042/2042 RICI REVENUS 2025. citeturn17view1turn17view2turn17view3turn21view1  
Extraction principale (règles, plafonds, justificatifs, UI) depuis les FAQ impots.gouv.fr (modifiées au 01/04/2026) et, pour certains justificatifs, depuis Service Public. citeturn8view0turn9view0turn10view0turn23view1

### JSON

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
  "knowledge_objects": [
    {
      "id": "fr-2026-revenus-2025:foyer_fiscal:none:debut_campagne_2026",
      "campaign": "fr-2026-revenus-2025",
      "topic": "foyer_fiscal",
      "eligibility_rule": "La campagne de déclaration 2026 portant sur les revenus 2025 débute le 9 avril 2026 (calendrier officiel Service Public).",
      "declaration_step": "Avant de commencer la saisie, vérifier que la campagne 'déclaration 2026 des revenus 2025' est ouverte (à partir du 9 avril 2026).",
      "online_ui_hint": null,
      "form": null,
      "section": null,
      "case_code": null,
      "field_label": "démarrage de la campagne de déclaration en ligne",
      "related_case_codes": [],
      "required_documents": [],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Impôt sur le revenu - Déclaration de revenus annuelle",
          "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F358",
          "publisher": "Service Public (DILA)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention: 'La déclaration 2026 des revenus de 2025 débutera le 9 avril 2026.'"
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:situation_familiale:2042:statut_foyer_M_C_O_D_V",
      "campaign": "fr-2026-revenus-2025",
      "topic": "situation_familiale",
      "eligibility_rule": "Le statut du foyer fiscal en 2025 est déclaré par coche d'une des cases: Marié(e)s (M), Pacsé(e)s (O), Célibataire (C), Divorcé(e)/séparé(e) (D), Veuf(ve) (V).",
      "declaration_step": "Dans la déclaration 2042 (cadre 'Situation du foyer fiscal en 2025'), cocher la case correspondant à la situation au titre de 2025.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Situation du foyer fiscal en 2025",
      "case_code": null,
      "field_label": "statut du foyer fiscal (marié/pacsé/célibataire/divorcé/veuf)",
      "related_case_codes": [
        "M",
        "O",
        "C",
        "D",
        "V"
      ],
      "required_documents": [],
      "common_mistakes": [],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: 'Situation du foyer fiscal en 2025' avec cases M/O/C/D/V (document marqué PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:situation_familiale:2042:B",
      "campaign": "fr-2026-revenus-2025",
      "topic": "situation_familiale",
      "eligibility_rule": "L'année où un mariage ou Pacs est déclaré, il existe une option d'imposition séparée: l'imprimé 2042 prévoit une case d'option (B) et la FAQ décrit la procédure.",
      "declaration_step": "Si choix d'imposition séparée pour l'année du mariage/Pacs: cocher la case B sur 2042 et déposer 2 déclarations séparées selon la procédure décrite (en ligne ou papier).",
      "online_ui_hint": "Déclaration en ligne: répondre 'Oui' à la question sur l'événement (mariage/Pacs), puis choisir 'remplir une déclaration individuelle' si option séparée; le second conjoint se connecte ensuite et dépose sa déclaration.",
      "form": "2042",
      "section": "Situation du foyer fiscal en 2025",
      "case_code": "B",
      "field_label": "option pour la déclaration séparée des revenus 2025 (année de l'événement)",
      "related_case_codes": [],
      "required_documents": [],
      "common_mistakes": [
        "Tenter d'appliquer l'option d'imposition séparée au-delà de l'année de l'événement (mariage/Pacs): la FAQ précise que l'option ne vaut que pour cette année."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Je me marie ou me pacse, comment déclarer mes revenus ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-declarer-nos-revenus-lannee-du-mariage-ou-pacs",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Option d’imposition séparée' + procédure en ligne/papier (modifié le 01/04/2026)."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: case 'Vous optez pour la déclaration séparée de vos revenus 2025' = B (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:enfants_a_charge:2042:F",
      "campaign": "fr-2026-revenus-2025",
      "topic": "enfants_a_charge",
      "eligibility_rule": "Déclarer le nombre d'enfants à charge (moins de 18 ans nés du 01/01/2007 au 31/12/2025, ou handicapés quel que soit l'âge) en case F sur 2042.",
      "declaration_step": "Dans 2042 (cadre 'Personnes à charge en 2025'), renseigner la case F (nombre) et les renseignements sur les enfants (nom, date/lieu de naissance).",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Personnes à charge en 2025",
      "case_code": "F",
      "field_label": "nombre d'enfants à charge (charge exclusive/principale)",
      "related_case_codes": [
        "G"
      ],
      "required_documents": [],
      "common_mistakes": [],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: cadre 'Personnes à charge en 2025' – Enfants à charge: case F; enfants invalidité: case G (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:enfants_a_charge:2042:H",
      "campaign": "fr-2026-revenus-2025",
      "topic": "enfants_a_charge",
      "eligibility_rule": "Déclarer le nombre d'enfants en résidence alternée (moins de 18 ans nés du 01/01/2007 au 31/12/2025, ou handicapés quel que soit l'âge) en case H sur 2042.",
      "declaration_step": "Dans 2042 (cadre 'Personnes à charge en 2025'), renseigner la case H et, si demandé, les informations sur l'autre parent.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Personnes à charge en 2025",
      "case_code": "H",
      "field_label": "nombre d'enfants en résidence alternée / charge partagée",
      "related_case_codes": [
        "I"
      ],
      "required_documents": [],
      "common_mistakes": [],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: 'Enfants en résidence alternée...': case H; enfants invalidité alternée: case I (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:enfants_a_charge:2042:J_N",
      "campaign": "fr-2026-revenus-2025",
      "topic": "enfants_a_charge",
      "eligibility_rule": "Le rattachement en 2025 d'enfants majeurs ou mariés se déclare via le cadre dédié: case J (enfants célibataires majeurs sans enfant) et case N (enfants mariés/pacsés ou chargés de famille).",
      "declaration_step": "Dans 2042 (cadre 'Rattachement en 2025 d’enfants majeurs ou mariés'), renseigner J et/ou N et compléter l'identité/adresse demandée.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Rattachement en 2025 d'enfants majeurs ou mariés",
      "case_code": null,
      "field_label": "rattachement d'enfants majeurs ou mariés",
      "related_case_codes": [
        "J",
        "N"
      ],
      "required_documents": [
        "demande de rattachement / attestation sur l'honneur (à conserver en cas de demande)"
      ],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: cadre 'Rattachement en 2025...' : J et N (PROJET)."
        },
        {
          "title": "Impôt sur le revenu - Revenus et rattachement d'un enfant majeur",
          "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F3085",
          "publisher": "Service Public (DILA)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Votre enfant majeur est rattaché' : conserver la demande de rattachement (attestation sur l'honneur)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:enfants_a_charge:none:majorite_en_2025",
      "campaign": "fr-2026-revenus-2025",
      "topic": "enfants_a_charge",
      "eligibility_rule": "Pour la déclaration des revenus 2025 (printemps 2026), si l'enfant a eu 18 ans en 2025, plusieurs cas existent (reste ou non à charge sur toute l'année; cas exceptionnel d'imposition propre sur toute l'année).",
      "declaration_step": "Qualifier la situation (à charge jusqu'à majorité puis non; à charge toute l'année; imposition propre). En déduire si une déclaration séparée de l'enfant est nécessaire et où déclarer ses revenus selon l'exemple officiel.",
      "online_ui_hint": null,
      "form": null,
      "section": null,
      "case_code": null,
      "field_label": "règles enfant atteignant 18 ans en 2025 (déclaration printemps 2026)",
      "related_case_codes": [
        "1CJ",
        "1DJ",
        "1AJ"
      ],
      "required_documents": [],
      "common_mistakes": [
        "En cas de parents imposés séparément, tenter de compter l'enfant à charge chez un parent jusqu'à sa majorité puis chez l'autre ensuite (interdit selon la FAQ)."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Mon enfant atteint sa majorité au cours de l'année, comment le déclarer ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/mon-enfant-atteint-sa-majorite-au-cours-de-lannee-comment-le-declarer",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Votre enfant a eu 18 ans en 2025' + exemples citant 1CJ/1DJ et 1AJ (printemps 2026)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:salaires:2042:1AJ_1DJ",
      "campaign": "fr-2026-revenus-2025",
      "topic": "salaires",
      "eligibility_rule": "Les traitements et salaires imposables sont à déclarer (ou corriger si préremplis inexacts) dans les cases 1AJ/1BJ (déclarants) et 1CJ/1DJ (personnes à charge).",
      "declaration_step": "Sur 2042, rubrique 'Traitements et salaires', vérifier les montants préremplis; corriger si inexact. Si non prérempli, reporter le total imposable indiqué sur les justificatifs.",
      "online_ui_hint": "Déclaration en ligne: si montants préremplis, ils peuvent être modifiés via l'icône 'crayon' ou directement dans la case si l'icône n'est pas présente.",
      "form": "2042",
      "section": "Traitements, salaires, pensions, rentes",
      "case_code": null,
      "field_label": "traitements et salaires (montant imposable)",
      "related_case_codes": [
        "1AJ",
        "1BJ",
        "1CJ",
        "1DJ"
      ],
      "required_documents": [
        "bulletins de paie (total imposable annuel)",
        "attestation annuelle France Travail pour allocations chômage (si concerné)"
      ],
      "common_mistakes": [
        "Ne pas vérifier un montant prérempli alors qu'il est inexact (la FAQ indique que cela peut arriver)."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.3: 'Traitements et salaires' — cases 1AJ/1BJ/1CJ/1DJ (PROJET)."
        },
        {
          "title": "Mes salaires ou mes pensions ne sont pas pré-remplis. Que faire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/mes-salaires-ou-mes-pensions-ne-sont-pas-preremplis-que-faire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Rubrique 'Traitements et salaires': utiliser bulletins; chômage: courrier France Travail; correction en ligne via icône 'crayon'."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:pensions:2042:1AS_1DS",
      "campaign": "fr-2026-revenus-2025",
      "topic": "pensions",
      "eligibility_rule": "Les pensions, retraites et rentes (montants imposables) sont à déclarer ou corriger dans les cases 1AS/1BS (déclarants) et 1CS/1DS (personnes à charge).",
      "declaration_step": "Sur 2042, rubrique 'Pensions, retraites et rentes', vérifier les montants préremplis; corriger si inexact. Si non prérempli, reporter le montant imposable depuis l'attestation/relevé.",
      "online_ui_hint": "Déclaration en ligne: correction des montants préremplis possible via l'icône 'crayon' ou directement dans la case concernée (selon disponibilité de l'icône).",
      "form": "2042",
      "section": "Traitements, salaires, pensions, rentes",
      "case_code": null,
      "field_label": "pensions, retraites et rentes (montant imposable)",
      "related_case_codes": [
        "1AS",
        "1BS",
        "1CS",
        "1DS"
      ],
      "required_documents": [
        "attestation fiscale / relevé de la caisse de retraite indiquant le montant imposable"
      ],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.3: 'Pensions, retraites et rentes' — cases 1AS/1BS/1CS/1DS (PROJET)."
        },
        {
          "title": "Mes salaires ou mes pensions ne sont pas pré-remplis. Que faire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/mes-salaires-ou-mes-pensions-ne-sont-pas-preremplis-que-faire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Rubrique 'Pensions et retraites': consulter relevé/attestation fiscale de caisse; montants de retenue à la source aussi préremplis en principe."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:interets_bancaires:2042:2TR",
      "campaign": "fr-2026-revenus-2025",
      "topic": "interets_bancaires",
      "eligibility_rule": "Les intérêts et autres produits de placement à revenu fixe relèvent de la rubrique 'Revenus de capitaux mobiliers' et sont déclarés en case 2TR (si non préremplis ou à corriger).",
      "declaration_step": "Vérifier si les intérêts sont préremplis; sinon reporter le montant en s'aidant de l'IFU (imprimé fiscal unique) transmis par la banque et du récapitulatif des cases.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Revenus de capitaux mobiliers",
      "case_code": "2TR",
      "field_label": "intérêts et autres produits de placement à revenu fixe",
      "related_case_codes": [
        "2DH",
        "2DC",
        "2CH",
        "2TS"
      ],
      "required_documents": [
        "IFU (imprimé fiscal unique) de la banque"
      ],
      "common_mistakes": [
        "Ne pas conserver l'IFU (la FAQ indique de le conserver et de ne le transmettre que sur demande)."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.3: 'Intérêts et autres produits de placement à revenu fixe' — case 2TR (PROJET)."
        },
        {
          "title": "J'ai des placements à la banque. Que dois-je faire du justificatif adressé par la banque ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-des-placements-la-banque-celle-ci-ma-adresse-un-justificatif-que-dois-je",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Explique l'IFU + indique que le récapitulatif mentionne notamment la case 2TR."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042:7UF",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "Dons à des organismes d'intérêt général situés en France: réduction d'impôt de 66% dans la limite de 20% du revenu imposable (déclaration des versements 01/01/2025–31/12/2025).",
      "declaration_step": "Reporter le montant des dons concernés en case 7UF.",
      "online_ui_hint": "Déclaration en ligne: à l'étape 3, sélectionner 'Réductions et crédit d’impôt' dans la partie 'Charges' puis 'Suivant', ou saisir directement le code de case dans la barre de recherche.",
      "form": "2042",
      "section": "Réductions et crédits d'impôt",
      "case_code": "7UF",
      "field_label": "dons versés à d'autres organismes d'intérêt général (France)",
      "related_case_codes": [
        "7UD",
        "7UQ",
        "7UJ",
        "7UO"
      ],
      "required_documents": [
        "reçus de dons (à conserver, non à joindre)"
      ],
      "common_mistakes": [
        "Joindre les reçus de dons à la déclaration (la FAQ indique de ne pas les joindre et de les conserver)."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Dons aux organismes d'intérêt général' : 66% + case 7UF + UI étape 3 + conservation des reçus."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Dons versés à d’autres organismes d’intérêt général...' — case 7UF (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042:7UD",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "Dons à des organismes d'aide aux personnes en difficulté (repas/soins/logement): réduction de 75% avec plafond spécifique en 2025; la FAQ distingue des périodes et prévoit des cases différentes.",
      "declaration_step": "Déclarer les dons de même nature versés entre le 01/01/2025 et le 13/10/2025 en case 7UD (selon la FAQ) et appliquer la logique de plafond décrite.",
      "online_ui_hint": "Déclaration en ligne: même mécanisme que pour 7UF (étape 3 → 'Charges' → 'Réductions et crédit d’impôt').",
      "form": "2042",
      "section": "Réductions et crédits d'impôt",
      "case_code": "7UD",
      "field_label": "dons à des organismes d'aide aux personnes en difficulté (période 01/01/2025–13/10/2025)",
      "related_case_codes": [
        "7UQ"
      ],
      "required_documents": [
        "reçus de dons (à conserver, non à joindre)"
      ],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Dons aux organismes d'aide aux personnes en difficulté' : case 7UD pour la période indiquée."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042:7UQ",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "La FAQ indique que les dons 'de même nature' (aide aux personnes en difficulté) réalisés du 14/10/2025 au 31/12/2025 sont à déclarer dans une case dédiée 7UQ.",
      "declaration_step": "Déclarer les dons concernés (période 14/10/2025–31/12/2025) en case 7UQ selon la FAQ officielle.",
      "online_ui_hint": "Déclaration en ligne: même mécanisme que pour 7UF (étape 3 → 'Charges' → 'Réductions et crédit d’impôt').",
      "form": "2042",
      "section": "Réductions et crédits d'impôt",
      "case_code": "7UQ",
      "field_label": "dons à des organismes d'aide aux personnes en difficulté (période 14/10/2025–31/12/2025)",
      "related_case_codes": [
        "7UD"
      ],
      "required_documents": [
        "reçus de dons (à conserver, non à joindre)"
      ],
      "common_mistakes": [],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention explicite: 'Les dons de même nature réalisés à compter du 14 octobre 2025 ... seront à déclarer dans la case 7UQ.'"
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4 (PROJET) : visibles 7UD/7UJ/7UO/7UF mais pas 7UQ → risque de version incomplète."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042:7UJ",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "Dons à la Fondation du Patrimoine pour la sauvegarde du patrimoine religieux: réduction de 75% dans la limite de 1 000 €; déclaration 2026 des revenus 2025.",
      "declaration_step": "Indiquer en case 7UJ les versements effectués entre le 01/01/2025 et le 31/12/2025 (selon conditions précisées).",
      "online_ui_hint": "Déclaration en ligne: mécanisme étape 3 'Charges' → 'Réductions et crédit d’impôt' (même méthode que 7UF selon la FAQ).",
      "form": "2042",
      "section": "Réductions et crédits d'impôt",
      "case_code": "7UJ",
      "field_label": "dons pour la sauvegarde du patrimoine religieux",
      "related_case_codes": [],
      "required_documents": [
        "reçus de dons (à conserver, non à joindre)"
      ],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Dons à la Fondation du Patrimoine...' : case 7UJ + période 2025."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Dons versés pour la sauvegarde du patrimoine religieux' — case 7UJ (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:dons:2042:7UO",
      "campaign": "fr-2026-revenus-2025",
      "topic": "dons",
      "eligibility_rule": "Dons versés du 01/01/2025 au 17/05/2025 en faveur de l'aide aux victimes du cyclone Chido à Mayotte: réduction de 75% dans la limite de 2 000 € (selon la FAQ).",
      "declaration_step": "Reporter le montant des dons concernés en case 7UO selon les périodes/conditions décrites.",
      "online_ui_hint": "Déclaration en ligne: mécanisme étape 3 'Charges' → 'Réductions et crédit d’impôt'.",
      "form": "2042",
      "section": "Réductions et crédits d'impôt",
      "case_code": "7UO",
      "field_label": "dons cyclone Chido à Mayotte (période 01/01/2025–17/05/2025)",
      "related_case_codes": [],
      "required_documents": [
        "reçus de dons (à conserver, non à joindre)"
      ],
      "common_mistakes": [],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "J'ai fait des dons à une association. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/jai-fait-des-dons-une-association-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Dons ... cyclone Chido à Mayotte' : case 7UO + période."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Dons ... cyclone Chido à Mayotte' — case 7UO (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:frais_garde_enfants:2042_RICI:7GA_7GC",
      "campaign": "fr-2026-revenus-2025",
      "topic": "frais_garde_enfants",
      "eligibility_rule": "Crédit d'impôt pour frais de garde à l'extérieur du domicile: enfants de moins de 6 ans au 1er janvier 2025; dépenses éligibles (crèches, garderies, centres de loisirs sans hébergement, assistants maternels agréés, etc.). Crédit = 50% dans la limite de 3 500 € par enfant (règles spécifiques en résidence alternée).",
      "declaration_step": "Déduire de la base les aides perçues (ex: complément de libre choix du mode de garde, aides employeur/CE) puis déclarer les frais de garde pour chaque enfant (1er, 2e, 3e) en cases 7GA, 7GB, 7GC.",
      "online_ui_hint": "Déclaration en ligne: indiquer les dépenses éligibles à l'étape 3; les cases apparaissent automatiquement dans le parcours.",
      "form": "2042 RICI",
      "section": "Frais de garde des enfants de moins de 6 ans",
      "case_code": null,
      "field_label": "frais de garde hors domicile (charge exclusive/principale) — 1er à 3e enfant",
      "related_case_codes": [
        "7GA",
        "7GB",
        "7GC"
      ],
      "required_documents": [
        "justificatif de l'établissement distinguant frais de nourriture et frais de garde",
        "preuve des frais effectivement supportés"
      ],
      "common_mistakes": [
        "Inclure des frais non liés à la simple garde (ex: frais de nourriture) alors qu'ils sont exclus selon la FAQ."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Je fais garder mon jeune enfant à l'extérieur du domicile. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/je-fais-garder-mon-jeune-enfant-lexterieur-du-domicile-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Règles 'moins de 6 ans au 1er janvier 2025' + plafond 3 500€ + exigence justificatif + cases 7GA/7GB/7GC."
        },
        {
          "title": "Déclaration n°2042 RICI — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rici_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: 'Frais de garde des enfants de moins de 6 ans...' — cases 7GA/7GB/7GC (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:frais_garde_enfants:2042_RICI:7GE_7GG",
      "campaign": "fr-2026-revenus-2025",
      "topic": "frais_garde_enfants",
      "eligibility_rule": "Crédit d'impôt frais de garde à l'extérieur du domicile en résidence alternée: mêmes principes d'éligibilité; plafond spécifique par parent selon la FAQ.",
      "declaration_step": "Déduire les aides perçues de la base puis déclarer les frais de garde (1er à 3e enfant) en cases 7GE, 7GF, 7GG.",
      "online_ui_hint": "Déclaration en ligne: à l'étape 3, indiquer les dépenses éligibles; les cases apparaissent automatiquement dans le parcours.",
      "form": "2042 RICI",
      "section": "Frais de garde des enfants de moins de 6 ans",
      "case_code": null,
      "field_label": "frais de garde hors domicile (résidence alternée) — 1er à 3e enfant",
      "related_case_codes": [
        "7GE",
        "7GF",
        "7GG"
      ],
      "required_documents": [
        "justificatif de l'établissement distinguant frais de nourriture et frais de garde",
        "preuve des frais effectivement supportés"
      ],
      "common_mistakes": [
        "Oublier d'appliquer le plafond spécifique résidence alternée décrit dans la FAQ."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Je fais garder mon jeune enfant à l'extérieur du domicile. Que puis-je déduire ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/je-fais-garder-mon-jeune-enfant-lexterieur-du-domicile-que-puis-je-deduire",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention résidence alternée + cases 7GE/7GF/7GG."
        },
        {
          "title": "Déclaration n°2042 RICI — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rici_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.2: 'Enfants à charge en résidence alternée' — cases 7GE/7GF/7GG (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:emploi_a_domicile:2042:7DB",
      "campaign": "fr-2026-revenus-2025",
      "topic": "emploi_a_domicile",
      "eligibility_rule": "Crédit d'impôt 'services à la personne / emploi à domicile': dépenses de services à la personne rendus à la résidence principale ou secondaire située en France, ou dépenses supportées pour rémunérer un salarié au domicile d'un ascendant bénéficiaire APA. Crédit = 50% des dépenses, dans une limite annuelle avec majorations possibles (selon conditions).",
      "declaration_step": "Déclarer le montant total des dépenses d'emploi à domicile en case 7DB; si aides perçues, les déclarer en 7DR. Sur 2042 RICI, détailler par type de prestation.",
      "online_ui_hint": "Déclaration en ligne: étape 3 → 'Charges' → cocher 'Réductions et crédits d’impôt' puis 'Suivant' pour saisir 7DB et 7DR le cas échéant.",
      "form": "2042",
      "section": "Services à la personne / emploi à domicile",
      "case_code": "7DB",
      "field_label": "dépenses de services à la personne / emploi à domicile",
      "related_case_codes": [
        "7DR",
        "7DQ",
        "7DL"
      ],
      "required_documents": [
        "attestations établies par l'Urssaf (emploi direct)",
        "factures des associations/entreprises/organismes agréés (prestataires)",
        "preuves de salaires et cotisations sociales (emploi direct)"
      ],
      "common_mistakes": [
        "Oublier de détailler les dépenses 'services à la personne' sur 2042 RICI quand 7DB est utilisé."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Décrit éligibilité + taux 50% + cases 7DB/7DR + exigence de détail sur 2042 RICI + UI étape 3."
        },
        {
          "title": "Crédit d'impôt pour l'emploi d'un salarié à domicile",
          "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F12",
          "publisher": "Service Public (DILA)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Section 'Justificatifs des dépenses': Urssaf + factures prestataires + salaires/cotisations."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Dépenses de services à la personne... corrigez case 7DB' (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:emploi_a_domicile:2042:7DR",
      "campaign": "fr-2026-revenus-2025",
      "topic": "emploi_a_domicile",
      "eligibility_rule": "Les aides perçues pour les services à la personne (ex: APA, PCH, CESU préfinancé) doivent être reportées en case 7DR (si elles impactent les dépenses déclarées).",
      "declaration_step": "Reporter le montant des aides perçues en case 7DR, puis conserver une traçabilité des aides pour le calcul de la base.",
      "online_ui_hint": "Déclaration en ligne: étape 3 → 'Charges' → 'Réductions et crédits d’impôt' puis saisie 7DR si concerné.",
      "form": "2042",
      "section": "Services à la personne / emploi à domicile",
      "case_code": "7DR",
      "field_label": "aides perçues pour les services à la personne",
      "related_case_codes": [
        "7DB"
      ],
      "required_documents": [],
      "common_mistakes": [
        "Oublier de déclarer les aides perçues (7DR) alors que la FAQ indique de les reporter."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention explicite: déclarer 7DB et reporter les aides en 7DR (APA, PCH, CESU...)."
        },
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Aides perçues pour les services à la personne ... corrigez case 7DR' (PROJET)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:emploi_a_domicile:2042:7DL",
      "campaign": "fr-2026-revenus-2025",
      "topic": "emploi_a_domicile",
      "eligibility_rule": "Si des dépenses d'emploi à domicile ont été engagées au domicile d'un ascendant bénéficiaire APA (âgé de plus de 65 ans), le formulaire 2042 prévoit un repère de comptage d'ascendants concernés (case 7DL).",
      "declaration_step": "Renseigner le nombre d'ascendants APA concernés en case 7DL si applicable.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Services à la personne / emploi à domicile",
      "case_code": "7DL",
      "field_label": "nombre d'ascendants bénéficiaires de l'APA concernés",
      "related_case_codes": [
        "7DB"
      ],
      "required_documents": [],
      "common_mistakes": [],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: ligne 'Nombre d’ascendants bénéficiaires de l’APA...' — case 7DL (PROJET)."
        },
        {
          "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention: dépenses supportées pour rémunérer un salarié au domicile d’un ascendant remplissant les conditions APA."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:emploi_a_domicile:2042:7DQ",
      "campaign": "fr-2026-revenus-2025",
      "topic": "emploi_a_domicile",
      "eligibility_rule": "En cas de première année de recours à l'emploi direct d'un salarié à domicile en 2025, le formulaire 2042 prévoit une case à cocher (7DQ). La FAQ associe cette situation à une rehausse du plafond (principe décrit).",
      "declaration_step": "Si vous avez employé directement pour la première fois en 2025 un salarié à domicile, cocher 7DQ sur 2042.",
      "online_ui_hint": null,
      "form": "2042",
      "section": "Services à la personne / emploi à domicile",
      "case_code": "7DQ",
      "field_label": "première année d'emploi direct d'un salarié à domicile (2025)",
      "related_case_codes": [
        "7DB"
      ],
      "required_documents": [],
      "common_mistakes": [
        "Confondre l'année de référence de la case (le PROJET 2042 indique 'première fois en 2025')."
      ],
      "confidence_level": "medium",
      "source_refs": [
        {
          "title": "Déclaration préremplie n°2042 — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.4: 'Vous avez employé directement pour la première fois en 2025 un salarié à domicile' — 7DQ cochez (PROJET)."
        },
        {
          "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Explique le principe de plafond majoré en première année de recours à l'emploi à domicile (page modifiée le 01/04/2026)."
        }
      ]
    },
    {
      "id": "fr-2026-revenus-2025:emploi_a_domicile:2042_RICI:detail_services_BDA_BEA",
      "campaign": "fr-2026-revenus-2025",
      "topic": "emploi_a_domicile",
      "eligibility_rule": "Si la dépense totale 'services à la personne' est indiquée en 7DB, la déclaration 2042 RICI demande de détailler le montant par type de prestation via des codes de ligne (BDA à BEA) et d'indiquer la nature/modèle d'intervention de l'organisme.",
      "declaration_step": "Dans 2042 RICI (rubrique 'Services à la personne'), répartir le total 7DB sur les lignes BDA…BEA correspondant aux prestations réellement facturées.",
      "online_ui_hint": null,
      "form": "2042 RICI",
      "section": "Services à la personne",
      "case_code": null,
      "field_label": "détail des dépenses 'services à la personne' (ventilation du total 7DB)",
      "related_case_codes": [
        "BDA",
        "BDB",
        "BDC",
        "BDD",
        "BDE",
        "BDF",
        "BDG",
        "BDH",
        "BDI",
        "BDJ",
        "BDK",
        "BDL",
        "BDM",
        "BDN",
        "BDO",
        "BDP",
        "BDQ",
        "BDR",
        "BDS",
        "BDT",
        "BDU",
        "BDV",
        "BDW",
        "BDX",
        "BDY",
        "BDZ",
        "BEA"
      ],
      "required_documents": [],
      "common_mistakes": [
        "Renseigner 7DB sans ventiler dans 2042 RICI alors que le formulaire le demande."
      ],
      "confidence_level": "high",
      "source_refs": [
        {
          "title": "Déclaration n°2042 RICI — REVENUS 2025 (PROJET)",
          "url": "https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/1_declarer/111_cdhr/projets_imprimes/2042_rici_rev2025_projet.pdf",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "p.1: tableau 'Services à la personne' listant BDA…BEA + consigne si 7DB renseigné (PROJET)."
        },
        {
          "title": "Comment bénéficier du crédit d’impôt pour l’emploi d’un salarié à domicile ?",
          "url": "https://www.impots.gouv.fr/particulier/questions/comment-beneficier-du-credit-dimpot-pour-lemploi-dun-salarie-domicile",
          "publisher": "DGFiP (impots.gouv.fr)",
          "campaign": "fr-2026-revenus-2025",
          "quote_or_locator": "Mention: détailler en page 1 de la 2042 RICI le montant correspondant à chaque type de dépenses (cases BDA à BEA)."
        }
      ]
    }
  ]
}
```