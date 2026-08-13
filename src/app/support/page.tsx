"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("لطفاً همه فیلدها را کامل کنید.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setTicketId(data.id);
      } else {
        setError(data.error || "خطا در ثبت تیکت.");
      }
    } catch {
      setError("خطا در اتصال به سرور.");
    } finally {
      setLoading(false);
    }
  }

  if (ticketId) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-green"><Icon name="check-circle" size={52} /></div>
        <h1 className="text-xl font-extrabold mb-2">تیکت شما ثبت شد</h1>
        <p className="text-sm leading-7 mb-2" style={{ color: "var(--text-secondary)" }}>
          تیکت شما با شماره <b className="digits">#{ticketId.toLocaleString("fa-IR")}</b> ثبت شد
          و به تیم پشتیبانی اطلاع‌رسانی شد. پاسخ از طریق ایمیل برای شما ارسال خواهد شد.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-6 py-3 mt-6 transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--panel)",
    color: "var(--text)",
    fontSize: 14,
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3 text-dk-red"><Icon name="life-buoy" size={46} /></div>
        <h1 className="text-xl font-extrabold mb-1">ثبت تیکت پشتیبانی</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          سؤالتان را بنویسید؛ تیم پشتیبانی از طریق ایمیل پاسخ می‌دهد.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">نام و نام خانوادگی</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="مثلاً علی محمدی"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">ایمیل</label>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              style={{ ...inputStyle, textAlign: "left" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">موضوع</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="مثلاً پیگیری سفارش، مرجوعی کالا..."
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">متن پیام</label>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="مشکل یا سؤال خود را با جزئیات بنویسید..."
            style={inputStyle}
          />
        </div>

        {error && (
          <p className="text-xs text-dk-red font-bold bg-dk-red/10 border border-dk-red/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-4 py-3 transition-colors disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : "ثبت تیکت"}
        </button>
        <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
          پاسخ تیم پشتیبانی به ایمیل شما ارسال می‌شود.
        </p>
      </form>
    </div>
  );
}
