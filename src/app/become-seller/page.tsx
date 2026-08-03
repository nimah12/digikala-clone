"use client";

import { useState } from "react";

export default function BecomeSellerPage() {
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-xl font-extrabold mb-2">درخواست شما ثبت شد</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          تیم فروشندگان دیجی‌کلون به‌زودی با شما تماس خواهد گرفت.
        </p>
        <button
          onClick={() => setSent(false)}
          className="h-10 px-6 rounded-lg border text-sm font-bold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h1 className="text-xl font-extrabold mb-2">فروشنده شوید</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          کالاهای خود را به میلیون‌ها کاربر دیجی‌کلون عرضه کنید.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "📈", label: "فروش بیشتر" },
            { icon: "🤝", label: "پشتیبانی کامل" },
            { icon: "💵", label: "تسویه هفتگی" },
          ].map((b) => (
            <div key={b.label} className="rounded-xl p-4 text-center" style={{ background: "var(--bg)" }}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-[11px] font-bold">{b.label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">نام فروشگاه</label>
              <input
                type="text"
                required
                placeholder="نام فروشگاه یا برند شما"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">شماره تماس</label>
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">دسته کالایی</label>
            <select
              className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <option>موبایل و کالای دیجیتال</option>
              <option>خانه و آشپزخانه</option>
              <option>زیبایی و سلامت</option>
              <option>ورزش و سفر</option>
              <option>سایر</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ثبت درخواست
          </button>
        </form>
      </div>
    </div>
  );
}
