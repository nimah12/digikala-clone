import { createHmac, timingSafeEqual } from "crypto";

const RESET_TTL_SECONDS = 60 * 60; // ۱ ساعت اعتبار

function sign(payload: string): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(`reset:${payload}`).digest();
}

export function createResetToken(userId: number, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      email,
      exp: Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS,
      purpose: "password-reset",
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export function verifyResetToken(
  token: string,
): { uid: number; email: string } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expected = sign(payload);
  if (sigBuf.length !== expected.length || !timingSafeEqual(sigBuf, expected)) {
    return null;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { uid?: number; email?: string; exp?: number; purpose?: string };
    if (data.purpose !== "password-reset" || typeof data.uid !== "number") {
      return null;
    }
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { uid: data.uid, email: data.email ?? "" };
  } catch {
    return null;
  }
}
