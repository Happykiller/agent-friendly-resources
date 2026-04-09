import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../data");

export type User = { id: string; email: string; passwordHash: string };
export type ApiKey = { key: string; userId: string; label: string; createdAt: string };
export type AuthCode = {
  code: string;
  userId: string;
  expiresAt: number;
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
};

function readDb<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as T;
}

// --- Password hashing (Node.js built-in crypto) ---

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, derivedBuffer);
}

// --- Users ---

export function findUserByEmail(email: string): User | undefined {
  const db = readDb<{ users: User[] }>("users.db.json");
  return db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

// --- API Keys ---

export function findApiKey(key: string): ApiKey | undefined {
  const db = readDb<{ keys: ApiKey[] }>("api-keys.db.json");
  return db.keys.find((k) => k.key === key);
}

export function writeApiKey(key: ApiKey): void {
  const db = readDb<{ keys: ApiKey[] }>("api-keys.db.json");
  db.keys.push(key);
  writeFileSync(join(DATA_DIR, "api-keys.db.json"), JSON.stringify(db, null, 2) + "\n", "utf8");
}

// --- Auth codes (in-memory, ephemeral 10 min TTL) ---

const IN_MEMORY_CODES: AuthCode[] = [];

export function createAuthCode(
  data: Omit<AuthCode, "code" | "expiresAt">
): string {
  const code = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 10 * 60 * 1000;
  IN_MEMORY_CODES.push({ ...data, code, expiresAt });
  return code;
}

export function consumeAuthCode(code: string): AuthCode | undefined {
  const now = Date.now();
  const idx = IN_MEMORY_CODES.findIndex((c) => c.code === code && c.expiresAt > now);
  if (idx === -1) return undefined;
  const [found] = IN_MEMORY_CODES.splice(idx, 1);
  return found;
}
