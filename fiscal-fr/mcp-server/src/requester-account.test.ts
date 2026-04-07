import assert from "node:assert/strict";
import test from "node:test";

import { extractRequesterAccount } from "./requester-account.js";

test("extractRequesterAccount uses x-user-account first", () => {
  const requester = extractRequesterAccount({
    headers: {
      "x-user-account": "alice@example.com",
    },
  });

  assert.equal(requester, "alice@example.com");
});

test("extractRequesterAccount supports configurable header", () => {
  const previous = process.env.MCP_ACCOUNT_HEADER;
  process.env.MCP_ACCOUNT_HEADER = "x-account";

  try {
    const requester = extractRequesterAccount({
      headers: {
        "x-account": "team-account-42",
      },
    });
    assert.equal(requester, "team-account-42");
  } finally {
    if (previous === undefined) {
      delete process.env.MCP_ACCOUNT_HEADER;
    } else {
      process.env.MCP_ACCOUNT_HEADER = previous;
    }
  }
});

test("extractRequesterAccount can read JWT email claim", () => {
  const payload = Buffer.from(JSON.stringify({ email: "jwt-user@example.com" }))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const requester = extractRequesterAccount({
    headers: {
      authorization: `Bearer header.${payload}.signature`,
    },
  });

  assert.equal(requester, "jwt-user@example.com");
});

test("extractRequesterAccount returns unknown without identity", () => {
  const requester = extractRequesterAccount({
    headers: {},
  });

  assert.equal(requester, "unknown");
});
