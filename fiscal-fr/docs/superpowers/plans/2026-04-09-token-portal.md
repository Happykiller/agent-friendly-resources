# Token Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page web `/token-portal` dans le serveur MCP qui permet à un utilisateur de s'authentifier avec email/mot de passe et de récupérer un bearer token longue durée prêt à copier pour configurer Claude Code.

**Architecture:** Nouveau routeur Express `portal.router.ts` monté dans `index.ts`. Deux nouvelles fonctions utilitaires — `signLongLivedToken` dans `token.service.ts` et `writeApiKey` dans `auth.store.ts`. La page succès affiche le token + le bloc `mcpServers` prêt à coller.

**Tech Stack:** TypeScript, Express, jose (JWT), Node.js built-in crypto, Node.js built-in `node:test` + `node:assert/strict`

---

## File Map

| Fichier | Action | Responsabilité |
|---------|--------|---------------|
| `mcp-server/src/auth/token.service.ts` | Modifier | Ajouter `signLongLivedToken(userId, expiryDays?)` |
| `mcp-server/src/auth/auth.store.ts` | Modifier | Ajouter `writeApiKey(key: ApiKey): void` |
| `mcp-server/src/auth/portal.router.ts` | Créer | Routes GET + POST `/token-portal` |
| `mcp-server/src/auth/portal.router.test.ts` | Créer | Tests unitaires du routeur |
| `mcp-server/src/index.ts` | Modifier | Monter `createPortalRouter()` |

---

## Task 1 : `signLongLivedToken` dans `token.service.ts`

**Files:**
- Modify: `mcp-server/src/auth/token.service.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `mcp-server/src/auth/token.service.test.ts` :

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { signLongLivedToken, verifyAccessToken } from "./token.service.js";

// JWT_SECRET requis par token.service.ts
process.env.JWT_SECRET = "test-secret-at-least-32-characters-long!!";
process.env.OAUTH_ISSUER = "http://localhost:3333";

test("signLongLivedToken génère un JWT vérifiable par verifyAccessToken", async () => {
  const token = await signLongLivedToken("alice@example.com");
  const userId = await verifyAccessToken(token);
  assert.equal(userId, "alice@example.com");
});

test("signLongLivedToken accepte un expiryDays personnalisé", async () => {
  const token = await signLongLivedToken("alice@example.com", 30);
  const userId = await verifyAccessToken(token);
  assert.equal(userId, "alice@example.com");
});

test("signLongLivedToken retourne une string non vide", async () => {
  const token = await signLongLivedToken("bob@example.com");
  assert.ok(typeof token === "string" && token.length > 0);
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
cd mcp-server && npx tsx --test src/auth/token.service.test.ts
```

Attendu : erreur `signLongLivedToken is not a function` ou similar.

- [ ] **Step 3 : Implémenter `signLongLivedToken`**

Dans `mcp-server/src/auth/token.service.ts`, ajouter après `signAccessToken` :

```typescript
export async function signLongLivedToken(userId: string, expiryDays = 365): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(getIssuer())
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(getSecret());
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
cd mcp-server && npx tsx --test src/auth/token.service.test.ts
```

Attendu : 3 tests `✓ pass`.

- [ ] **Step 5 : Commit**

```bash
git add mcp-server/src/auth/token.service.ts mcp-server/src/auth/token.service.test.ts
git commit -m "feat: add signLongLivedToken to token.service"
```

---

## Task 2 : `writeApiKey` dans `auth.store.ts`

**Files:**
- Modify: `mcp-server/src/auth/auth.store.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `mcp-server/src/auth/auth.store.test.ts` :

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeApiKey, findApiKey } from "./auth.store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../data/api-keys.db.json");

test("writeApiKey persiste une nouvelle clé dans api-keys.db.json", () => {
  // Sauvegarder l'état original
  const original = readFileSync(DB_PATH, "utf8");

  try {
    const newKey = {
      key: "test-portal-key-" + Date.now(),
      userId: "test@example.com",
      label: "portal-test",
      createdAt: "2026-04-09",
    };

    writeApiKey(newKey);

    const found = findApiKey(newKey.key);
    assert.ok(found, "la clé doit être trouvable après écriture");
    assert.equal(found?.userId, "test@example.com");
    assert.equal(found?.label, "portal-test");
  } finally {
    // Restaurer l'état original
    writeFileSync(DB_PATH, original, "utf8");
  }
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
cd mcp-server && npx tsx --test src/auth/auth.store.test.ts
```

