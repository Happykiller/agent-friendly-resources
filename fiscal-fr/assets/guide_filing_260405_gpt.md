# Parcours de déclaration en ligne 2026 sur le site des impôts et JSON d’étapes pour guide_filing_step

## Sources officielles exploitées et périmètre

Le socle “parcours écran par écran” le plus directement exploitable est un **pas‑à‑pas officiel** intitulé *« Je déclare mes revenus en ligne »*, daté **01/2026**, qui montre l’enchaînement des écrans et boutons (ex. **« Accéder à la déclaration en ligne »**, **« Suivant »**, écran **« Votre déclaration »**, lien **« Accéder à plus de rubriques ou signaler un changement »**, écran **« Résumé de votre déclaration »**, bouton **« Signer ma déclaration »**) ainsi que l’obligation de **vérifier les données pré‑remplies** et la possibilité de **corriger**. citeturn12view0turn15view0

Pour fiabiliser les **codes de cases** et les libellés de rubriques (ex. **1AJ/1BJ**, **1AS/1BS**, **2DC/2TR/2BH**, **2OP**, **4BE/4BA**, **7GA**, **7DB**, **7UD/7UQ**, **7UF**, **6GI**), j’ai utilisé le **simulateur officiel IR 2026 (revenus 2025) – modèle complet**, qui liste les rubriques et les cases associées. citeturn9view3turn9view4turn9view0turn9view2turn10view3turn10view0turn10view1turn10view2

Pour les **revenus fonciers** (micro‑foncier vs réel) et surtout la **manière de faire apparaître une rubrique en saisie en ligne** (saisie du code puis **bouton “Ajouter un revenu / une charge”**), la FAQ officielle sur la location vide (mise à jour **20/03/2026**) détaille exactement l’action attendue en ligne (micro **4BE** / réel **4BA**) ainsi que le seuil **15 000 €** et la référence à l’annexe **2044** au réel. citeturn16view0

Pour les **revenus de capitaux mobiliers**, la page officielle dédiée confirme que l’option pour le barème est une **option globale** via la case **2OP**, et rappelle les conséquences (abattement dividendes au barème, CSG déductible uniquement si option barème, etc.). citeturn17view0turn17view1

## Structure haut niveau du parcours en ligne

Le parcours en ligne (cas courant) est guidé et comprend des écrans de type “assistant”, avec une progression et des boutons **« Suivant »** et **« Signer ma déclaration »**. Il existe une **procédure simplifiée** pour situation simple, avec la possibilité d’**accéder à plus de rubriques** si nécessaire. citeturn12view0turn15view0

Un point central du parcours est l’écran **« Votre déclaration »** : il récapitule des rubriques (ex. *Traitements, salaires* ; *Pensions, retraites, rentes*…), affiche des montants **pré‑remplis**, et permet de **consulter le détail/corriger** ; le pas‑à‑pas précise également la mécanique d’édition (icône “crayon” dans certains cas, sinon correction directe). citeturn15view0turn12view0

En fin de saisie, l’écran **« Résumé de votre déclaration »** impose notamment une vérification (et au besoin modification) des **coordonnées bancaires (RIB) – indiquées comme obligatoires**, puis la déclaration doit être **signée** via **« Signer ma déclaration »**. Après signature, le pas‑à‑pas indique qu’on peut obtenir un justificatif (avis de situation déclarative) et qu’un courriel de confirmation est envoyé. citeturn15view0turn5view2

## Rubriques revenus à couvrir dans un cas standard

Sur la rubrique **salaires**, le simulateur officiel associe explicitement **1AJ** (déclarant 1) et **1BJ** (déclarant 2) aux revenus d’activité à porter, et liste la nature des revenus concernés (salaires, avantages en nature, indemnités journalières) dans la rubrique *Traitements et salaires*. citeturn9view3  
Pour les **pensions**, la rubrique *Pensions, retraites, rentes* fait apparaître le **total** en **1AS** (déclarant 1) et **1BS** (déclarant 2). citeturn9view4  
Dans le parcours en ligne, ces rubriques peuvent apparaître directement dans l’écran **« Votre déclaration »**. citeturn15view0

Pour les **revenus de capitaux mobiliers** (cas “intérêts” et “dividendes” simples), le simulateur officiel positionne :
- **2DC** pour les revenus des actions et parts (dividendes ouvrant droit à abattement au barème),  
- **2TR** pour les intérêts et produits de placement à revenu fixe,  
- **2BH** pour des revenus déjà soumis aux prélèvements sociaux avec CSG déductible **si option barème**,  
- et la **case 2OP** comme case d’option : si **2OP n’est pas cochée**, l’imposition reste au **PFU (flat tax) de 30%** (12,8% IR + 17,2% prélèvements sociaux) ; si **2OP est cochée**, c’est l’option pour le barème (option globale). citeturn9view0turn9view2turn10view6turn17view0turn17view1

