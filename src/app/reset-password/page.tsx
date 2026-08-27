"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { useRateLimitCooldown, getRetryAfterSeconds, formatCooldown } from "@/lib/use-rate-limit";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cooldown, setCooldown } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("لینک بازیابی معتبر نیست.");
      return;
    }
    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "خطا در تغییر رمز عبور.");
        if (res.status === 429) {
          const secs = getRetryAfterSeconds(res);
          if (secs > 0) setCooldown(secs);
        }
      }
    } catch {
      setError("خطا در اتصال به سرور.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-green">
          <Icon name="check-circle" size={52} />
        </div>
        <h1 className="text-xl font-extrabold mb-2">رمز عبور تغییر کرد</h1>
        <p className="text-sm leading-7 mb-8" style={{ color: "var(--text-secondary)" }}>
          رمز عبور شما با موفقیت به‌روزرسانی شد. حالا می‌توانید با رمز جدید وارد شوید.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-6 py-3 transition-colors"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="alert-triangle" size={48} /></div>
        <h1 className="text-xl font-extrabold mb-2">لینک نامعتبر</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          لینک بازیابی رمز معتبر نیست. دوباره درخواست بازیابی دهید.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-6 py-3 transition-colors"
        >
          درخواست بازیابی رمز
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--panel)",
    color: "var(--text)",
    fontSize: 14,
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3 text-dk-red"><Icon name="key" size={44} /></div>
        <h1 className="text-xl font-extrabold mb-1">رمز عبور جدید</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          رمز عبور جدید خود را وارد کنید.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
          <div>
            <label className="block text-xs font-bold mb-1.5">رمز عبور جدید</label>
            <div className="relative">
              <input
                id="reset-password"
                name="reset-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر با حرف بزرگ و علامت"
                className="w-full pl-10"
                style={inputStyle}
              />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
              className="absolute inset-y-0 left-0 flex items-center justify-center w-10 transition-colors hover:text-dk-red"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">تکرار رمز عبور</label>
            <div className="relative">
              <input
                id="reset-confirm"
                name="reset-confirm"
                type={showConfirm ? "text" : "password"}
                dir="ltr"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="تکرار رمز عبور"
                className="w-full pl-10"
                style={inputStyle}
              />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "پنهان کردن تکرار رمز" : "نمایش تکرار رمز"}
              className="absolute inset-y-0 left-0 flex items-center justify-center w-10 transition-colors hover:text-dk-red"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon name={showConfirm ? "eye-off" : "eye"} size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-dk-red font-bold bg-dk-red/10 border border-dk-red/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {cooldown > 0 && (
          <div
            className="p-3 rounded-xl text-xs font-bold text-center"
            style={{ background: "rgba(255,152,0,0.12)", color: "#e65100", border: "1px solid rgba(255,152,0,0.4)" }}
          >
            ⏳ دکمه تغییر رمز تا {formatCooldown(cooldown)} دیگر فعال می‌شود
          </div>
        )}

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-4 py-3 transition-colors disabled:opacity-60"
        >
          {cooldown > 0
            ? `لطفاً ${formatCooldown(cooldown)} صبر کنید`
            : loading
              ? "در حال ذخیره..."
              : "تغییر رمز عبور"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center py-16 text-sm">در حال بارگذاری...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
