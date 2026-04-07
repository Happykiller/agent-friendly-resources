type HeaderValue = string | string[] | undefined;

type HttpLikeRequest = {
  headers?: Record<string, HeaderValue>;
};

function getHeaderValue(request: HttpLikeRequest, headerName: string): string | undefined {
  const value = request.headers?.[headerName.toLowerCase()];
  if (Array.isArray(value)) {
    return value.find((entry) => entry.trim().length > 0)?.trim();
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const parts = token.split(".");
  if (parts.length < 2) {
    return undefined;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (payload.length % 4)) % 4;
    const paddedPayload = payload + "=".repeat(padLength);
    const json = Buffer.from(paddedPayload, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed;
  } catch {
    return undefined;
  }
}

function getJwtAccount(request: HttpLikeRequest): string | undefined {
  const authorization = getHeaderValue(request, "authorization");
  if (!authorization) {
    return undefined;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) {
    return undefined;
  }

  const payload = decodeJwtPayload(match[1]);
  if (!payload) {
    return undefined;
  }

  const candidateKeys = ["email", "preferred_username", "upn", "sub"] as const;
  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

export function extractRequesterAccount(request: HttpLikeRequest): string {
  const configuredHeader = (process.env.MCP_ACCOUNT_HEADER ?? "x-user-account")
    .trim()
    .toLowerCase();

  const candidateHeaders = [
    configuredHeader,
    "x-user-account",
    "x-user-email",
    "x-user-id",
    "x-authenticated-user-email",
    "x-forwarded-email",
    "x-forwarded-user",
    "x-ms-client-principal-name",
  ];

  for (const headerName of candidateHeaders) {
    const value = getHeaderValue(request, headerName);
    if (value) {
      return value;
    }
  }

  const jwtAccount = getJwtAccount(request);
  if (jwtAccount) {
    return jwtAccount;
  }

  return "unknown";
}
