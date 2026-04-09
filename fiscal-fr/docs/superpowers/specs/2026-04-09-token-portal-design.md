# Token Portal — Design Spec

**Date :** 2026-04-09  
**Contexte :** Adoption du plugin fiscal-fr par les utilisateurs Claude Code bloquée par la complexité du flow OAuth PKCE pour obtenir un bearer token.  
**Solution :** Une page web dans le serveur MCP existant permettant de s'authentifier avec email/mot de passe et de récupérer un token longue durée à copier.

---

## Architecture

### Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/token-portal` | Sert la page HTML avec le formulaire email/mot de passe |
| `POST` | `/token-portal` | Vérifie les credentials, génère le token, retourne la page succès |

### Fichiers nouveaux

- `mcp-server/src/auth/portal.router.ts` — routeur Express dédié (GET + POST `/token-portal`)

### Fichiers modifiés

- `mcp-server/src/auth/auth.store.ts` — ajout de `writeApiKey(key: ApiKey): void`
- `mcp-server/src/auth/token.service.ts` — ajout de `signLongLivedToken(userId: string, expiryDays?: number): Promise<string>`
- `mcp-server/src/index.ts` — montage de `createPortalRouter()` aux côtés de `createOAuthRouter()`

### Flow

```
GET /token-portal
  → rendu HTML : formulaire email + mot de passe

POST /token-portal (form body: email, password)
  → findUserByEmail(email) + verifyPassword(password, hash)
  → si échec : re-rendu formulaire avec message d'erreur
  → si succès :
      label = "portal-YYYY-MM-DD" (date UTC)
      token = signLongLivedToken(userId, 365)
      writeApiKey({ key: token, userId, label, createdAt })
      → rendu HTML : page succès
```

---

## UX — Page succès

La page succès affiche :

1. **Le token** dans un `<textarea readonly>` + bouton "Copier" (Clipboard API avec fallback `select()`)
2. **Bloc `mcpServers`** prêt à coller dans la configuration Claude Code :
   ```json
   {
     "mcpServers": {
       "fiscal-fr": {
         "type": "http",
         "url": "http://<host>/mcp",
         "headers": {
           "Authorization": "Bearer <token>"
         }
       }
     }
   }
   ```
   L'URL `<host>` est dérivée de `req.protocol + req.get("host")` côté serveur.
3. Message d'avertissement : *"Ce token est valable 365 jours. Conservez-le en lieu sûr — il ne sera plus affiché."*

Le style reprend celui de la page de login OAuth existante (system-ui, palette bleue `#1a56db`).

---

## Persistance — `api-keys.db.json`

`writeApiKey` lit le fichier JSON, ajoute l'entrée, réécrit le fichier. Cohérent avec l'architecture de lecture/écriture JSON existante.

Champ `key` = le JWT complet. Révocation possible en supprimant l'entrée du fichier.

---

## Token — `signLongLivedToken`

- Algorithme : HS256 (même clé `JWT_SECRET` que les JWT OAuth)
- Expiration : 365 jours (paramètre `expiryDays` avec défaut 365)
- Claims : `sub` = userId, `iat` = now, `exp` = now + expiryDays
- Issuer : identique aux JWT OAuth (`OAUTH_ISSUER` ou dérivé du host)

Le JWT est accepté par `authMiddleware` via la vérification JWT existante (`verifyAccessToken`). Aucune modification de l'authentification MCP.

---

## Sécurité

- Pas de modification des endpoints MCP ni du flow OAuth PKCE existant
- Le token n'est affiché qu'une seule fois (mention explicite sur la page)
- Pas de rate limiting (hors scope, absent sur le reste du serveur)
- CSRF non applicable : pas de session côté serveur
- Vérification du mot de passe via `timingSafeEqual` (déjà en place dans `auth.store.ts`)

---

## Hors scope

- Gestion / révocation des tokens depuis la page
- Rate limiting / protection brute force
- Choix de la durée d'expiration par l'utilisateur
- Notifications email
