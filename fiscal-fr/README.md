# fiscal-fr — Assistant fiscal conversationnel (France)

`fiscal-fr` est un plugin d'assistance a la preparation de declaration de revenus francaise.

Convention de documentation: le contenu est redige en francais. Quand utile pour l'alignement produit/technique, les tags anglais sont conserves entre parentheses.

Objectif: vous aider a preparer votre dossier plus vite et plus sereinement, sans remplacer un expert-comptable ni un conseiller fiscal.

## Cadrage fonctionnel

### 4.1 Objectif

Fournir un plugin MCP d'assistance a la preparation de la declaration de revenus francaise pour cas simples, capable de:

- Qualifier le profil fiscal.
- Detecter les points d'attention.
- Lister les justificatifs.
- Estimer un impact indicatif.
- Generer une pre-declaration structuree.

### 4.2 Utilisateur cible

- Particulier francais.
- Cas standard.
- Besoin d'aide pedagogique et structuree.

### 4.3 Entrees

- Situation familiale.
- Revenus.
- Charges.
- Credits/reductions.
- Evenements de vie.
- Pieces justificatives disponibles.

### 4.4 Sorties

- Profil fiscal.
- Checklist de documents.
- Points de vigilance.
- Estimation indicative.
- Structure de pre-declaration.
- Guide etape par etape.

### 4.5 Limites

- Pas de conseil juridique opposable.
- Pas de depot automatique.
- Pas de prise en charge des cas complexes.

## Pour qui ?

- Particuliers qui preparent leur declaration de revenus en ligne.
- Utilisateurs qui veulent un copilote pour verifier les rubriques et les justificatifs avant saisie manuelle.

## Installation simple (5 minutes)

Prerequis:

- Node.js 20+
- npm
- Un client compatible MCP/Claude Code plugin

Etapes:

1. Recuperer le plugin

```bash
git clone <url-du-repo>
cd fiscal-fr
```

2. Installer les dependances du serveur MCP

```bash
npm ci --prefix mcp-server
```

3. Lancer le plugin

- Si votre client lit `.mcp.json`, le serveur sera lance automatiquement.
- Sinon, lancez-le manuellement:

```bash
npm run dev --prefix mcp-server
```

### Lancer Claude Code avec le plugin

Depuis le dossier parent du plugin:

```bash
claude --plugin-dir ./fiscal-fr
```

Depuis la racine du plugin:

```bash
claude --plugin-dir .
```

Ensuite, dans la session Claude, vous pouvez demander:

- "Lance l'assistant fiscal en mode qualification"
- "Passe en mode justificatifs"
- "Prepare une predeclaration"

4. Utiliser l'assistant en conversation

- Demandez un mode: `qualification`, `justificatifs`, ou `predeclaration`.
- Exemple: "Lance le mode qualification pour ma situation fiscale".

## Ce que le plugin couvre deja (MVP actuel)

Aujourd'hui, le coeur fonctionnel disponible est la **qualification fiscale initiale** via l'outil MCP `qualify_tax_profile`.

### Cas actuellement supportes par l'agent

Le MVP sait traiter les situations standards avec:

- Situation familiale: celibataire (`single`), marie (`married`), pacse (`civil_union`), divorce (`divorced`), veuf (`widowed`).
- Revenus pris en charge en qualification: salaires (`salary`), pensions (`pension`), interets bancaires (`bank_interest`), dividendes/RCM (`dividends`), revenus locatifs nus (`rental_income`), location meublee (`furnished_rental`), micro-entrepreneur (`micro_entrepreneur`), autres revenus (`other`).
- Charges prises en charge: dons (`donations`), frais de garde (`childcare`), emploi a domicile (`home_services`), pension versee (`alimony`), aucune charge (`none`), autres charges (`other`).
- Evenements de vie reconnus sur le MVP:
  - mariage/Pacs,
  - enfant devenant majeur,
  - autres evenements simples non bloquants.
