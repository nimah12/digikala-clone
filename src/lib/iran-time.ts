// ابزارهای زمان ایران (Asia/Tehran)
// ایران از سال ۱۴۰۱ ساعت تابستانی را حذف کرده، پس افست ثابت UTC+3:30 است؛
// با این حال همه‌ی قالب‌بندی‌ها صریحاً timeZone: Asia/Tehran دارند تا
// فارغ از منطقه‌ی زمانی سرور (Vercel و...) همیشه وقت ایران برگردد.

const IRAN_TZ = "Asia/Tehran";

export type IranParts = {
  hour: number;
  minute: number;
  second: number;
  faTime: string; // «۰۹:۳۰:۱۵» با ارقام فارسی
  faDate: string; // «۱۴ مرداد ۱۴۰۵» (شمسی)
  enDate: string; // «5 August 2026» (میلادی)
};

const faNum = (n: number) =>
  n.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false });

export function getIranParts(now: Date = new Date()): IranParts {
  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TZ,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(timeParts.find((p) => p.type === type)?.value ?? 0);

  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  const faDate = new Intl.DateTimeFormat("fa-IR", {
    timeZone: IRAN_TZ,
    calendar: "persian",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const enDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: IRAN_TZ,
    calendar: "gregory",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  return {
    hour,
    minute,
    second,
    faTime: `${faNum(hour)}:${faNum(minute)}:${faNum(second)}`,
    faDate,
    enDate,
  };
}

// ساعتِ همین لحظه به وقت ایران — برای احوال‌پرسی ربات («شب بخیر» بعد از نیمه‌شب و...)
export function getIranHour(now: Date = new Date()): number {
  return getIranParts(now).hour;
}

// قالب‌بندی یک لحظه‌ی خاص (مثلاً تاریخ ثبت سفارش) به وقت ایران
export function formatIranDate(
  date: Date,
  opts: { withTime?: boolean } = {},
): string {
  const base: Intl.DateTimeFormatOptions = {
    timeZone: IRAN_TZ,
    calendar: "persian",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  if (opts.withTime) {
    return new Intl.DateTimeFormat("fa-IR", {
      ...base,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
  return new Intl.DateTimeFormat("fa-IR", base).format(date);
}

// ---------------------------------------------------------------------------
// تقویم ماهانه‌ی شمسی — همه‌چیز بر پایه‌ی Intl (بدون کتابخانه‌ی اضافه)
// ---------------------------------------------------------------------------

export type PersianYMD = { y: number; m: number; day: number };

// بخش‌های شمسی یک تاریخ میلادی (سال، ماه، روز) — با تقویم persian
function getPersianYMD(d: Date): PersianYMD {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TZ,
    calendar: "persian",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month"), day: get("day") };
}

export const WEEKDAYS_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

// ایندکس روز هفته‌ی یک تاریخ: ۰ = شنبه ... ۶ = جمعه
// (مقایسه بدون نیم‌فاصله تا به تفاوت ZWNJ در خروجی Intl حساس نباشیم)
export function getWeekdayIndex(d: Date): number {
  const name = new Intl.DateTimeFormat("fa-IR", {
    timeZone: IRAN_TZ,
    weekday: "long",
  }).format(d);
  const norm = (s: string) => s.replace(/\u200c/g, "");
  const idx = WEEKDAYS_FA.findIndex((w) => norm(w) === norm(name));
  return idx === -1 ? 0 : idx;
}

// تاریخ میلادیِ روزِ اولِ (سال، ماه) شمسی — با تخمین و همگرایی قدم‌به‌قدم
function persianFirstDayDate(jy: number, jm: number, from: Date = new Date()): Date {
  const cur = getPersianYMD(from);
  const monthDiff = (jy - cur.y) * 12 + (jm - cur.m);
  let seed = new Date(from.getTime() + monthDiff * 30 * 86400000);

  // همگرایی به ماه درست (هر قدم ±۱۵ روز)
  for (let i = 0; i < 60; i++) {
    const p = getPersianYMD(seed);
    const diff = (jy - p.y) * 12 + (jm - p.m);
    if (diff === 0) break;
    seed = new Date(seed.getTime() + Math.sign(diff) * 15 * 86400000);
  }

  // قدم به عقب تا رسیدن به روز ۱
  for (let i = 0; i < 40; i++) {
    const p = getPersianYMD(seed);
    if (p.y === jy && p.m === jm && p.day === 1) break;
    seed = new Date(seed.getTime() - 86400000);
  }
  return seed;
}

export type CalendarCell = {
  date: Date; // تاریخ میلادی سلول
  day: number; // شماره‌ی روز شمسی
  inMonth: boolean; // در ماه جاری است یا از ماه قبل/بعد (برای پر کردن شبکه)
  isToday: boolean;
  isFriday: boolean;
  faDay: string; // رقم فارسی
  gregorian: string; // برای tooltip
};

export type PersianMonthGrid = {
  year: number;
  month: number;
  monthName: string;
  cells: CalendarCell[];
};

const faNumPlain = (n: number) =>
  n.toLocaleString("fa-IR", { useGrouping: false });

// نام ماه شمسیِ یک تاریخ (مثلاً «مرداد»)
export function getIranMonthName(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: IRAN_TZ,
    calendar: "persian",
    month: "long",
  }).format(date);
}

function formatGregorian(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IRAN_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

// شبکه‌ی ماهانه‌ی شمسی: هفته از شنبه شروع می‌شود؛ سلول‌های خالی ابتدا/انتها
// با روزهای خاکستری ماه قبل/بعد پر می‌شوند تا شبکه کامل شود.
export function getPersianMonthGrid(
  jy?: number,
  jm?: number,
): PersianMonthGrid {
  const today = new Date();
  const cur = getPersianYMD(today);
  const year = jy ?? cur.y;
  const month = jm ?? cur.m;

  const first = persianFirstDayDate(year, month, today);
  const offset = getWeekdayIndex(first);

  // تعداد روزهای ماه جاری: قدم زدن تا روز ۱ ماه بعد
  let daysInMonth = 31;
  for (let i = 1; i <= 32; i++) {
    const p = getPersianYMD(new Date(first.getTime() + i * 86400000));
    if (p.day === 1 && p.m !== month) {
      daysInMonth = i;
      break;
    }
  }

  // روزهای ماه قبل برای پر کردن ابتدای شبکه
  const daysInPrev = getPersianYMD(
    new Date(first.getTime() - 86400000),
  ).day;
  const nextFirst = new Date(first.getTime() + daysInMonth * 86400000);

  const cells: CalendarCell[] = [];

  // ماه قبل (خاکستری)
  for (let i = offset - 1; i >= 0; i--) {
    const date = new Date(first.getTime() - (i + 1) * 86400000);
    cells.push({
      date,
      day: daysInPrev - offset + i + 1,
      inMonth: false,
      isToday: false,
      isFriday: getWeekdayIndex(date) === 6,
      faDay: faNumPlain(daysInPrev - offset + i + 1),
      gregorian: formatGregorian(date),
    });
  }

  // ماه جاری
  for (let d = 0; d < daysInMonth; d++) {
    const date = new Date(first.getTime() + d * 86400000);
    const wd = getWeekdayIndex(date);
    cells.push({
      date,
      day: d + 1,
      inMonth: true,
      isToday: year === cur.y && month === cur.m && d + 1 === cur.day,
      isFriday: wd === 6,
      faDay: faNumPlain(d + 1),
      gregorian: formatGregorian(date),
    });
  }

  // ماه بعد (خاکستری) برای تکمیل هفته‌ها
  const pad = (7 - (cells.length % 7)) % 7;
  for (let d = 0; d < pad; d++) {
    const date = new Date(nextFirst.getTime() + d * 86400000);
    const p = getPersianYMD(date);
    cells.push({
      date,
      day: p.day,
      inMonth: false,
      isToday: false,
      isFriday: getWeekdayIndex(date) === 6,
      faDay: faNumPlain(p.day),
      gregorian: formatGregorian(date),
    });
  }

  return { year, month, monthName: getIranMonthName(first), cells };
}
