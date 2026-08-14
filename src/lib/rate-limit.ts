// Rate limiter ساده درون‌حافظه‌ای (sliding window) — کلید: آدرس IP
//
// برای دپلوی‌های تک‌ایستانه (Vercel/Netlify با serverless) در حافظه‌ی هر
// instance است؛ در این مقیاس برای جلوگیری از brute-force و اسپم کافی است.
// ساختار Map با پاکسازی خودکار ورودی‌های قدیمی، بدون memory leak.

type Bucket = {
  hits: number[];
};

const BUCKETS = new Map<string, Bucket>();

// هر چند دقیقه یک‌بار ورودی‌های خالی/قدیمی پاک می‌شوند
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  for (const [key, b] of BUCKETS) {
    // حذف ضربه‌های قدیمی‌تر از قدیمی‌ترین پنجره‌ی ممکن (۱۰ دقیقه)
    b.hits = b.hits.filter((t) => now - t < 10 * 60 * 1000);
    if (b.hits.length === 0) BUCKETS.delete(key);
  }
}

/**
 * بررسی محدودیت نرخ برای یک کلید (مثل IP).
 * @returns true اگر درخواست مجاز است؛ false اگر باید رد شود.
 */
export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanup(now);
    lastCleanup = now;
  }

  let bucket = BUCKETS.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    BUCKETS.set(key, bucket);
  }

  // حذف ضربه‌های خارج از پنجره
  bucket.hits = bucket.hits.filter((t) => now - t < opts.windowMs);

  if (bucket.hits.length >= opts.limit) {
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, retryAfterMs: Math.max(1, opts.windowMs - (now - oldest)) };
  }

  bucket.hits.push(now);
  return { ok: true };
}

// کلید استاندارد بر اساس آدرس IP درخواست‌کننده
export function ipKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return `ip:${first}`;
  }
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return `ip:${cf}`;
  return `ip:unknown`;
}
