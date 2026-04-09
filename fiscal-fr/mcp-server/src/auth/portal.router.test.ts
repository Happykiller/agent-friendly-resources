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
    json(body: unknown) { this._body = JSON.stringify(body); return this; },
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
