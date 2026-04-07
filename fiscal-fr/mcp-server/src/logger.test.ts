import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

import { Logger } from "./logger.js";

test("logger writes file logs", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fiscal-fr-logger-"));
  const filePath = join(dir, "mcp.log");

  const logger = new Logger({
    level: "info",
    filePath,
    stderrEnabled: false,
    rotateDaily: false,
  });

  logger.info("server started", { transport: "stdio" });
  logger.debug("not expected in output");

  await logger.close();

  const logContent = readFileSync(filePath, "utf8");
  assert.match(logContent, /INFO server started/);
  assert.match(logContent, /"transport":"stdio"/);
  assert.doesNotMatch(logContent, /DEBUG not expected in output/);
});

test("logger rotates file daily when date changes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fiscal-fr-logger-rotate-"));
  const baseFilePath = join(dir, "mcp-{date}.log");
  let currentDate = new Date("2026-04-07T08:00:00.000Z");

  const logger = new Logger({
    level: "debug",
    filePath: baseFilePath,
    stderrEnabled: false,
    rotateDaily: true,
    now: () => currentDate,
  });

  logger.info("day-1");
  currentDate = new Date("2026-04-08T09:15:00.000Z");
  logger.info("day-2");

  await logger.close();

  const dayOne = readFileSync(join(dir, "mcp-2026-04-07.log"), "utf8");
  const dayTwo = readFileSync(join(dir, "mcp-2026-04-08.log"), "utf8");

  assert.match(dayOne, /INFO day-1/);
  assert.match(dayTwo, /INFO day-2/);
});
