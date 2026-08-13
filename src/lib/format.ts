export function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR");
}

export function formatDiscountPercent(percent: number): string {
  return `٪${percent.toLocaleString("fa-IR")}`;
}

// قیمت نهایی پس از اعمال تخفیف درصدی (قیمت در دیتابیس همیشه نهایی است)
export function getFinalPrice(original: number, discountPercent: number): number {
  if (discountPercent <= 0) return original;
  if (discountPercent >= 100) return 0;
  return Math.round((original * (100 - discountPercent)) / 100);
}

// قیمت اصلی (قبل از تخفیف) از روی قیمت نهایی؛ برای محصولات قدیمی‌ای که originalPrice ندارند
export function getOriginalPrice(
  final: number,
  discountPercent: number,
): number | null {
  if (discountPercent <= 0 || discountPercent >= 100) return null;
  return Math.round((final * 100) / (100 - discountPercent));
}

export function formatRating(rating: number): string {
  return rating
    .toFixed(1)
    .replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])
    .replace(".", "٫");
}

export function formatSales(sales: number): string {
  return `${sales.toLocaleString("fa-IR")} فروش`;
}

// نام سایزهای عددی (مثل 38 یا 38.5) با رقم فارسی نمایش داده می‌شوند؛
// نام‌های متنی (S, XL, ...) دست‌نخورده می‌مانند.
export function formatSizeName(name: string | null | undefined): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed).toLocaleString("fa-IR");
  }
  return name;
}
