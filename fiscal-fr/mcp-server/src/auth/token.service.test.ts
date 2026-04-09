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
