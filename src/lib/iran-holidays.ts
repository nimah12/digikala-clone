// تعطیلات رسمی ایران — بدون کتابخانه‌ی اضافه، فقط با Intl
//
// دو دسته تعطیل داریم:
//  ۱) ثابت شمسی: روزهایی که هر سال در همان روزِ ماهِ شمسی‌اند (نوروز، ۲۲ بهمن، ...)
//  ۲) متغیر قمری: بر اساس تقویم هجری قمری (عاشورا، عید فطر، عید قربان، ...)
//     که با تقویم islamic-umalqura (ام‌القری) محاسبه می‌شوند.

const IRAN_TZ = "Asia/Tehran";

export type Holiday = { name: string };

// ---------------------------------------------------------------------------
// تعطیلات ثابت شمسی:  key = ماه شمسی، value = روز → نام
// ---------------------------------------------------------------------------
const SOLAR_HOLIDAYS: Record<number, Record<number, Holiday>> = {
  1: {
    1: { name: "عید نوروز" },
    2: { name: "عید نوروز" },
    3: { name: "عید نوروز" },
    4: { name: "عید نوروز" },
    12: { name: "روز جمهوری اسلامی ایران" },
    13: { name: "روز طبیعت (سیزده‌به‌در)" },
  },
  3: {
    14: { name: "رحلت امام خمینی (ره)" },
    15: { name: "قیام ۱۵ خرداد" },
  },
  11: {
    22: { name: "پیروزی انقلاب اسلامی" },
  },
  12: {
    29: { name: "روز ملی شدن صنعت نفت" },
  },
};

// ---------------------------------------------------------------------------
// تعطیلات متغیر قمری:  key = ماه قمری، value = روز → نام
// ---------------------------------------------------------------------------
const LUNAR_HOLIDAYS: Record<number, Record<number, Holiday>> = {
  7: {
    13: { name: "ولادت امام علی (ع)" },
    27: { name: "مبعث رسول اکرم (ص)" },
  },
  9: {
    21: { name: "شهادت امام علی (ع)" },
  },
  10: {
    1: { name: "عید سعید فطر" },
    2: { name: "تعطیل عید فطر" },
  },
  12: {
    10: { name: "عید سعید قربان" },
    18: { name: "عید غدیر خم" },
  },
  1: {
    9: { name: "تاسوعای حسینی" },
    10: { name: "عاشورای حسینی" },
  },
  2: {
    20: { name: "اربعین حسینی" },
    28: { name: "رحلت پیامبر (ص) و شهادت امام حسن (ع)" },
    30: { name: "شهادت امام رضا (ع)" },
  },
};

// بخش‌های شمسی یک تاریخ میلادی (تقویم persian)
function getPersianYMD(d: Date): { y: number; m: number; day: number } {
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

// بخش‌های قمری یک تاریخ میلادی (تقویم islamic-umalqura — ام‌القری)
function getIslamicYMD(d: Date): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TZ,
    calendar: "islamic-umalqura",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month"), day: get("day") };
}

// نام تعطیلیِ یک تاریخ میلادی — اگر تعطیل نبود null برمی‌گرداند
export function getIranHoliday(date: Date): Holiday | null {
  const solar = getPersianYMD(date);
  const solarHit = SOLAR_HOLIDAYS[solar.m]?.[solar.day];
  if (solarHit) return solarHit;

  const lunar = getIslamicYMD(date);
  const lunarHit = LUNAR_HOLIDAYS[lunar.m]?.[lunar.day];
  if (lunarHit) return lunarHit;

  return null;
}
