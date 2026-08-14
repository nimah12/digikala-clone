import { describe, it, expect, vi } from "vitest";
import {
  signAuthToken,
  verifyAuthToken,
  readAuthToken,
} from "./auth";

describe("auth", () => {
  it("signs and verifies a valid token", () => {
    const token = signAuthToken(42);
    expect(token).toContain(".");
    expect(verifyAuthToken(token)).toBe(42);
  });

  it("rejects a token signed with a different secret", async () => {
    process.env.AUTH_SECRET = "another-secret";
    vi.resetModules();
    const other = await import("./auth");
    const token = other.signAuthToken(42);
    expect(verifyAuthToken(token)).toBeNull();
  });

  it("rejects tampered payload", () => {
    const token = signAuthToken(42);
    const [payload, sig] = token.split(".");
    expect(verifyAuthToken(`${payload}Z.${sig}`)).toBeNull();
  });

  it("reads a valid bearer token from request headers", () => {
    const token = signAuthToken(7);
    const request = new Request("https://example.com", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(readAuthToken(request)).toBe(7);
  });

  it("returns null when no auth header", () => {
    const request = new Request("https://example.com");
    expect(readAuthToken(request)).toBeNull();
  });
});