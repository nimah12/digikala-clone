"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";

/**
 * خواندن ثانیه‌های باقی‌مانده از هدر Retry-After پاسخ 429.
 * اگر هدر نباشد صفر برمی‌گرداند.
 */
export function getRetryAfterSeconds(res: Response): number {
  const raw = res.headers.get("Retry-After");
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** تبدیل ثانیه به «دقیقه:ثانیه» با ارقام فارسی */
export function formatCooldown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const fa = (n: number) => n.toLocaleString("fa-IR", { minimumIntegerDigits: 2 });
  return `${fa(m)}:${fa(s)}`;
}

/**
 * شمارش معکوس زنده بعد از برخورد با rate limit.
 * - `cooldown > 0` یعنی دکمه باید غیرفعال باشد
 * - `setCooldown(seconds)` را در پاسخ 429 صدا بزنید
 */
export function useRateLimitCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  return { cooldown, setCooldown };
}

/** ===== قفل بعد از تلاش‌های ناموفق پشت‌سرهم (فرم ورود) ===== */

const FAIL_KEY = "dk-login-fails";
export const MAX_FAILS = 5;
export const LOCK_SECONDS = 60;

export type FailState = { count: number; lockUntil: number };

/**
 * منطق خالص قفل: با هر شکست count جلو می‌رود؛ وقتی به maxFails رسید،
 * قفل فعال و count صفر می‌شود (بعد از اتمام قفل، ۵ فرصت تازه).
 */
export function computeLockState(
  count: number,
  maxFails: number,
  lockSeconds: number,
  now: number,
): FailState {
  if (count + 1 >= maxFails) {
    return { count: 0, lockUntil: now + lockSeconds * 1000 };
  }
  return { count: count + 1, lockUntil: 0 };
}

/**
 * قفل موقت فرم ورود بعد از ۵ تلاش ناموفق پشت‌سرهم.
 * - وضعیت در localStorage ذخیره می‌شود تا با ریفرش دور زده نشود
 * - `recordFailure()` را روی پاسخ 401 صدا بزنید
 * - `reset()` را بعد از ورود موفق صدا بزنید
 */
export function useFailedAttemptLock() {
  const [now, setNow] = useState(() => Date.now());

  // خواندن وضعیت از localStorage به‌صورت reactive (با ریفرش و تب‌های دیگر همگام)
  const state = useSyncExternalStore(
    subscribeFailState,
    readFailState,
    readFailState,
  );

  // تیک هر ثانیه تا وقتی قفل فعال است (برای به‌روزرسانی شمارش معکوس)
  const locked = state.lockUntil > now;
  useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [locked]);

  const remaining = Math.max(0, Math.ceil((state.lockUntil - now) / 1000));

  const recordFailure = useCallback(() => {
    const prev = readFailState();
    const next = computeLockState(prev.count, MAX_FAILS, LOCK_SECONDS, Date.now());
    setNow(Date.now());
    setFailState({ count: next.count, lockUntil: next.lockUntil });
  }, []);

  const reset = useCallback(() => {
    setNow(Date.now());
    setFailState({ count: 0, lockUntil: 0 });
  }, []);

  return {
    failCount: state.count,
    locked,
    remaining,
    recordFailure,
    reset,
  };
}

/** ===== زیرساخت ذخیره‌سازی localStorage به‌صورت store (برای useSyncExternalStore) ===== */

function readFailState(): FailState {
  if (typeof window === "undefined") return { count: 0, lockUntil: 0 };
  try {
    const raw = window.localStorage.getItem(FAIL_KEY);
    if (!raw) return { count: 0, lockUntil: 0 };
    const st = JSON.parse(raw) as FailState;
    return {
      count: typeof st.count === "number" ? st.count : 0,
      lockUntil: typeof st.lockUntil === "number" ? st.lockUntil : 0,
    };
  } catch {
    return { count: 0, lockUntil: 0 };
  }
}

const failListeners = new Set<() => void>();

function emitFailChange() {
  for (const fn of failListeners) fn();
}

function subscribeFailState(cb: () => void): () => void {
  failListeners.add(cb);
  return () => failListeners.delete(cb);
}

/** نوشتن state جدید + خبر دادن به همه‌ی subscriberها (همین کامپوننت و تب‌های دیگر) */
function setFailState(next: FailState) {
  try {
    window.localStorage.setItem(FAIL_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emitFailChange();
  window.dispatchEvent(new Event("storage"));
}
