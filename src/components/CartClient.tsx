"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartItems } from "@/lib/cart-client";
import { useHydrated } from "@/lib/hydration";
import { formatPrice, formatSizeName } from "@/lib/format";
import Icon from "./Icon";

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  category: { name: string };
};

type CartItem = {
  id: number;
  qty: number;
  colorId?: number;
  colorName?: string;
  colorHex?: string;
  sizeId?: number;
  sizeName?: string;
};

function lineKey(item: {
  id: number;
  colorId?: number;
  sizeId?: number;
}): string {
  return `${item.id}-${item.colorId ?? "none"}-${item.sizeId ?? "none"}`;
}

function writeCart(items: CartItem[]) {
  localStorage.setItem("dk-cart", JSON.stringify(items));
  window.dispatchEvent(new Event("dk-cart-changed"));
}

export default function CartClient() {
  const items = useCartItems();
  const hydrated = useHydrated();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [prevItemsKey, setPrevItemsKey] = useState("");

  const itemsKey = items.map((i) => i.id).join(",");
  if (prevItemsKey !== itemsKey) {
    setPrevItemsKey(itemsKey);
    if (items.length === 0) setProducts([]);
  }

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    fetch(`/api/products?ids=${items.map((i) => i.id).join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setProducts(d.data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const enriched = items
    .map((item) => ({ ...item, product: productById.get(item.id) }))
    .filter((x) => x.product);

  const total = enriched.reduce((sum, x) => sum + x.product!.price * x.qty, 0);
  const totalQty = enriched.reduce((sum, x) => sum + x.qty, 0);

  function updateQty(key: string, delta: number) {
    const next = items.map((item) => {
      if (lineKey(item) !== key) return item;
      const product = productById.get(item.id);
      const qty = Math.max(1, Math.min(product?.stock ?? 99, item.qty + delta));
      return { ...item, qty };
    });
    writeCart(next);
  }

  function remove(key: string) {
    const next = items.filter((item) => lineKey(item) !== key);
    writeCart(next);
  }

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (enriched.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red">
          <Icon name="bag" size={56} strokeWidth={1.3} />
        </div>
        <h1 className="text-xl font-extrabold mb-2">سبد خرید شما خالی است</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          برای دیدن محصولات جذاب به فروشگاه برگردید
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        سبد خرید{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({totalQty.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {enriched.map(({ id, qty, colorId, colorName, colorHex, sizeId, sizeName, product }) => {
            const key = lineKey({ id, colorId, sizeId });
            return (
            <div
              key={key}
              className="rounded-2xl border p-3 sm:p-4 flex gap-3 sm:gap-4"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              <Link href={`/product/${product!.slug}`} className="shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden" style={{ background: "var(--bg)" }}>
                  <Image
                    src={product!.imageUrl || "/images/placeholder.svg"}
                    alt={product!.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/product/${product!.slug}`} className="block text-sm font-bold mb-1 truncate hover:text-dk-red transition-colors">
                      {product!.name}
                    </Link>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {product!.category.name}
                    </span>
                    {(colorName || sizeName) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {colorName && (
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ background: colorHex, border: "1px solid var(--border)" }}
                          />
                        )}
                        <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                          {[colorName, sizeName ? formatSizeName(sizeName) : null]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] mt-1 font-bold" style={{ color: product!.stock > 0 ? "#2ab57d" : "#ef4050" }}>
                      موجودی: {product!.stock.toLocaleString("fa-IR")} عدد
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(key)}
                    className="shrink-0 w-8 h-8 rounded-lg hover:bg-dk-red/10 hover:text-dk-red transition-colors flex items-center justify-center"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label="حذف از سبد"
                    title="حذف از سبد"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(key, 1)}
                      disabled={qty >= product!.stock}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-[var(--hover)] transition-colors disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      aria-label="افزایش تعداد"
                    >
                      +
                    </button>
                    <span className="w-8 text-center text-sm font-bold digits">{qty.toLocaleString("fa-IR")}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(key, -1)}
                      disabled={qty <= 1}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-[var(--hover)] transition-colors disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      aria-label="کاهش تعداد"
                    >
                      −
                    </button>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-sm font-bold digits">{formatPrice(product!.price * qty)}</div>
                    <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>تومان</div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="rounded-2xl border p-4 h-fit" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>مجموع کالاها</span>
            <span className="text-sm font-bold digits">{formatPrice(total)} تومان</span>
          </div>
          <div className="flex items-center justify-between mb-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>هزینه ارسال</span>
            <span className="text-dk-green font-bold">رایگان</span>
          </div>
          <div className="border-t pt-4 flex items-center justify-between mb-4" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-bold">مبلغ قابل پرداخت</span>
            <span className="text-lg font-extrabold digits">
              {formatPrice(total)} <span className="text-xs" style={{ color: "var(--text-secondary)" }}>تومان</span>
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center h-11 leading-[44px] rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ادامه فرآیند خرید
          </Link>
          <Link
            href="/"
            className="block text-center text-xs hover:text-dk-red transition-colors mt-3"
            style={{ color: "var(--text-secondary)" }}
          >
            ادامه خرید از فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
