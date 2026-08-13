// ---- پوشاک تابستانی: حذف آیتم‌های زمستانی و اولویت با آیتم‌های تابستانی ----

const WINTER_CLOTHING = [
  "هودی",
  "سویشرت",
  "ژاکت",
  "پالتو",
  "کاپشن",
  "بادگیر",
  "پلیور",
  "پشمی",
  "بافت",
  "دستکش",
  "شال",
  "حرارتی",
  "کت اسپرت",
];

const SUMMER_CLOTHING = [
  "تیشرت",
  "تی‌شرت",
  "شلوارک",
  "پیراهن",
  "مانتو",
  "کاپری",
  "دامن",
  "پولو",
  "کفش",
  "جوراب",
  "جین",
  "کتان",
  "اسلش",
];

/** آیا اسم محصول، پوشاک زمستانی (هودی و...) هست؟ */
export function isWinterClothing(name: string): boolean {
  return WINTER_CLOTHING.some((t) => name.includes(t));
}

/** آیا اسم محصول، پوشاک تابستانی هست؟ */
export function isSummerClothing(name: string): boolean {
  return !isWinterClothing(name);
}

/** امتیاز تابستان‌بودن (۱ = تابستانی) برای مرتب‌سازی */
export function summerBoost(name: string): number {
  return SUMMER_CLOTHING.some((t) => name.includes(t)) ? 1 : 0;
}
