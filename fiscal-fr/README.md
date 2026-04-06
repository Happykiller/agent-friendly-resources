# fiscal-fr — Assistant fiscal conversationnel (France)

`fiscal-fr` est un plugin d'assistance a la preparation de declaration de revenus francaise.

Convention de documentation: le contenu est redige en francais. Quand utile pour l'alignement produit/technique, les tags anglais sont conserves entre parentheses.

## Vision

Notre vision pour l'assistant fiscal s'articule autour de trois axes fondamentaux :

1.  **Assister** : L'assistant doit aider, guider et accompagner le déclarant dans sa démarche de déclaration de revenus. La valeur de cet axe est de rendre simple une procédure administrative intrinsèquement complexe.
2.  **Conseiller** : Grâce à son expertise, l'assistant aide le déclarant à obtenir le maximum de ses droits. La valeur de cet axe est monétaire : par ses questions, suggestions et études, l'assistant permet d'obtenir un résultat optimisé, souvent meilleur que si le déclarant agissait seul.
3.  **Rapidité** : L'assistant doit faire gagner un temps précieux au déclarant. Fini les recherches fastidieuses ; guidé dans sa saisie, le déclarant peut remplir sa déclaration de manière fluide et efficace.

*Note : Cet assistant est un outil d'accompagnement et ne remplace pas un expert-comptable ni un conseiller fiscal.*

## Ce que le plugin fait

L'assistant couvre l'integralite du parcours de preparation:

| Mode | Commande | Ce que ca fait |
|------|----------|----------------|
| `qualification` | "Lance le mode qualification" | Qualifie la situation fiscale, classe en simple/a surveiller/hors perimetre |
| `arbitrages` | "Compare mes options fiscales" | Compare PFU vs bareme, frais reels vs 10%, micro-foncier vs reel, rattachement vs pension |
| `justificatifs` | "Passe en mode justificatifs" | Liste les documents obligatoires, recommandes, manquants |
| `vigilance` | "Detecte les points de vigilance" | Repere les incoherences, regimes a trancher, cas hors perimetre |
| `predeclaration` | "Prepare une pre-declaration" | Produit un brouillon structure avec codes cases et origines tracees |
| `estimation` | "Estime mon impot" | Estimation indicative IR 2026 (bareme progressif, quotient familial, decote, reductions/credits) |
| `copilote` | "Guide-moi ecran par ecran" | Copilote de saisie sur impots.gouv.fr, etape par etape |

Sequence recommandee: `qualification -> arbitrages -> justificatifs -> vigilance -> predeclaration -> estimation -> copilote`.

## Perimetres couverts

### Situations familiales

- Celibataire (`single`), marie (`married`), pacse (`civil_union`), divorce (`divorced`), veuf (`widowed`).
- Personnes a charge: principale, residence alternee, enfant majeur rattache.

### Revenus

Pris en charge: salaires (`salary`), pensions (`pension`), interets bancaires (`bank_interest`), dividendes/RCM (`dividends`), revenus locatifs nus (`rental_income`), location meublee (`furnished_rental`), micro-entrepreneur (`micro_entrepreneur`).

Hors perimetre (detectes et signales): revenus etrangers (`foreign_income`), crypto-actifs (`crypto`), activites BIC/BNC complexes.

### Charges et reductions

Prises en charge: dons (`donations`), frais de garde (`childcare`), emploi a domicile (`home_services`), pension alimentaire versee (`alimony`).

### Calculs fiscaux (estimation indicative)

- Bareme IR 2026 progressif (5 tranches, CGI art. 197).
- Quotient familial avec plafonnement (1 807 €/demi-part, 4 262 € parent isole).
- Abattements: salaires 10%, pensions 10%, micro-foncier 30%, dividendes 40%, micro-entrepreneur (BIC 71%/50%, BNC 34%).
- Decote (celibataire et couple).
- PFU sur revenus du capital hors option bareme : 30% (12,8% IR + 17,2% PS) pour revenus percus en 2025, puis 31,4% (12,8% IR + 18,6% PS) a partir de 2026 selon type de revenu.
- Reductions dons 66%/75% Coluche (plafond 2 000 € depuis 14/10/2025).
- Credits garde enfant (50%, plaf. 3 500 €/enfant) et emploi domicile (50%, plaf. 12 000 €+).
- CEHR/CDHR (3% et 4% selon seuils).

### Limites importantes

- Pas de conseil juridique opposable.
- Pas de depot automatique de la declaration.
- Cas complexes (revenus etrangers, crypto, controle fiscal) → revue humaine recommandee.
- Estimation indicative sans valeur contractuelle, accompagnee systematiquement d'un disclaimer.

## Installation (5 minutes)

### Prerequis

- Node.js 20+
- npm
- Claude Code (CLI ou desktop)

### Etapes

1. Recuperer le plugin

```bash
git clone <url-du-repo>
cd fiscal-fr
```

2. Installer les dependances du serveur MCP

```bash
npm ci --prefix mcp-server
```

3. Lancer Claude Code en chargeant explicitement le plugin

```bash
claude --plugin-dir .
```

Le fichier `.mcp.json` present a la racine demarre le serveur MCP automatiquement.

Si Claude est deja ouvert, rechargez ensuite les plugins :

```text
/reload-plugins
```

Verification rapide dans Claude Code :

```text
/help
```

Le skill doit apparaitre avec son namespace plugin (exemple : `/fiscal-fr:assistant-fiscal`).

### Demarrage manuel du serveur (si besoin)

```bash
npm run dev --prefix mcp-server
```

### Mode HTTP (optionnel)

```bash
MCP_TRANSPORT=http MCP_PORT=3333 npm run dev --prefix mcp-server
```

## Utilisation

Dans la session Claude Code, demandez simplement:

```
Lance l'assistant fiscal en mode qualification
```

Ou demarrez directement avec votre situation:

```
Je suis celibataire, salarie, avec un credit immobilier. Aide-moi a preparer ma declaration.
```

L'assistant propose ensuite les etapes dans l'ordre:
1. Qualification de la situation
2. Liste des justificatifs a reunir
3. Points de vigilance a verifier
4. Brouillon de pre-declaration
5. Estimation indicative de l'impot
6. Copilote de saisie sur impots.gouv.fr

### Commandes slash du plugin

Une fois le plugin charge, vous pouvez aussi utiliser:

```text
/fiscal-fr:help
/fiscal-fr:start [mode]
/fiscal-fr:infos
/fiscal-fr:assistant-fiscal [mode]
```

Modes: `qualification`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

Si les commandes n'apparaissent pas tout de suite:

```text
/reload-plugins
/help
```

## Commandes utiles

```bash
# Lancer Claude en chargeant explicitement le plugin (depuis fiscal-fr)
claude --plugin-dir .

# Lancer depuis le dossier parent
claude --plugin-dir ./fiscal-fr

# Installer les dependances
npm ci --prefix mcp-server

# Compiler
npm run build --prefix mcp-server

# Lancer en mode dev (stdio)
npm run dev --prefix mcp-server

# Lancer les tests
npm test --prefix mcp-server
```
