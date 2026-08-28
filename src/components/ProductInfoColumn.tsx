"use client";

import { useState } from "react";
import Rating from "./Rating";
import PriceBadge from "./PriceBadge";
import Icon from "./Icon";
import { addToCart } from "@/lib/cart-client";
import { formatSizeName } from "@/lib/format";
import { trackAddToCart, type EcommerceItem } from "@/lib/analytics";

type ColorOption = {
  id: number;
  name: string;
  hex: string;
  stock: number;
};

type SizeOption = {
  id: number;
  name: string;
  stock: number;
};

type Props = {
  productId: number;
  categoryName: string;
  name: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  description: string | null;
  price: number;
  discountPercent: number;
  originalPrice?: number | null;
  stock: number;
  colors: ColorOption[];
  sizes?: SizeOption[];
};

function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150;
}

export default function ProductInfoColumn({
  productId,
  categoryName,
  name,
  rating,
  ratingCount,
  salesCount,
  description,
  price,
  discountPercent,
  originalPrice,
  stock,
  colors,
  sizes = [],
}: Props) {
  const requiresColor = colors.length > 1;
  const requiresSize = sizes.length > 1;
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    colors.length === 1 ? colors[0].id : null,
  );
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
    sizes.length === 1 ? sizes[0].id : null,
  );
  const [colorError, setColorError] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [added, setAdded] = useState(false);

  const inStock = stock > 0;
  const selectedColor = colors.find((c) => c.id === selectedColorId) ?? null;
  const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null;

  function handleAddToCart() {
    if (requiresColor && !selectedColor) {
      setColorError("باید یک رنگ انتخاب کنی تا بتونی این محصول رو به سبدت اضافه کنی.");
      return;
    }
    if (requiresSize && !selectedSize) {
      setSizeError("باید یک سایز انتخاب کنی تا بتونی این محصول رو به سبدت اضافه کنی.");
      return;
    }
    setColorError("");
    setSizeError("");
    addToCart(productId, selectedColor ?? undefined, selectedSize ?? undefined);

    const variant = [
      selectedColor?.name,
      selectedSize ? formatSizeName(selectedSize.name) : null,
    ]
      .filter(Boolean)
      .join(" / ");
    const item: EcommerceItem = {
      item_id: productId,
      item_name: name,
      price,
      quantity: 1,
      item_category: categoryName,
      item_variant: variant || undefined,
    };
    trackAddToCart(item);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        {categoryName}
      </div>
      <h1 className="text-xl font-extrabold leading-8 mb-2">{name}</h1>
      <Rating rating={rating} ratingCount={ratingCount} />
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        {salesCount.toLocaleString("fa-IR")} فروش موفق
      </p>

      {colors.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span style={{ color: "var(--text-secondary)" }}>رنگ:</span>
            <span className="font-bold">
              {selectedColor ? selectedColor.name : "انتخاب نشده"}
            </span>
            {selectedColor && selectedColor.stock === 0 && (
              <span className="text-xs text-dk-red">(ناموجود)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedColorId(c.id);
                  setColorError("");
                }}
                title={c.name}
                aria-label={c.name}
                aria-pressed={c.id === selectedColorId}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition"
                style={{
                  background: c.hex,
                  border:
                    c.id === selectedColorId
                      ? "2px solid var(--dk-red, #ef4050)"
                      : "1px solid var(--border)",
                  boxShadow: c.id === selectedColorId ? "0 0 0 2px rgba(239,64,80,0.15)" : "none",
                  opacity: c.stock === 0 ? 0.4 : 1,
                }}
              >
                {c.id === selectedColorId && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke={isLight(c.hex) ? "#000" : "#fff"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {colorError && (
            <p className="text-xs text-dk-red mt-2">{colorError}</p>
          )}
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span style={{ color: "var(--text-secondary)" }}>سایز:</span>
            <span className="font-bold">
              {selectedSize ? formatSizeName(selectedSize.name) : "انتخاب نشده"}
            </span>
            {selectedSize && selectedSize.stock === 0 && (
              <span className="text-xs text-dk-red">(ناموجود)</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSizeId(s.id);
                  setSizeError("");
                }}
                title={`${formatSizeName(s.name)}${s.stock === 0 ? " (ناموجود)" : ""}`}
                aria-label={formatSizeName(s.name)}
                aria-pressed={s.id === selectedSizeId}
                className="min-w-10 h-10 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center"
                style={{
                  background: s.id === selectedSizeId ? "var(--dk-red, #ef4050)" : "var(--bg)",
                  color: s.id === selectedSizeId ? "#fff" : "var(--text)",
                  border:
                    s.id === selectedSizeId
                      ? "1px solid var(--dk-red, #ef4050)"
                      : "1px solid var(--border)",
                  opacity: s.stock === 0 ? 0.4 : 1,
                  cursor: s.stock === 0 ? "not-allowed" : "pointer",
                }}
                disabled={s.stock === 0}
              >
                {formatSizeName(s.name)}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="text-xs text-dk-red mt-2">{sizeError}</p>
          )}
        </div>
      )}

      {description && (
        <p className="mt-4 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}

      {/* Price + add to cart */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg)" }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                inStock ? "bg-dk-green/10 text-dk-green" : "bg-dk-red/10 text-dk-red"
              }`}
            >
              {inStock
                ? `موجود در انبار (${stock.toLocaleString("fa-IR")} عدد)`
                : "ناموجود"}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
              </span>
            )}
          </div>
          <PriceBadge
            price={price}
            discountPercent={discountPercent}
            originalPrice={originalPrice ?? undefined}
          />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`btn-press w-full h-10 rounded-lg text-sm font-bold shadow-sm transition-colors ${
            added
              ? "bg-dk-green text-white"
              : "bg-dk-red text-white hover:bg-dk-red-dark hover:shadow-md"
          }`}
        >
          {added ? (
            <span className="pop-in inline-block">به سبد اضافه شد ✓</span>
          ) : (
            "افزودن به سبد خرید"
          )}
        </button>

        <div className="mt-3 flex items-center gap-4 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1">
            <Icon name="truck" size={14} className="text-dk-green" /> ارسال سریع به سراسر کشور
          </span>
          <span className="flex items-center gap-1">
            <Icon name="shield" size={14} className="text-dk-green" /> ضمانت اصالت کالا
          </span>
          <span className="flex items-center gap-1">
            <Icon name="return" size={14} className="text-dk-green" /> ۷ روز ضمانت بازگشت
          </span>
        </div>
      </div>
    </div>
  );
}
