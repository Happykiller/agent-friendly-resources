import type { Request, Response, NextFunction } from "express";
import { findApiKey } from "./auth.store.js";
import { verifyAccessToken } from "./token.service.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Bypass auth if explicitly disabled (dev mode)
  if (process.env.MCP_AUTH_REQUIRED === "false") {
    res.locals.userId = process.env.MCP_HTTP_ACCOUNT?.trim() || "dev";
    res.locals.requesterAccount = res.locals.userId;
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized: missing Bearer token" },
      id: null,
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  // Try API key first (fast lookup)
  const apiKey = findApiKey(token);
  if (apiKey) {
    res.locals.userId = apiKey.userId;
    res.locals.requesterAccount = apiKey.userId;
    next();
    return;
  }

  // Fall back to JWT verification
  const userId = await verifyAccessToken(token);
  if (userId) {
    res.locals.userId = userId;
    res.locals.requesterAccount = userId;
    next();
    return;
  }

  res.status(401).json({
    jsonrpc: "2.0",
    error: { code: -32001, message: "Unauthorized: invalid token" },
    id: null,
  });
}
