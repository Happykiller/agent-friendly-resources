# Demarrage — Claude Code (CLI / desktop)

**Prerequis** : Claude Code installe et plugin `fiscal-fr` disponible en local.

## 1. Configurer le token MCP (obligatoire)

Ouvrir le fichier `fiscal-fr/.mcp.json` et remplacer uniquement `change-me` par votre token :

```json
"Authorization": "Bearer <votre-token>"
```

Comment obtenir le token :

- Si vous n'avez pas de compte, rapprochez-vous de l'admin pour obtenir un compte et un token personnel.
- Si vous avez deja un compte, demander a l'admin la generation (ou regeneration) de votre token d'acces MCP.

Ne modifiez pas l'URL MCP si elle est deja renseignee (`https://kalifa.happykiller.net/mcp`).

## 2. Lancer Claude Code avec le plugin

```bash
claude --plugin-dir ./fiscal-fr
```

Commande a lancer depuis le dossier parent de `fiscal-fr`.

Le fichier `.mcp.json` present a la racine configure le connecteur MCP HTTP.

## 3. Verifier que le plugin est charge

```text
/help
```

Le skill doit apparaitre : `/fiscal-fr:assistant-fiscal`.

Verification optionnelle du connecteur MCP :

```text
/mcp
```

Si les commandes n'apparaissent pas :

```text
/reload-plugins
```

## 4. Demarrer l'assistant

```text
/fiscal-fr:assistant-fiscal
```

Ou directement en langage naturel :

```
Je suis celibataire, salarie. Aide-moi a preparer ma declaration.
```

## Commandes disponibles

```text
/fiscal-fr:assistant-fiscal [mode]
/fiscal-fr:start [mode]
/fiscal-fr:help
/fiscal-fr:infos
```

Modes de `/fiscal-fr:assistant-fiscal` : `qualification`, `arbitrages`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

Modes de `/fiscal-fr:start` : `qualification`, `justificatifs`, `vigilance`, `predeclaration`, `estimation`, `copilote`.

## Note developpement

Les commandes de developpement (install, dev, build, tests) restent documentees dans le [README general](../README.md).
