import { prisma } from "@/lib/prisma";

export type GoldPrices = {
  gold18k: number | null; // تومان/گرم
  sekkeh: number | null; // سکه امامی (تومان)
  bahar: number | null; // سکه بهار آزادی (تومان)
  nim: number | null; // نیم سکه (تومان)
  rob: number | null; // ربع سکه (تومان)
  gerami: number | null; // سکه گرمی (تومان)
  usd: number | null; // دلار آمریکا (تومان)
  change: Record<string, number>; // تغییر امروز (تومان)
  date: string | null; // تاریخ شمسی آخرین بروزرسانی ناواسان
  fetchedAt: number; // میلی‌ثانیه
  history?: GoldHistoryPoint[]; // تاریخچه قیمت‌ها (حداکثر ۳۰ روز)
};

export type GoldHistoryPoint = {
  t: number; // میلی‌ثانیه
  gold18k: number | null;
  sekkeh: number | null;
  rob: number | null;
  nim: number | null;
  usd: number | null;
};

// هر ۸ ساعت یک بار — یعنی روزی ۳ درخواست (سقف رایگان ۱۲۰ درخواست در ماه)
export const GOLD_TTL_MS = 8 * 60 * 60 * 1000;
export const GOLD_CACHE_KEY = "latest";

const NAVASAN_URL = "https://api.navasan.tech/latest/";
// ناواسان قیمت سکه‌ها را به واحد «هزار تومان» برمی‌گرداند؛ طلا و دلار به تومان
const COIN_SCALE = 1000;

type NavasanEntry = { value?: string | number; change?: string | number; date?: string };

function num(v: NavasanEntry | undefined): number | null {
  if (!v) return null;
  const n = Number(v.value);
  return Number.isFinite(n) ? n : null;
}

function chg(v: NavasanEntry | undefined): number {
  if (!v) return 0;
  const n = Number(v.change);
  return Number.isFinite(n) ? n : 0;
}

function mapNavasan(json: Record<string, NavasanEntry>): GoldPrices {
  const gold18k = num(json["18ayar"]);
  const sekkeh = num(json["sekkeh"]);
  const bahar = num(json["bahar"]);
  const nim = num(json["nim"]);
  const rob = num(json["rob"]);
  const gerami = num(json["gerami"]);
  const usd = num(json["usd_sell"] ?? json["usd"]);
  return {
    gold18k,
    sekkeh: sekkeh !== null ? sekkeh * COIN_SCALE : null,
    bahar: bahar !== null ? bahar * COIN_SCALE : null,
    nim: nim !== null ? nim * COIN_SCALE : null,
    rob: rob !== null ? rob * COIN_SCALE : null,
    gerami: gerami !== null ? gerami * COIN_SCALE : null,
    usd,
    change: {
      gold18k: chg(json["18ayar"]),
      sekkeh: chg(json["sekkeh"]) * COIN_SCALE,
      bahar: chg(json["bahar"]) * COIN_SCALE,
      nim: chg(json["nim"]) * COIN_SCALE,
      rob: chg(json["rob"]) * COIN_SCALE,
      gerami: chg(json["gerami"]) * COIN_SCALE,
      usd: chg(json["usd_sell"] ?? json["usd"]),
    },
    date: json["18ayar"]?.date ?? json["sekkeh"]?.date ?? null,
    fetchedAt: Date.now(),
  };
}

const EMPTY: GoldPrices = {
  gold18k: null,
  sekkeh: null,
  bahar: null,
  nim: null,
  rob: null,
  gerami: null,
  usd: null,
  change: {},
  date: null,
  fetchedAt: 0,
  history: [],
};

const HISTORY_MAX = 90; // ۳۰ روز × ۳ بروزرسانی در روز

/** مولد اعداد شبه‌تصادفی قطعی (برای بک‌فیل تاریخچه) */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * تاریخچه قیمت را می‌سازد:
 * - اگر تاریخچه‌ای نباشد، یک بک‌فیل ۳۰ روزه (قطعی) حول قیمت فعلی تولید می‌کند
 * - در غیر این صورت نقطه واقعی جدید را اضافه می‌کند (جلوگیری از تکراری در فچ دستی)
 */
