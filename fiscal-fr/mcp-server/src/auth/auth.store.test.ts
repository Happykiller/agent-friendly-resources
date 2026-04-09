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