- Contextes qualifies (si fournis) pour affiner les recommandations:
  - personnes a charge: charge principale / residence alternee / rattachement enfant majeur,
  - dons: interet general / aide aux personnes en difficulte / patrimoine religieux / dons Mayotte,
  - emploi a domicile: premiere annee en emploi direct / aides perçues / ascendant APA,
  - pension versee: soutien enfant majeur / ex-conjoint / autre contexte.

### Cas traites avec vigilance renforcee (mais encore supportables)

- Presence de personnes a charge.
- Dons (ventilation et justificatifs).
- Frais de garde d'enfants.
- Emploi a domicile.
- Rattachement d'enfant majeur et coherence avec pension versee.
- Revenus fonciers (orientation micro-foncier / reel).
- Location meublee (qualification LMNP/LMP a confirmer).
- Micro-entrepreneur (orientation 2042 C PRO selon type d'activite).

Dans ces cas, l'assistant classe generalement le dossier en a surveiller (`monitor`) avec un statut prudent.

### Cas hors perimetre (revue humaine recommandee)

Le MVP detecte et signale comme potentiellement hors perimetre:

- Revenus etrangers (`foreign_income`).
- Crypto-actifs (`crypto`).
- Activites BIC/BNC (`bic_bnc`).
- Investissements locatifs fiscaux complexes (Pinel/Denormandie/Loc'Avantages) : qualification initiale possible mais revue humaine recommandee.
- Evenements complexes detectes dans le texte (ex: non-resident, controle fiscal, separation/divorce complexe).

Dans ces cas, le resultat est typiquement hors perimetre (`out_of_scope`) et l'assistant recommande une revue humaine.

### Ce que renvoie concretement l'agent aujourd'hui

Sur un dossier qualifie, l'agent fournit deja:

- Faits confirmes.
- Hypotheses.
- Points a confirmer.
- Niveau de complexite (simple (`simple`), a surveiller (`monitor`), hors perimetre (`out_of_scope`)).
- Decision MVP (supporte (`supported`) / supporte avec prudence (`supported_with_caution`) / revue humaine (`human_review`)).
- Prochaines questions pour completer le dossier.
- Recommandations de rubriques/cases probables (selon les regles actives).
- Justificatifs utiles a preparer.

### Themes fiscaux deja bien cadres dans la base de connaissances

- Salaires et pensions (verification pre-remplissage).
- Interets bancaires (IFU, coherence des montants).
- Dons (cases probables et points de controle).
- Frais de garde d'enfants.
- Emploi a domicile.
- Mariage/Pacs.
- Enfant atteignant la majorite.

### Limite importante de l'existant

Les modes conversationnels `justificatifs` et `predeclaration` existent cote assistant, mais aujourd'hui ils reposent surtout sur la qualification et la structuration conversationnelle. Les tools MCP dedies (`list_supporting_documents`, `build_pre_declaration`, etc.) sont prevus et en cours d'implementation.

Important: le plugin ne depose jamais la declaration a votre place.

## Vision cible (en cours)

Le produit vise un assistant fiscal conversationnel plus complet:

- Qualifier la situation fiscale.
- Detecter les rubriques/cases probables a revoir.
- Expliquer les regles de maniere pedagogique.
- Lister les justificatifs attendus.
- Estimer un impact indicatif.
- Produire une pre-declaration structuree.

Et un copilote de saisie:

- Guider l'utilisateur etape par etape.
- Dire quoi verifier a chaque ecran.
- Signaler les incoherences.
- Preparer les montants et justificatifs avant saisie manuelle.

## Transparence et limites

- Le plugin est une aide a la preparation, pas un conseil fiscal definitif.
- En cas de situation complexe (ex: revenus etrangers, cas atypiques), une revue humaine est recommandee.
- Les recommandations sont basees sur une base de connaissance tracee (sources officielles priorisees).

## Commandes utiles

Depuis la racine du projet:

```bash
npm ci --prefix mcp-server
npm run build --prefix mcp-server
npm run dev --prefix mcp-server
```