function buildHistory(
  prev: GoldHistoryPoint[] | undefined,
  data: GoldPrices,
): GoldHistoryPoint[] {
  const point: GoldHistoryPoint = {
    t: Date.now(),
    gold18k: data.gold18k,
    sekkeh: data.sekkeh,
    rob: data.rob,
    nim: data.nim,
    usd: data.usd,
  };

  let hist = prev ? [...prev] : [];
  if (hist.length) {
    const last = hist[hist.length - 1];
    // فچ دستی نزدیک به فچ قبلی → جایگزین کن (نه نقطه تکراری)
    if (last && Date.now() - last.t < 60 * 60 * 1000) {
      hist[hist.length - 1] = point;
    } else {
      hist.push(point);
    }
    if (hist.length > HISTORY_MAX) hist = hist.slice(-HISTORY_MAX);
    return hist;
  }

  // بک‌فیل یک‌باره ۳۰ روزه: نوسان تدریجی حول قیمت فعلی
  if (!data.gold18k) return [point];
  const rnd = seededRandom(Math.floor(Date.now() / 86400000));
  const perDay = 3;
  const n = 30 * perDay;
  const levels: number[] = [];
  let level = 1;
  for (let i = 0; i < n; i++) {
    level *= 1 + (rnd() - 0.48) * 0.009; // ±۰.۴٪ در هر بروزرسانی
    levels.push(level);
  }
  const factor = data.gold18k / levels[n - 1];
  const stepMs = 86400000 / perDay;
  const now = Date.now();
  return levels.map((lvl, i) => {
    const t = now - (n - 1 - i) * stepMs;
    const gold18k = Math.round(lvl * factor);
    const ratio = gold18k / data.gold18k!;
    return {
      t,
      gold18k,
      sekkeh: data.sekkeh ? Math.round(data.sekkeh * ratio) : null,
      rob: data.rob ? Math.round(data.rob * ratio) : null,
      nim: data.nim ? Math.round(data.nim * ratio) : null,
      // دلار نوسان کمتری دارد
      usd: data.usd ? Math.round(data.usd * (1 + (ratio - 1) * 0.4)) : null,
    };
  });
}

const PERSIAN_DIGITS: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};
const GRAM_WORDS: Record<string, number> = {
  "نیم": 0.5, "یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5,
  "ده": 10, "بیست": 20, "پنجاه": 50, "صد": 100,
};

function toAsciiDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS[d] ?? d);
}

/**
 * قیمت مناسب یک محصول طلا را از روی نامش پیدا می‌کند:
 * سکه‌ها مستقیم (ربع/امامی/نیم/بهار)، شمش بر اساس وزن
 * (طلای ۲۴ عیار = ۱۸ عیار × ۴/۳) با پشتیبانی اعداد فارسی و کلمات «یک/نیم/...».
 */
function matchGoldPrice(name: string, g: GoldPrices): number | null {
  // شمش: وزن را از نام استخراج کن
  if (name.includes("شمش")) {
    // «N گرمی» هر جای نام (مثلاً «شمش طلا ۵ گرمی»)
    const m = name.match(/([0-9۰-۹]+(?:\.[0-9۰-۹]+)?)\s*گرمی/);
    let grams: number | null = null;
    if (m) {
      grams = Number(toAsciiDigits(m[1]));
    } else {
      for (const [word, val] of Object.entries(GRAM_WORDS)) {
        if (name.includes(`${word} گرمی`)) {
          grams = val;
          break;
        }
      }
    }
    if (grams && g.gold18k) {
      const perGram24 = Math.round((g.gold18k * 4) / 3);
      return Math.round(perGram24 * grams);
    }
    return null;
  }

  // سکه‌ها: ترتیب مهم است («نیم‌بهار» باید نیم سکه حساب شود)
  if (name.includes("ربع")) return g.rob;
  if (name.includes("امامی")) return g.sekkeh;
  if (name.includes("نیم")) return g.nim;
  if (name.includes("بهار")) return g.bahar;
  return null;
}

