// قفل موقت حساب بعد از تلاش‌های ناموفق پشت‌سرهم (سمت سرور)
//
// بر خلاف rate limit به ازای IP، این قفل به ازای *حساب* است؛ یعنی مهاجم با
// تغییر IP نمی‌تواند یک حساب مشخص را بی‌محدودیت بمباران کند. شمارنده و زمان
// قفل در دیتابیس ذخیره می‌شود تا بین instanceها (serverless) هم سازگار بماند.

export const MAX_LOGIN_FAILS = 5;
export const LOCK_SECONDS = 60;

/**
 * با هر شکست شمارنده جلو می‌رود؛ وقتی به آستانه رسید، قفل فعال و شمارنده
 * صفر می‌شود (بعد از اتمام قفل، فرصت تازه شروع می‌شود).
 * @returns state بعدی شمارنده و زمان قفل (میلی‌ثانیه epoch)، یا 0 اگر قفل نیست
 */
export function computeServerLockState(
  currentCount: number,
  maxFails = MAX_LOGIN_FAILS,
  lockSeconds = LOCK_SECONDS,
  now = Date.now(),
): { nextCount: number; lockedUntilMs: number } {
  const nextCount = currentCount + 1;
  if (nextCount >= maxFails) {
    return { nextCount: 0, lockedUntilMs: now + lockSeconds * 1000 };
  }
  return { nextCount, lockedUntilMs: 0 };
}

/** آیا حساب الان قفل است؟ */
export function isAccountLocked(
  lockedUntil: Date | null,
  now = Date.now(),
): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > now;
}

/** ثانیه‌های باقی‌مانده از قفل (برای هدر Retry-After) */
export function lockRemainingSeconds(
  lockedUntil: Date | null,
  now = Date.now(),
): number {
  if (!lockedUntil) return 0;
  return Math.max(1, Math.ceil((lockedUntil.getTime() - now) / 1000));
}
