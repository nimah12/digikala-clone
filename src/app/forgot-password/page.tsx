"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useRateLimitCooldown, getRetryAfterSeconds, formatCooldown } from "@/lib/use-rate-limit";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cooldown, setCooldown } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("لطفاً ایمیل یا شماره موبایل خود را وارد کنید.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "خطا در ارسال. دوباره تلاش کنید.");
        if (res.status === 429) {
          const secs = getRetryAfterSeconds(res);
          if (secs > 0) setCooldown(secs);
        }
      }
    } catch {
      setError("خطا در اتصال به سرور. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="mail" size={52} /></div>
        <h1 className="text-xl font-extrabold mb-2">لینک بازیابی رمز ارسال شد</h1>
        <p className="text-sm leading-7 mb-8" style={{ color: "var(--text-secondary)" }}>
          اگر این ایمیل/شماره در سیستم ثبت شده باشد، لینک بازیابی رمز برای شما ارسال شده است.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
        >
          بازگشت به ورود
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-dk-red"><Icon name="key" size={34} /></div>
          <h1 className="text-xl font-extrabold">فراموشی رمز عبور</h1>
          <p className="text-xs mt-1 leading-5" style={{ color: "var(--text-secondary)" }}>
            ایمیل یا شماره موبایل خود را وارد کنید تا
            <br />
            لینک بازیابی رمز برای شما ارسال شود.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">ایمیل یا شماره موبایل</label>
            <input
              id="forgot-identifier"
              name="forgot-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com یا ۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
              <Icon name="alert" size={14} className="inline-block align-middle ml-1" /> {error}
            </div>
          )}

          {cooldown > 0 && (
            <div
              className="p-3 rounded-lg text-xs font-bold text-center"
              style={{ background: "rgba(255,152,0,0.12)", color: "#e65100", border: "1px solid rgba(255,152,0,0.4)" }}
            >
              ⏳ دکمه ارسال تا {formatCooldown(cooldown)} دیگر فعال می‌شود
            </div>
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-60"
          >
            {cooldown > 0
              ? `لطفاً ${formatCooldown(cooldown)} صبر کنید`
              : loading
                ? "در حال ارسال..."
                : "ارسال لینک بازیابی"}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
          رمزتان را به یاد آوردید؟{" "}
          <Link href="/login" className="text-dk-red font-bold hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
