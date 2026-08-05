"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/user";
import { formatPrice } from "@/lib/format";

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<{ id: number; qty: number }[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
    try {
      const raw = localStorage.getItem("dk-cart");
      const parsed: { id: number; qty: number }[] = raw ? JSON.parse(raw) : [];
      setItems(parsed);
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) return;
    fetch(`/api/products?ids=${items.map((i) => i.id).join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
      })
      .catch(() => setProducts([]));
  }, [ready, items]);

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  const subtotal = products.reduce((sum, p) => {
    const item = items.find((i) => i.id === p.id);
    return sum + p.price * (item?.qty || 1);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
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
        <div className="text-6xl mb-4">🔒</div>
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
            {products.map((p) => {
              const item = items.find((i) => i.id === p.id);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg)" }}>
                    <Image src={p.imageUrl || "/images/placeholder.svg"} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>× {item?.qty || 1}</div>
                  </div>
                  <div className="text-xs font-bold digits shrink-0">{formatPrice(p.price * (item?.qty || 1))}</div>
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
