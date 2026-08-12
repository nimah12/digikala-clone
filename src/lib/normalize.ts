// نرمال‌سازی حروف فارسی/عربی و حذف نشانه‌ها تا جستجو روی «ی/ي»، «ک/ك»، «ه/ة» و «آ/ا» یکدست باشد
// This module must stay free of server-only dependencies (e.g. prisma) so it
// can be imported from client components like SearchBox.
export function faNormalize(s: string): string {
  return (s || "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة|ۀ/g, "ه")
    .replace(/[إأآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
