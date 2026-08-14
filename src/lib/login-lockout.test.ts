import { describe, expect, it } from "vitest";
import {
  computeServerLockState,
  isAccountLocked,
  lockRemainingSeconds,
  MAX_LOGIN_FAILS,
  LOCK_SECONDS,
} from "./login-lockout";

describe("computeServerLockState", () => {
  const now = 1_000_000_000_000;

  it("شمارنده‌ی تلاش‌های ناموفق را جلو می‌برد", () => {
    expect(computeServerLockState(0, MAX_LOGIN_FAILS, LOCK_SECONDS, now)).toEqual({
      nextCount: 1,
      lockedUntilMs: 0,
    });
    expect(computeServerLockState(3, MAX_LOGIN_FAILS, LOCK_SECONDS, now)).toEqual({
      nextCount: 4,
      lockedUntilMs: 0,
    });
  });

  it("بعد از ۵مین شکست، قفل فعال و شمارنده صفر می‌شود", () => {
    const st = computeServerLockState(4, MAX_LOGIN_FAILS, LOCK_SECONDS, now);
    expect(st.nextCount).toBe(0);
    expect(st.lockedUntilMs).toBe(now + LOCK_SECONDS * 1000);
  });

  it("مدت قفل دقیقاً LOCK_SECONDS است", () => {
    const st = computeServerLockState(4, MAX_LOGIN_FAILS, LOCK_SECONDS, now);
    expect((st.lockedUntilMs - now) / 1000).toBe(LOCK_SECONDS);
  });

  it("آستانه‌ی سفارشی کار می‌کند", () => {
    expect(computeServerLockState(2, 3, 30, now)).toEqual({
      nextCount: 0,
      lockedUntilMs: now + 30_000,
    });
  });
});

describe("isAccountLocked / lockRemainingSeconds", () => {
  const now = 1_000_000_000_000;

  it("lockedUntil null یعنی قفل نیست", () => {
    expect(isAccountLocked(null, now)).toBe(false);
    expect(lockRemainingSeconds(null, now)).toBe(0);
  });

  it("قفل گذشته یعنی قفل نیست", () => {
    const past = new Date(now - 5_000);
    expect(isAccountLocked(past, now)).toBe(false);
  });

  it("قفل فعال یعنی قفل است", () => {
    const future = new Date(now + 30_000);
    expect(isAccountLocked(future, now)).toBe(true);
  });

  it("ثانیه‌های باقی‌مانده را بالاگرد می‌دهد", () => {
    const future = new Date(now + 30_001);
    expect(lockRemainingSeconds(future, now)).toBe(31);
  });
});
