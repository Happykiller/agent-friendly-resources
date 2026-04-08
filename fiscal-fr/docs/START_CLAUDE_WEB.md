# Demarrage — Claude.ai web

**Prerequis** : un compte Claude.ai (Pro ou Team).

Voir aussi : [Demarrage — Claude Code (CLI / desktop)](./START_CLAUDE_CODE.md)

## 1. Installer la competence (skill)

Ouvrir les parametres Claude (**Settings → Personalization → Import skill**) et deposer le fichier :

[`delivery/fisk-assistant_1.0.0.zip`](../delivery/fisk-assistant_1.0.0.zip)

La competence `fisk-assistant` apparait dans la liste des competences actives.

## 2. Ajouter le connecteur MCP

Ouvrir les parametres Claude (**Settings → Integrations → Add integration**) et saisir :

```
https://kalifa.happykiller.net/mcp
```

## 3. Autoriser l'acces

Claude.ai redirige vers la page de connexion. Entrer les identifiants du compte et autoriser l'acces.

Si vous n'avez pas encore de compte, rapprochez-vous de l'admin pour obtenir un compte et les acces.

## 4. Demarrer l'assistant

Dans n'importe quelle conversation, vous pouvez taper `/`, puis `fiscal-fr`, pour demarrer rapidement si le skill apparait dans les suggestions.

Sinon, demander directement en langage naturel :

```
Je suis celibataire, salarie. Aide-moi a preparer ma declaration.
```

L'assistant utilise automatiquement les outils MCP disponibles et propose les etapes dans l'ordre recommande.

## Exemples de demarrage

```
Qualifie ma situation fiscale
```
```
Compare mes options fiscales (PFU vs bareme, frais reels vs 10%)
```
```
Liste les justificatifs a reunir pour ma declaration
```
```
Detecte les points de vigilance dans mon dossier
```
```
Prepare une pre-declaration avec mes montants
```
```
Estime mon impot sur le revenu 2026
```
```
Guide-moi ecran par ecran sur impots.gouv.fr
```