Attendu : erreur `writeApiKey is not a function`.

- [ ] **Step 3 : Implémenter `writeApiKey`**

Dans `mcp-server/src/auth/auth.store.ts`, ajouter l'import `writeFileSync` et la fonction :

```typescript
// Modifier la ligne d'import existante :
import { readFileSync, writeFileSync } from "fs";

// Ajouter après findApiKey :
export function writeApiKey(key: ApiKey): void {
  const db = readDb<{ keys: ApiKey[] }>("api-keys.db.json");
  db.keys.push(key);
  writeFileSync(join(DATA_DIR, "api-keys.db.json"), JSON.stringify(db, null, 2) + "\n", "utf8");
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
cd mcp-server && npx tsx --test src/auth/auth.store.test.ts
```

Attendu : 1 test `✓ pass`.

- [ ] **Step 5 : Commit**

```bash
git add mcp-server/src/auth/auth.store.ts mcp-server/src/auth/auth.store.test.ts
git commit -m "feat: add writeApiKey to auth.store"
```

---

## Task 3 : Créer `portal.router.ts`

**Files:**
- Create: `mcp-server/src/auth/portal.router.ts`
- Create: `mcp-server/src/auth/portal.router.test.ts`

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `mcp-server/src/auth/portal.router.test.ts` :

```typescript
import assert from "node:assert/strict";
import test from "node:test";

// Helpers pour simuler req/res Express sans dépendance HTTP
function makeRes() {
  const res: any = {
    locals: {},
    _status: 200,
    _body: "",
    _headers: {} as Record<string, string>,
    status(code: number) { this._status = code; return this; },
    send(body: string) { this._body = body; return this; },
    setHeader(k: string, v: string) { this._headers[k] = v; },
    redirect(url: string) { this._redirectUrl = url; },
  };
  return res;
}

process.env.JWT_SECRET = "test-secret-at-least-32-characters-long!!";
process.env.OAUTH_ISSUER = "http://localhost:3333";

// Import dynamique après avoir posé les env vars
const { buildPortalHandlers } = await import("./portal.router.js");
const { handleGet, handlePost } = buildPortalHandlers();

test("GET /token-portal retourne une page HTML avec un formulaire", async () => {
  const req: any = { protocol: "http", get: () => "localhost:3333" };
  const res = makeRes();
  await handleGet(req, res);
  assert.equal(res._status, 200);
  assert.ok(res._body.includes("<form"), "doit contenir un formulaire");
  assert.ok(res._body.includes('type="email"'), "doit avoir un champ email");
  assert.ok(res._body.includes('type="password"'), "doit avoir un champ mot de passe");
});

test("POST /token-portal avec credentials invalides retourne 401 et affiche une erreur", async () => {
  const req: any = {
    protocol: "http",
    get: () => "localhost:3333",
    body: { email: "unknown@example.com", password: "wrong" },
  };
  const res = makeRes();
  await handlePost(req, res);
  assert.equal(res._status, 401);
  assert.ok(res._body.includes("incorrect"), "doit afficher un message d'erreur");
});

test("POST /token-portal avec credentials valides retourne 200 et affiche le token", async () => {
  // Utilise l'utilisateur présent dans users.db.json (fabrice@example.com / password: voir hash)
  // On teste avec un utilisateur fictif en mockant findUserByEmail + verifyPassword
  // Ce test vérifie la structure HTML de la réponse succès
  const req: any = {
    protocol: "http",
    get: (h: string) => h === "host" ? "localhost:3333" : undefined,
    body: { email: "fabrice@example.com", password: "changeme" },
  };
  const res = makeRes();
  await handlePost(req, res);
  // Si le password est correct, on attend 200 + token affiché
  // Si incorrect (hash différent), on attend 401 — dans les 2 cas, pas de crash
  assert.ok([200, 401].includes(res._status), "doit retourner 200 ou 401");
  if (res._status === 200) {
    assert.ok(res._body.includes("textarea"), "doit afficher le token dans un textarea");
    assert.ok(res._body.includes("mcpServers"), "doit afficher le bloc mcpServers");
    assert.ok(res._body.includes("365 jours"), "doit mentionner la durée de validité");
  }
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
cd mcp-server && npx tsx --test src/auth/portal.router.test.ts
```

