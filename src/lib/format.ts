export function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR");
}

export function formatDiscountPercent(percent: number): string {
  return `٪${percent.toLocaleString("fa-IR")}`;
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
