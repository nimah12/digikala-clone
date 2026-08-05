"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { getCurrentUser } from "@/lib/user";

export type ShippingMethod = {
  id: string;
  name: string;
  desc: string;
  price: number;
  eta: string;
  icon: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "express", name: "پیک گنجه", desc: "ارسال در همان روز در تهران", price: 60000, eta: "امروز", icon: "🛵" },
  { id: "tipax", name: "تیپاکس", desc: "ارسال سریع به سراسر کشور", price: 45000, eta: "۱ تا ۲ روز", icon: "🚚" },
  { id: "post", name: "پست پیشتاز", desc: "ارسال اقتصادی با پست", price: 30000, eta: "۳ تا ۵ روز", icon: "📮" },
];

export default function CheckoutForm({ subtotal }: { subtotal: number }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState<ShippingMethod>(SHIPPING_METHODS[1]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "تهران" });
  const router = useRouter();

  const total = subtotal + shipping.price;

  function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return;
    setStep(3);
  }

  async function saveOrder() {
    const user = getCurrentUser();
    if (!user?.email) return;
    try {
      const cart = localStorage.getItem("dk-cart");
      const items: { id: number; qty: number }[] = cart ? JSON.parse(cart) : [];
      const productIds: number[] = [];
      const quantities: number[] = [];
      for (const item of items) {
        productIds.push(item.id);
        quantities.push(item.qty || 1);
      }
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          total,
          shippingName: shipping.name,
          shippingPrice: shipping.price,
          receiverName: form.name,
          phone: form.phone,
          address: `${form.city}، ${form.address}`,
          productIds,
          quantities,
        }),
      });
      localStorage.removeItem("dk-cart");
      window.dispatchEvent(new Event("dk-cart-changed"));
    } catch {}
  }

  return (
    <div className="rounded-2xl border p-4 md:p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { n: 1, label: "روش ارسال" },
          { n: 2, label: "اطلاعات گیرنده" },
          { n: 3, label: "پرداخت" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= s.n ? "bg-dk-red text-white" : "border"
              }`}
              style={step < s.n ? { borderColor: "var(--border)", color: "var(--text-secondary)" } : {}}
            >
              {step > s.n ? "✓" : s.n.toLocaleString("fa-IR")}
            </div>
            <span className={`text-xs ${step >= s.n ? "font-bold" : ""}`} style={{ color: step >= s.n ? "var(--text)" : "var(--text-secondary)" }}>
              {s.label}
            </span>
            {i < 2 && <div className="flex-1 h-px" style={{ background: "var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: shipping */}
      {step === 1 && (
        <div>
          <h2 className="text-sm font-extrabold mb-4">روش ارسال سفارش را انتخاب کنید</h2>
          <div className="space-y-3">
            {SHIPPING_METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  shipping.id === m.id ? "ring-2 ring-dk-red" : ""
                }`}
                style={{ borderColor: shipping.id === m.id ? "var(--dk-red, #ef4050)" : "var(--border)" }}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shipping.id === m.id}
                  onChange={() => setShipping(m)}
                  className="accent-[#ef4050]"
                />
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{m.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{m.desc}</div>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-sm font-bold digits">{formatPrice(m.price)}</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.eta}</div>
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-5 w-full h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ادامه و ثبت اطلاعات
          </button>
        </div>
      )}

      {/* Step 2: receiver info */}
      {step === 2 && (
        <form onSubmit={submitInfo}>
          <h2 className="text-sm font-extrabold mb-4">اطلاعات گیرنده</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">نام و نام خانوادگی</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثلاً: علی محمدی"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">شماره موبایل</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">استان و شهر</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">آدرس کامل</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="نشانی پستی کامل گیرنده..."
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-5 rounded-lg border text-sm font-bold transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              بازگشت
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
            >
              ادامه و پرداخت
            </button>
          </div>
        </form>
      )}

      {/* Step 3: fake payment */}
      {step === 3 && (
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-lg font-extrabold mb-2">اتصال به درگاه پرداخت</h2>
          <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            مبلغ قابل پرداخت:{" "}
            <span className="font-bold digits" style={{ color: "var(--text)" }}>
              {formatPrice(total)} تومان
            </span>
          </p>

          <div
            className="mt-5 p-4 rounded-xl border text-sm leading-7 text-right"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <span className="text-lg mr-1">⚠️</span>
            متأسفانه در حال حاضر زیرساخت‌های پرداخت فعال نمی‌باشد. ما در تلاش هستیم تا در
            اسرع وقت به موضوع رسیدگی کنیم. لطفاً سفارش خود را در زمان دیگری تکمیل کنید.
            <br />
            از صبوری شما سپاسگزاریم 🙏
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-5 rounded-lg border text-sm font-bold transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              بازگشت
            </button>
            <button
              type="button"
              onClick={async () => {
                await saveOrder();
                router.push("/orders");
              }}
              className="flex-1 h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
            >
              تکمیل و مشاهده سفارش
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
