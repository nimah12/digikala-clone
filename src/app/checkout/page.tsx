"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";
import { useUserSync } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { useCartItems } from "@/lib/cart-client";
import { formatPrice, formatSizeName } from "@/lib/format";
import Icon from "@/components/Icon";

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

export default function CheckoutPage() {
  const user = useUserSync();
  const hydrated = useHydrated();
  const items = useCartItems();
  const [products, setProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) return;
    fetch(`/api/products?ids=${items.map((i) => i.id).join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
      })
      .catch(() => setProducts([]));
  }, [hydrated, items]);

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  const subtotal = items.reduce((sum, item) => {
    const p = productById.get(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="bag" size={52} /></div>
        <h1 className="text-xl font-extrabold mb-2">سبد خرید شما خالی است</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          برای تکمیل فرآیند خرید، ابتدا محصولی به سبد اضافه کنید.
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

  // گیت ورود: اگر کاربر لاگین نکرده، ابتدا باید ثبت‌نام/ورود کند
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="lock" size={52} /></div>
        <h1 className="text-xl font-extrabold mb-2">برای ادامه خرید باید وارد شوید</h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          مبلغ سبد شما: <span className="font-bold digits" style={{ color: "var(--text)" }}>{formatPrice(subtotal)} تومان</span>
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          لطفاً ابتدا ثبت‌نام کنید یا وارد حساب خود شوید تا بتوانید سفارش خود را ثبت کنید.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ثبت‌نام
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-11 px-8 rounded-lg border text-sm font-bold transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            ورود
          </Link>
        </div>
        <Link
          href="/"
          className="block text-xs mt-6 hover:text-dk-red transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/" className="hover:text-dk-red">خانه</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-dk-red">سبد خرید</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>تسویه حساب</span>
      </nav>

      <h1 className="text-lg font-extrabold mb-4">
        تسویه حساب{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          — {user.name}
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <CheckoutForm subtotal={subtotal} />
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border p-4 h-fit" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <h2 className="text-sm font-extrabold mb-4">خلاصه سفارش</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => {
              const p = productById.get(item.id);
              if (!p) return null;
              return (
                <div key={`${item.id}-${item.colorId ?? "none"}-${item.sizeId ?? "none"}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg)" }}>
                    <Image src={p.imageUrl || "/images/placeholder.svg"} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    {(item.colorName || item.sizeName) && (
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.colorName && (
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ background: item.colorHex, border: "1px solid var(--border)" }}
                          />
                        )}
                        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          {[item.colorName, item.sizeName ? formatSizeName(item.sizeName) : null]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>× {item.qty || 1}</div>
                  </div>
                  <div className="text-xs font-bold digits shrink-0">{formatPrice(p.price * (item.qty || 1))}</div>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3 space-y-2 text-xs" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>جمع کالاها</span>
              <span className="digits">{formatPrice(subtotal)} تومان</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>هزینه ارسال</span>
              <span className="digits" style={{ color: "var(--text-secondary)" }}>در مرحله بعد</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-extrabold">
              <span>مبلغ قابل پرداخت</span>
              <span className="digits">{formatPrice(subtotal)} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
