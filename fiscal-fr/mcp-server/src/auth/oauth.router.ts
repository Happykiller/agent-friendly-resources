import { Router } from "express";
import { createHash } from "crypto";
import {
  findUserByEmail,
  verifyPassword,
  createAuthCode,
  consumeAuthCode,
} from "./auth.store.js";
import { signAccessToken, JWT_EXPIRY_SECONDS } from "./token.service.js";

function getIssuer(req: { protocol: string; get: (h: string) => string | undefined }): string {
  return (
    process.env.OAUTH_ISSUER ?? `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
}

function renderLoginPage(params: URLSearchParams, error?: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fiscal FR — Connexion</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 400px; margin: 80px auto; padding: 0 1.5rem; color: #111; }
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
  <p>Connectez-vous pour autoriser l'accès à vos outils fiscaux.</p>
  ${error ? `<div class="error">${error}</div>` : ""}
  <form method="POST" action="/oauth/authorize?${params.toString()}">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required autofocus autocomplete="email">
    <label for="password">Mot de passe</label>
    <input type="password" id="password" name="password" required autocomplete="current-password">
    <button type="submit">Autoriser l'accès</button>
  </form>
</body>
</html>`;
}

export function createOAuthRouter(): Router {
  const router = Router();

  // RFC 8414 — OAuth Server Metadata
  router.get("/.well-known/oauth-authorization-server", (req, res) => {
    const issuer = getIssuer(req as any);
    res.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["mcp:tools"],
      token_endpoint_auth_methods_supported: ["none"],
    });
  });

  // GET /oauth/authorize — show login form
  router.get("/oauth/authorize", (req, res) => {
    const { redirect_uri, code_challenge, code_challenge_method } =
      req.query as Record<string, string>;

    if (!redirect_uri || !code_challenge || code_challenge_method !== "S256") {
      res.status(400).send("Bad request: missing required parameters or unsupported challenge method (only S256 supported)");
      return;
    }

    const params = new URLSearchParams(req.query as Record<string, string>);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderLoginPage(params));
  });

  // POST /oauth/authorize — process login form
  router.post("/oauth/authorize", async (req, res) => {
    const { redirect_uri, state, code_challenge, code_challenge_method } =
      req.query as Record<string, string>;
    const { email, password } = req.body as { email?: string; password?: string };

    if (!redirect_uri || !code_challenge || code_challenge_method !== "S256") {
      res.status(400).send("Bad request");
      return;
    }

    const params = new URLSearchParams(req.query as Record<string, string>);

    const user = findUserByEmail(email ?? "");
    if (!user || !verifyPassword(password ?? "", user.passwordHash)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(401).send(renderLoginPage(params, "Email ou mot de passe incorrect."));
      return;
    }

    const code = createAuthCode({
      userId: user.email,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      redirectUri: redirect_uri,
    });

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);
    res.redirect(redirectUrl.toString());
  });

  // POST /oauth/token — exchange code for access token
  router.post("/oauth/token", async (req, res) => {
    const { grant_type, code, redirect_uri, code_verifier } = req.body as Record<string, string>;

    if (grant_type !== "authorization_code") {
      res.status(400).json({ error: "unsupported_grant_type" });
      return;
    }

    if (!code || !code_verifier) {
      res.status(400).json({
        error: "invalid_request",
        error_description: "Missing code or code_verifier",
      });
      return;
    }

    const authCode = consumeAuthCode(code);
    if (!authCode) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code",
      });
      return;
    }

    // PKCE verification: SHA256(code_verifier) must equal code_challenge
    const challenge = createHash("sha256").update(code_verifier).digest("base64url");
    if (challenge !== authCode.codeChallenge) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "PKCE verification failed",
      });
      return;
    }

    if (redirect_uri && redirect_uri !== authCode.redirectUri) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "redirect_uri mismatch",
      });
      return;
    }

    const accessToken = await signAccessToken(authCode.userId);
    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: JWT_EXPIRY_SECONDS,
    });
  });

  return router;
}
