"use client";

import { useEffect, useState } from "react";

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
