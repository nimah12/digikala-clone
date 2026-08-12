import { formatDiscountPercent, formatPrice } from "@/lib/format";

export default function PriceBadge({
  price,
  discountPercent,
  compact = false,
}: {
  price: number;
  discountPercent: number;
  compact?: boolean;
}) {
  if (discountPercent <= 0) {
    return (
      <div className="text-left">
        <span className={compact ? "text-sm font-bold digits" : "text-base font-bold digits"}>{formatPrice(price)}</span>
        <span className="text-[10px] mr-1" style={{ color: "var(--text-secondary)" }}>تومان</span>
      </div>
    );
  }

  const original = Math.round((price * 100) / (100 - discountPercent));

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="bg-dk-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {formatDiscountPercent(discountPercent)}
        </span>
        <span className="text-[10px] line-through digits" style={{ color: "var(--text-secondary)" }}>
          {formatPrice(original)}
        </span>
      </div>
      <div className="text-left">
        <span className={compact ? "text-sm font-bold digits" : "text-base font-bold digits"}>{formatPrice(price)}</span>
        <span className="text-[10px] mr-1" style={{ color: "var(--text-secondary)" }}>تومان</span>
      </div>
    </div>
  );
}
