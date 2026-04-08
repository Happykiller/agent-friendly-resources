# Demarrage — Claude Code (CLI / desktop)

## 1. Ouvrir le dossier du plugin

- Ouvrir votre dossier local qui contient `fiscal-fr`.
- Ouvrir le fichier `fiscal-fr/.mcp.json`.

## 2. Renseigner votre token (obligatoire)

Dans `fiscal-fr/.mcp.json`, remplacer uniquement `change-me` par votre token :

```json
"Authorization": "Bearer <votre-token>"
```

Comment obtenir le token :

- Si vous n'avez pas de compte, rapprochez-vous de l'admin pour obtenir un compte et un token personnel.
- Si vous avez deja un compte, demander a l'admin la generation (ou regeneration) de votre token d'acces MCP.

Ne modifiez pas l'URL MCP si elle est deja renseignee (`https://kalifa.happykiller.net/mcp`).

## 3. Lancer Claude Code

- Ouvrir un terminal.
- Se placer dans le dossier parent de `fiscal-fr`.
- Executer :

```bash
claude --plugin-dir ./fiscal-fr
```

## 4. Verifier que le plugin est actif

```text
/help
```

Le skill doit apparaitre : `/fiscal-fr:assistant-fiscal`.

Verification du connecteur MCP :

```text
/mcp
```

Si les commandes n'apparaissent pas :

```text
/reload-plugins
```

## 5. Demarrer l'assistant fiscal

```text
/fiscal-fr:assistant-fiscal
```

Ou directement en langage naturel :

```
Je suis celibataire, salarie. Aide-moi a preparer ma declaration.
```

## Commandes utiles

```text
/fiscal-fr:assistant-fiscal [mode]
/fiscal-fr:start [mode]
/fiscal-fr:help
/fiscal-fr:infos
```

## Note developpement

Les commandes de developpement (install, dev, build, tests) restent documentees dans le [README general](../README.md).