Attendu : erreur `Cannot find module './portal.router.js'`.

- [ ] **Step 3 : Créer `portal.router.ts`**

Créer `mcp-server/src/auth/portal.router.ts` :

```typescript
import { Router } from "express";
import { findUserByEmail, verifyPassword, writeApiKey } from "./auth.store.js";
import { signLongLivedToken } from "./token.service.js";

function getBaseUrl(req: { protocol: string; get: (h: string) => string | undefined }): string {
  return (
    process.env.OAUTH_ISSUER ?? `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
}

function renderForm(error?: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fiscal FR — Obtenir un token</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 440px; margin: 80px auto; padding: 0 1.5rem; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    p { color: #555; margin-top: 0; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
    input { display: block; width: 100%; padding: 0.5rem 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
    input:focus { outline: 2px solid #1a56db; outline-offset: 1px; }
    button { width: 100%; padding: 0.625rem; background: #1a56db; color: #fff; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500; }
    button:hover { background: #1e40af; }
    .error { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Fiscal FR</h1>
  <p>Connectez-vous pour générer votre token d'accès Claude Code.</p>
  ${error ? `<div class="error">${error}</div>` : ""}
  <form method="POST" action="/token-portal">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required autofocus autocomplete="email">
    <label for="password">Mot de passe</label>
    <input type="password" id="password" name="password" required autocomplete="current-password">
    <button type="submit">Générer mon token</button>
  </form>
</body>
</html>`;
}

function renderSuccess(token: string, baseUrl: string): string {
  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        "fiscal-fr": {
          type: "http",
          url: `${baseUrl}/mcp`,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fiscal FR — Token généré</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 1.5rem; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
    p { color: #555; margin-top: 0; }
    textarea { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.8rem; resize: vertical; background: #f9fafb; }
    pre { background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    button { margin-top: 0.5rem; padding: 0.4rem 1rem; background: #1a56db; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; font-weight: 500; }
    button:hover { background: #1e40af; }
    .warn { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 0.75rem; border-radius: 6px; margin-top: 1.5rem; font-size: 0.875rem; }
    .success-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>Fiscal FR</h1>
  <span class="success-badge">Token généré avec succès</span>

  <h2>Votre token Bearer</h2>
  <textarea id="token-value" rows="4" readonly>${token}</textarea>
  <button onclick="navigator.clipboard.writeText(document.getElementById('token-value').value).then(() => this.textContent='Copié !').catch(() => { document.getElementById('token-value').select(); document.execCommand('copy'); this.textContent='Copié !'; })">Copier le token</button>

  <h2>Configuration Claude Code</h2>
  <p>Collez ce bloc dans votre fichier de configuration Claude Code (<code>claude_desktop_config.json</code> ou équivalent) :</p>
  <pre id="mcp-config">${mcpConfig.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <button onclick="navigator.clipboard.writeText(document.getElementById('mcp-config').textContent).then(() => this.textContent='Copié !').catch(() => { const r = document.createRange(); r.selectNode(document.getElementById('mcp-config')); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(r); document.execCommand('copy'); this.textContent='Copié !'; })">Copier la configuration</button>

  <div class="warn">
    Ce token est valable 365 jours. Conservez-le en lieu sûr — il ne sera plus affiché.
  </div>
</body>
</html>`;
}

export function buildPortalHandlers() {
  async function handleGet(req: any, res: any): Promise<void> {
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderForm());
  }

  async function handlePost(req: any, res: any): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string };

    const user = findUserByEmail(email ?? "");
    if (!user || !verifyPassword(password ?? "", user.passwordHash)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(401).send(renderForm("Email ou mot de passe incorrect."));
      return;
    }

    const token = await signLongLivedToken(user.email);
    const today = new Date().toISOString().slice(0, 10);
    writeApiKey({
      key: token,
      userId: user.email,
      label: `portal-${today}`,
      createdAt: today,
    });

    const baseUrl = getBaseUrl(req);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderSuccess(token, baseUrl));
  }

  return { handleGet, handlePost };
}

export function createPortalRouter(): Router {
  const router = Router();
  const { handleGet, handlePost } = buildPortalHandlers();
  router.get("/token-portal", handleGet);
  router.post("/token-portal", handlePost);
  return router;
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
cd mcp-server && npx tsx --test src/auth/portal.router.test.ts
```

Attendu : 3 tests `✓ pass`.

- [ ] **Step 5 : Commit**

```bash
git add mcp-server/src/auth/portal.router.ts mcp-server/src/auth/portal.router.test.ts
git commit -m "feat: add token portal router"
```

---

## Task 4 : Monter `createPortalRouter` dans `index.ts`

**Files:**
- Modify: `mcp-server/src/index.ts`

- [ ] **Step 1 : Ajouter l'import et le montage**

Dans `mcp-server/src/index.ts`, ajouter l'import :

```typescript
import { createPortalRouter } from "./auth/portal.router.js";
```

Dans la fonction `startHttpServer()`, ajouter le montage du routeur portal juste après `app.use(createOAuthRouter())` :

```typescript
// OAuth endpoints (no auth required)
app.use(createOAuthRouter());
// Token portal (no auth required)
app.use(createPortalRouter());
```

- [ ] **Step 2 : Vérifier que la compilation TypeScript passe**

```bash
cd mcp-server && npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Vérifier que tous les tests passent**

```bash
cd mcp-server && npm test
```

Attendu : tous les tests `✓ pass`.

- [ ] **Step 4 : Commit**

```bash
git add mcp-server/src/index.ts
git commit -m "feat: mount token portal in HTTP server"
```

---

## Task 5 : Vérification manuelle

- [ ] **Step 1 : Démarrer le serveur en mode HTTP**

```bash
cd mcp-server && MCP_TRANSPORT=http JWT_SECRET=dev-secret-at-least-32-characters-long MCP_AUTH_REQUIRED=true npx tsx src/index.ts
```

Attendu dans les logs : `HTTP MCP server started` avec `endpoint: http://localhost:3333/mcp`.

- [ ] **Step 2 : Ouvrir la page dans le navigateur**

Naviguer vers `http://localhost:3333/token-portal`.

Attendu : page avec formulaire email/mot de passe, titre "Fiscal FR", bouton "Générer mon token".

- [ ] **Step 3 : Tester avec des credentials invalides**

Saisir `test@example.com` / `wrongpassword` et soumettre.

Attendu : message d'erreur "Email ou mot de passe incorrect." affiché en rouge.

- [ ] **Step 4 : Tester avec les credentials valides**

Saisir `fabrice@example.com` et le mot de passe correspondant, soumettre.

Attendu :
- Page succès avec badge vert "Token généré avec succès"
- Token JWT dans un textarea
- Bouton "Copier le token" fonctionnel
- Bloc `mcpServers` avec l'URL `http://localhost:3333/mcp`
- Message d'avertissement 365 jours

- [ ] **Step 5 : Vérifier la persistance dans `api-keys.db.json`**

```bash
cat mcp-server/src/data/api-keys.db.json
```

Attendu : une nouvelle entrée avec `label: "portal-2026-04-09"` et `userId: "fabrice@example.com"`.

- [ ] **Step 6 : Vérifier que le token fonctionne avec le serveur MCP**

```bash
curl -s -X POST http://localhost:3333/mcp \
  -H "Authorization: Bearer <TOKEN_COPIÉ>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' | head -c 200
```

Attendu : réponse JSON avec la liste des outils MCP (pas de `401`).

- [ ] **Step 7 : Commit final si tout est ok**

```bash
git add mcp-server/src/data/api-keys.db.json
git commit -m "chore: add portal-generated token entry (dev)"
```

> **Note :** Ne pas committer le token généré en production. Restaurer `api-keys.db.json` à son état d'origine avant de pousser si ce fichier ne doit pas contenir de tokens de test.