Pour les **revenus fonciers**, le simulateur officiel rappelle une règle de saisie essentielle en micro‑foncier : en **4BE**, on indique les **recettes brutes** et on **ne déduit aucun abattement** (le mécanisme s’applique ensuite). citeturn10view3  
La FAQ officielle confirme en plus le seuil **15 000 €** et précise l’articulation micro‑foncier (**4BE**) / régime réel (**2044** puis report en “Revenus fonciers” de la 2042), et donne une instruction opérationnelle “en ligne” pour faire apparaître la ligne en rubrique (recherche du code, clic sur la ligne, **« Ajouter un revenu / une charge »**). citeturn16view0

## Charges, crédits et réductions usuels à couvrir

Le simulateur officiel IR 2026 (revenus 2025) liste, dans la partie “charges / réductions / crédits”, les rubriques attendues pour votre périmètre :
- **7GA** (frais de garde des enfants de moins de 6 ans au 1.1.2025 – 1er enfant) et variantes 7GB/7GC, ainsi que les cases spécifiques de résidence alternée, citeturn9view5
- **7DB** (service à la personne : sommes versées en 2025) et **7DR** (aides perçues pour l’emploi à domicile), citeturn9view6
- **7UD** (dons aux personnes en difficulté – versements du 1.1 au 13.10.2025, plafond 1000 €) et **7UQ** (versements du 14.10 au 31.12.2025, plafond 2000 € intégrant ceux du début d’année), citeturn10view0turn8view1
- **7UF** (dons aux œuvres reconnues d’utilité publique / organismes d’intérêt général), citeturn10view1
- **6GI** (pensions alimentaires versées à enfants majeurs en vertu d’une décision de justice définitive avant 2006 – 1er enfant majeur), citeturn10view2

Ces codes sont particulièrement importants pour un guide “écran par écran”, car l’oubli le plus fréquent en ligne n’est pas la “règle fiscale” (souvent calculée automatiquement) mais le fait de **ne pas activer / faire apparaître la bonne rubrique** ou de **renseigner la mauvaise case**. Le pas‑à‑pas précise d’ailleurs la logique générale : données pré‑remplies à vérifier, rubriques proposées, possibilité d’ajouter revenus/charges, et possibilité “accéder à plus de rubriques”. citeturn15view0turn12view0

## JSON par étape pour guide_filing_step

Les objets ci‑dessous sont structurés pour être intégrés tels quels dans votre outil. Chaque étape a une **URL officielle** et un **confidenceLevel** ; quand un libellé d’écran est pris directement du pas‑à‑pas “en ligne” (01/2026), la confiance est **high**. citeturn12view0turn15view0turn9view3turn9view4turn9view0turn10view3turn10view0turn10view2

