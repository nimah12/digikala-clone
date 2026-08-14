import { describe, it, expect } from "vitest";
import {
  formatCooldown,
  getRetryAfterSeconds,
  computeLockState,
  MAX_FAILS,
  LOCK_SECONDS,
} from "./use-rate-limit";

describe("formatCooldown", () => {
  it("seconds only", () => {
    expect(formatCooldown(45)).toBe("۰۰:۴۵");
  });
  it("minutes and seconds", () => {
    expect(formatCooldown(65)).toBe("۰۱:۰۵");
  });
  it("long cooldown", () => {
    expect(formatCooldown(3595)).toBe("۵۹:۵۵");
  });
  it("zero", () => {
    expect(formatCooldown(0)).toBe("۰۰:۰۰");
  });
});

describe("getRetryAfterSeconds", () => {
  it("parses Retry-After header", () => {
    const res = new Response(null, { headers: { "Retry-After": "120" } });
    expect(getRetryAfterSeconds(res)).toBe(120);
  });
  it("returns 0 when header missing", () => {
    expect(getRetryAfterSeconds(new Response(null))).toBe(0);
  });
  it("returns 0 for invalid value", () => {
    const res = new Response(null, { headers: { "Retry-After": "abc" } });
    expect(getRetryAfterSeconds(res)).toBe(0);
  });
});

describe("computeLockState (قفل بعد از تلاش‌های ناموفق)", () => {
  const now = 1_000_000_000_000;

  it("counts consecutive failures", () => {
    expect(computeLockState(0, MAX_FAILS, LOCK_SECONDS, now)).toEqual({ count: 1, lockUntil: 0 });
    expect(computeLockState(3, MAX_FAILS, LOCK_SECONDS, now)).toEqual({ count: 4, lockUntil: 0 });
  });

  it("locks after 5th failure and resets counter", () => {
    const st = computeLockState(4, MAX_FAILS, LOCK_SECONDS, now);
    expect(st.count).toBe(0);
    expect(st.lockUntil).toBe(now + LOCK_SECONDS * 1000);
  });

  it("lock duration matches LOCK_SECONDS", () => {
    const st = computeLockState(4, MAX_FAILS, LOCK_SECONDS, now);
    expect((st.lockUntil - now) / 1000).toBe(LOCK_SECONDS);
  });

  it("custom thresholds", () => {
    expect(computeLockState(2, 3, 30, now)).toEqual({ count: 0, lockUntil: now + 30_000 });
  });
});
