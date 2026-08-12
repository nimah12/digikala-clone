import { describe, it, expect } from "vitest";
import { hashPassword, isHashedPassword, verifyPassword } from "./password";

describe("password", () => {
  it("hashes a password with scrypt prefix", async () => {
    const hash = await hashPassword("secret123");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(isHashedPassword(hash)).toBe(true);
  });

  it("verifies correct password and rejects wrong ones", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("correct-horse", hash)).toBe(true);
    expect(await verifyPassword("wrong-pass", hash)).toBe(false);
  });

  it("generates unique salts for same password", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("falls back to plaintext comparison for legacy values", async () => {
    expect(await verifyPassword("plain", "plain")).toBe(true);
    expect(await verifyPassword("plain", "other")).toBe(false);
  });

  it("returns false on malformed stored hash", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "scrypt:zzz")).toBe(false);
  });
});