```json
[
  {
    "stepId": "step_etat_civil_situation_familiale",
    "label": "Votre déclaration",
    "verifyNow": [
      "Vérifier la composition du foyer (déclarant 1 / déclarant 2), l’adresse (au 1er janvier) et la situation familiale affichée.",
      "Vérifier et compléter l’état civil des personnes à charge : l’écran peut présenter les personnes à charge de l’an dernier (à modifier/supprimer) ou proposer d’en ajouter si c’est la 1re déclaration avec enfant/personne à charge.",
      "Vérifier les éléments pré-remplis visibles sur l’écran « Votre déclaration » et corriger ce qui est inexact avant d’aller plus loin.",
      "Si une rubrique importante n’apparaît pas (revenus ou charges), utiliser le lien/option « Accéder à plus de rubriques ou signaler un changement »."
    ],
    "frequentOmissions": [
      "Oublier d’ajouter une personne à charge / de compléter ses informations d’état civil.",
      "Ne pas mettre à jour l’adresse ou la situation familiale, en supposant que le pré-remplissage est forcément correct.",
      "Rester dans la procédure simplifiée alors qu’il faut ajouter une rubrique (revenus fonciers, charges ouvrant droit à crédit/réduction, etc.)."
    ],
    "traps": [
      "Confondre « vérification » et « validation » : tant que la déclaration n’est pas signée, la saisie n’est pas finalisée.",
      "Certaines rubriques peuvent être masquées si on ne les sélectionne pas : le symptôme typique est « je ne vois pas la case / la rubrique » alors qu’elle doit être ajoutée via l’accès aux rubriques."
    ],
    "keyCaseCodes": [
      "T"
    ],
    "sourceUrl": "https://www.impots.gouv.fr/node/12190",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_revenus_salaires_pensions",
    "label": "Traitements, salaires / Pensions, retraites, rentes",
    "verifyNow": [
      "Contrôler les montants pré-remplis de salaires par déclarant (1AJ pour le déclarant 1, 1BJ pour le déclarant 2) et corriger si nécessaire.",
      "Contrôler les montants pré-remplis de pensions/retraites/rentes par déclarant (1AS pour le déclarant 1, 1BS pour le déclarant 2) et corriger si nécessaire.",
      "En cas de correction demandée par l’interface : utiliser l’icône d’édition (si présente) ou saisir directement dans la case, selon le comportement de l’écran.",
      "S’assurer que chaque revenu est affecté au bon déclarant (1AJ/1AS vs 1BJ/1BS)."
    ],
    "frequentOmissions": [
      "Oublier de corriger un montant pré-rempli erroné (ex. employeur/caisse ayant transmis un montant incomplet).",
      "Se tromper de déclarant (saisir le montant du déclarant 2 dans une case du déclarant 1, ou inversement)."
    ],
    "traps": [
      "Corriger un montant sans vérifier la cohérence avec les éléments associés affichés (ex. retenue à la source pré-remplie) si l’écran invite à corriger via un mode spécifique.",
      "Penser qu’un revenu manquant est « non imposable » : dans le parcours, un revenu absent peut surtout signifier que la rubrique n’est pas affichée ou que le pré-remplissage est incomplet."
    ],
    "keyCaseCodes": [
      "1AJ",
      "1BJ",
      "1AS",
      "1BS"
    ],
    "sourceUrl": "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/complet/index.htm",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_revenus_capitaux_mobiliers",
    "label": "Revenus des valeurs et capitaux mobiliers",
    "verifyNow": [
      "Vérifier la présence et le niveau des revenus de capitaux mobiliers pré-remplis si le foyer a perçu des intérêts/dividendes (IFU bancaire).",
      "Déterminer si le foyer souhaite rester au PFU (par défaut) ou opter pour le barème via la case 2OP (option globale).",
      "Pour les dividendes ouvrant droit à abattement au barème : vérifier/saisir en 2DC.",
      "Pour les intérêts et produits de placement à revenu fixe : vérifier/saisir en 2TR.",
      "Ne renseigner 2BH que si la situation correspond explicitement (RCM déjà soumis aux prélèvements sociaux avec CSG déductible, en lien avec l’option barème)."
    ],
    "frequentOmissions": [
      "Oublier de cocher 2OP alors que l’utilisateur pense être « au barème » (ou l’inverse).",
      "Saisir des intérêts en 2DC ou des dividendes en 2TR.",
      "Renseigner 2BH « par défaut » sans vérifier que la condition (et l’option barème) est bien remplie."
    ],
    "traps": [
      "Croire que l’option barème se fait « produit par produit » : l’option 2OP est une option globale (RCM et plus-values mobilières).",
      "Sous PFU, certaines conséquences s’appliquent (ex. pas d’abattement 40% sur dividendes, pas de CSG déductible sur RCM) : un choix incohérent se repère souvent par la présence/absence attendue de lignes comme 2BH."
    ],
    "keyCaseCodes": [
      "2DC",
      "2TR",
      "2BH",
      "2OP"
    ],
    "sourceUrl": "https://www.impots.gouv.fr/particulier/les-revenus-mobiliers",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_revenus_fonciers",
    "label": "Revenus fonciers",
    "verifyNow": [
      "Identifier le régime applicable : micro-foncier (si conditions remplies) vs régime réel.",
      "Si micro-foncier : saisir les recettes brutes en 4BE (sans déduire d’abattement).",
      "Si régime réel : remplir l’annexe 2044 (ou 2044 spéciale) puis reporter le résultat foncier dans la rubrique « Revenus fonciers » (ex. 4BA selon les cas).",
      "Si la rubrique n’apparaît pas dans la déclaration en ligne : utiliser le mécanisme d’ajout (recherche du code 4BE ou 4BA, clic sur la ligne correspondante, puis « Ajouter un revenu / une charge »)."
    ],
    "frequentOmissions": [
      "Déduire soi-même 30% en micro-foncier (au lieu de saisir les recettes brutes).",
      "Oublier d’ajouter/activer la rubrique « Revenus fonciers » dans le parcours en ligne (rubrique absente du récapitulatif).",
      "Au réel, ne pas remplir l’annexe 2044 alors qu’elle conditionne le calcul du résultat."
    ],
    "traps": [
      "Confondre micro-foncier (4BE) et régime réel (2044 puis cases 4BA/4BB/4BC/4BD selon résultat) : l’erreur classique est de saisir un montant net « estimé » au mauvais endroit.",
      "Au régime réel sur option : sous-estimer que l’option engage sur plusieurs années (point à rappeler si knownFacts mentionne un choix récent)."
    ],
    "keyCaseCodes": [
      "4BE",
      "4BA",
      "2044"
    ],
    "sourceUrl": "https://www.impots.gouv.fr/particulier/questions/je-mets-en-location-un-logement-vide-comment-declarer-les-loyers-percus",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_charges_credits_reductions",
    "label": "Vos charges / Réductions et crédits d’impôt",
    "verifyNow": [
      "Vérifier si des charges/crédits/réductions doivent être ajoutés même si rien n’est pré-rempli (dons, frais de garde, emploi à domicile…).",
      "Frais de garde d’enfant : vérifier l’éligibilité (enfant de moins de 6 ans au 1.1.2025) et renseigner la case 7GA (et suivantes selon rang/cas).",
      "Emploi à domicile : renseigner 7DB (sommes versées) et, si applicable, 7DR (aides perçues).",
      "Dons : distinguer dons aux personnes en difficulté (7UD / 7UQ selon période 2025) et dons aux œuvres/organismes d’intérêt général (7UF).",
      "Pensions alimentaires (cas spécifique décision avant 2006 pour enfant majeur) : vérifier si 6GI s’applique plutôt qu’une autre case de pensions alimentaires."
    ],
    "frequentOmissions": [
      "Oublier de déclarer les dons (7UD/7UQ/7UF) alors que le contribuable a des reçus fiscaux.",
      "Oublier de déclarer les frais de garde (7GA…) ou l’emploi à domicile (7DB) lorsque l’interface ne les propose pas automatiquement.",
      "Ignorer la distinction 7UD vs 7UQ (année 2025 scindée en deux périodes de versement)."
    ],
    "traps": [
      "Saisir un montant dans une case proche mais non pertinente (ex. don au mauvais régime / mauvaise période).",
      "Saisir les dépenses d’emploi à domicile sans tenir compte d’aides perçues (présence de 7DR).",
      "Pour 6GI : confusion entre pensions alimentaires ‘décision avant 2006’ et autres pensions alimentaires, qui n’utilisent pas les mêmes cases."
    ],
    "keyCaseCodes": [
      "7GA",
      "7DB",
      "7UD",
      "7UF",
      "6GI"
    ],
    "sourceUrl": "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/complet/index.htm",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_recapitulatif_signature",
    "label": "Résumé de votre déclaration",
    "verifyNow": [
      "Relire le résumé de toutes les rubriques avant signature (c’est la dernière occasion simple de repérer une rubrique manquante).",
      "Vérifier ou modifier le relevé d’identité bancaire (RIB) si demandé par l’écran (indiqué comme obligatoire).",
      "S’assurer que toutes les saisies nécessaires ont été enregistrées, puis cliquer sur « Signer ma déclaration »."
    ],
    "frequentOmissions": [
      "Oublier de signer (sortie du parcours sans validation finale).",
      "Découvrir au résumé qu’une rubrique manque (ex. revenus fonciers, dons) mais ne pas revenir l’ajouter avant signature."
    ],
    "traps": [
      "Confondre l’affichage d’une estimation/résumé avec une validation : seule la signature finalise la déclaration.",
      "RIB non conforme / non accepté : peut bloquer la fin de parcours (ou empêcher un remboursement/ prélèvement ultérieur)."
    ],
    "keyCaseCodes": [],
    "sourceUrl": "https://www.impots.gouv.fr/node/12190",
    "confidenceLevel": "high"
  },
  {
    "stepId": "step_fin_declaration",
    "label": "Fin de déclaration",
    "verifyNow": [
      "Vérifier que la déclaration est bien indiquée comme terminée et conserver la preuve (accusé/confirmation).",
      "Télécharger/imprimer l’Avis de Situation Déclarative (ASDIR) si proposé, utile comme justificatif immédiat.",
      "Noter les informations utiles affichées après signature (ex. informations liées au prélèvement à la source) et rappeler qu’une correction en ligne peut exister en cas d’erreur."
    ],
    "frequentOmissions": [
      "Ne pas télécharger le justificatif (ASDIR) alors qu’il peut être demandé rapidement par un organisme tiers.",
      "Ne pas conserver les pièces justificatives (dons, garde, emploi à domicile) même si elles ne sont pas à joindre."
    ],
    "traps": [
      "Penser qu’aucune correction n’est possible après signature : selon les périodes, des mécanismes de correction peuvent exister depuis l’espace en ligne.",
      "Oublier que la validation de la déclaration est distincte du paiement (qui se fait selon l’avis et le solde)."
    ],
    "keyCaseCodes": [],
    "sourceUrl": "https://www.impots.gouv.fr/particulier/declarez-en-ligne",
    "confidenceLevel": "high"
  }
]
```