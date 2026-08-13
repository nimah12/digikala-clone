import {
  formatDiscountPercent,
  formatPrice,
  getOriginalPrice,
} from "@/lib/format";

export default function PriceBadge({
  price,
  discountPercent,
  originalPrice,
  compact = false,
}: {
  price: number;
  discountPercent: number;
  originalPrice?: number | null;
  compact?: boolean;
}) {
  if (discountPercent <= 0) {
    return (
      <div className="text-left min-w-0">
        <span className={compact ? "text-sm font-bold digits" : "text-sm sm:text-base font-bold digits break-all"}>{formatPrice(price)}</span>
        <span className="text-[10px] mr-1 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>تومان</span>
      </div>
    );
  }

  // برای محصولات جدید originalPrice دقیق ذخیره شده؛ بقیه از روی قیمت نهایی محاسبه می‌شود
  const original = originalPrice ?? getOriginalPrice(price, discountPercent);

  return (
    <div className="flex items-center justify-between gap-x-2 gap-y-1 flex-wrap min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="bg-dk-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
          {formatDiscountPercent(discountPercent)}
        </span>
        {original !== null && (
          <span className="text-[10px] line-through digits break-all" style={{ color: "var(--text-secondary)" }}>
            {formatPrice(original)}
          </span>
        )}
      </div>
      <div className="text-left min-w-0">
        <span className={compact ? "text-sm font-bold digits break-all" : "text-sm sm:text-base font-bold digits break-all"}>{formatPrice(price)}</span>
        <span className="text-[10px] mr-1 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>تومان</span>
      </div>
    </div>
  );
}
