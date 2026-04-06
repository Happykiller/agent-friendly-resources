---
description: Guide rapide du plugin fiscal-fr (modes, checks, depannage)
---

# fiscal-fr: aide rapide

Tu aides l'utilisateur a demarrer rapidement avec le plugin fiscal-fr.

Donne une reponse courte et pratique avec ces sections :

1. Commandes utiles
   - `/fiscal-fr:help`
   - `/fiscal-fr:start [mode]`
   - `/fiscal-fr:infos`
   - `/fiscal-fr:assistant-fiscal [mode]`

2. Modes disponibles
   - qualification
   - justificatifs
   - vigilance
   - predeclaration
   - estimation
   - copilote

3. Verification rapide
   - `/reload-plugins`
   - `/help`
   - `/mcp`

4. Depannage conflit MCP
   - Expliquer en une phrase: le meme serveur `fiscal-fr-local` est charge 2 fois (scope projet + plugin inline).
   - Donner la resolution recommandee: lancer Claude depuis le dossier parent avec `claude --plugin-dir ./fiscal-fr`.

Termine avec: "Dis-moi ton mode et ta situation en 1 phrase, je te lance le bon parcours."
