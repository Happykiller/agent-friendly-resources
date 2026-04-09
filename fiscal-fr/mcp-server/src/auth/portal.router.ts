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

    const token = await signLongLivedToken(user.email, 365);
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
