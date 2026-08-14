import { describe, expect, it, vi } from "vitest";
import { ipKey, rateLimit } from "./rate-limit";

describe("rate-limit (sliding window)", () => {
  it("درخواست‌های زیر محدودیت مجازند", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("t1", { limit: 5, windowMs: 60_000 }).ok).toBe(true);
    }
  });

  it("بعد از رسیدن به محدودیت، درخواست رد می‌شود", () => {
    const key = "t2";
    for (let i = 0; i < 3; i++) {
      rateLimit(key, { limit: 3, windowMs: 60_000 });
    }
    const result = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("کلیدهای مختلف مستقل از هم‌اند", () => {
    rateLimit("a", { limit: 1, windowMs: 60_000 });
    expect(rateLimit("b", { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });

  it("بعد از گذشت پنجره، محدودیت بازنشانی می‌شود", () => {
    vi.useFakeTimers();
    try {
      const key = "t3";
      rateLimit(key, { limit: 1, windowMs: 10_000 });
      expect(rateLimit(key, { limit: 1, windowMs: 10_000 }).ok).toBe(false);
      vi.advanceTimersByTime(10_001);
      expect(rateLimit(key, { limit: 1, windowMs: 10_000 }).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("ipKey از x-forwarded-for اولین آدرس را می‌گیرد", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(ipKey(req)).toBe("ip:1.2.3.4");
  });

  it("ipKey بدون هدر، مقدار پیش‌فرض می‌دهد", () => {
    const req = new Request("https://example.com");
    expect(ipKey(req)).toBe("ip:unknown");
  });
});
