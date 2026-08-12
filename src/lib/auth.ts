import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET;
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function sign(payload: string): Buffer {
  if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return createHmac("sha256", AUTH_SECRET).update(payload).digest();
}

export function signAuthToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
  ).toString("base64url");
  const sig = sign(payload).toString("base64url");
  return `${payload}.${sig}`;
}

export function verifyAuthToken(token: string): number | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!AUTH_SECRET) return null;
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expected = sign(payload);
  if (sigBuf.length !== expected.length || !timingSafeEqual(sigBuf, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: number;
      exp?: number;
    };
    if (typeof data.uid !== "number") return null;
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export function readAuthToken(request: Request): number | null {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyAuthToken(token);
}
