import { SignJWT, jwtVerify } from "jose";

const JWT_EXPIRY = "24h";
const JWT_EXPIRY_SECONDS = 86400;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

function getIssuer(): string {
  return (process.env.OAUTH_ISSUER ?? "http://localhost:3333").replace(/\/$/, "");
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(getIssuer())
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

export async function signLongLivedToken(userId: string, expiryDays = 365): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(getIssuer())
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: getIssuer(),
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export { JWT_EXPIRY_SECONDS };