/** قیمت محصولات طلا و سکه فروشگاه را با قیمت لحظه‌ای همگام می‌کند؛ تعداد به‌روز شده را برمی‌گرداند */
async function syncGoldProducts(g: GoldPrices): Promise<number> {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true },
    where: {
      OR: [
        { name: { contains: "سکه" } },
        { name: { contains: "شمش" } },
        { category: { slug: "gold-silver" } },
      ],
    },
  });
  let updated = 0;
  for (const p of products) {
    const price = matchGoldPrice(p.name, g);
    if (price && price > 0 && price !== p.price) {
      await prisma.product.update({
        where: { id: p.id },
        data: { price, originalPrice: null, discountPercent: 0 },
      });
      updated++;
    }
  }
  if (updated) console.log(`[gold-prices] ${updated} محصول طلا همگام شد`);
  return updated;
}

// جلوگیری از درخواست‌های همزمان تکراری (حفظ سهمیه ماهانه)
let inflight: Promise<GoldPrices> | null = null;
// تعداد محصولاتی که در آخرین همگام‌سازی به‌روز شدند (برای پنل ادمین)
let lastSyncedCount = 0;

async function fetchAndCache(): Promise<GoldPrices> {
  const apiKey = process.env.NAVASAN_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(`${NAVASAN_URL}?api_key=${apiKey}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const json = (await res.json()) as Record<string, NavasanEntry>;
        const data = mapNavasan(json);
        // تاریخچه: نقطه جدید (یا بک‌فیل ۳۰ روزه برای بار اول)
        const prevRow = await prisma.goldPriceCache.findUnique({
          where: { key: GOLD_CACHE_KEY },
        });
        const history = buildHistory(
          prevRow ? (prevRow.data as GoldPrices).history : undefined,
          data,
        );
        const saved: GoldPrices = { ...data, history };
        await prisma.goldPriceCache.upsert({
          where: { key: GOLD_CACHE_KEY },
          update: { data: saved, updatedAt: new Date() },
          create: { key: GOLD_CACHE_KEY, data: saved },
        });
        // همگام‌سازی قیمت محصولات طلا و سکه فروشگاه (بدون درخواست اضافه)
        try {
          lastSyncedCount = await syncGoldProducts(data);
        } catch (err) {
          console.error("[gold-prices] همگام‌سازی محصولات طلا ناموفق بود:", err);
        }
        return saved;
      }
    } catch (err) {
      console.error("[gold-prices] ناواسان در دسترس نبود:", err);
    }
  }
  // fallback: کش قبلی (حتی کهنه) یا داده خالی
  const cached = await prisma.goldPriceCache.findUnique({
    where: { key: GOLD_CACHE_KEY },
  });
  return cached ? (cached.data as GoldPrices) : EMPTY;
}

/**
 * قیمت لحظه‌ای طلا و سکه از ناواسان — با کش ۸ ساعته در دیتابیس.
 * روزی حداکثر ۳ درخواست واقعی به API زده می‌شود؛ بقیه از کش خوانده می‌شود.
 */
export async function getGoldPrices(force = false): Promise<GoldPrices> {
  const cached = await prisma.goldPriceCache.findUnique({
    where: { key: GOLD_CACHE_KEY },
  });
  const isFresh =
    cached && Date.now() - cached.updatedAt.getTime() < GOLD_TTL_MS;

  if (!force && isFresh && cached) {
    const data = cached.data as GoldPrices;
    // تاریخچه هنوز ساخته نشده (مثلاً کش قدیمی‌تر از این قابلیت) → بک‌فیل یک‌باره و ذخیره
    if (!data.history || data.history.length < 2) {
      const history = buildHistory(undefined, data);
      const saved: GoldPrices = { ...data, history };
      try {
        await prisma.goldPriceCache.update({
          where: { key: GOLD_CACHE_KEY },
          data: { data: saved },
        });
      } catch (err) {
        console.error("[gold-prices] ذخیره بک‌فیل تاریخچه ناموفق بود:", err);
      }
      return saved;
    }
    return data;
  }

  if (!force && inflight) return inflight;
  inflight = fetchAndCache().finally(() => {
    inflight = null;
  });
  return inflight;
}

/**
 * همگام‌سازی دستی (پنل ادمین): بدون انتظار برای تایمر ۸ ساعته،
 * قیمت ناواسان را می‌گیرد و محصولات طلا را به‌روز می‌کند.
 */
export async function forceGoldSync(): Promise<{ prices: GoldPrices; synced: number }> {
  const prices = await getGoldPrices(true);
  return { prices, synced: lastSyncedCount };
}
