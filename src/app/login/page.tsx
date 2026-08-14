"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { pushEvent } from "@/lib/notifications";
import { useRateLimitCooldown, getRetryAfterSeconds, formatCooldown } from "@/lib/use-rate-limit";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { cooldown, setCooldown } = useRateLimitCooldown();
  const router = useRouter();

  async function handleDemoLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("dk-user", JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email }));
        if (data.token) localStorage.setItem("dk-token", data.token);
        window.dispatchEvent(new Event("dk-user-changed"));
        router.push("/");
      } else {
        setError(data.error || "ورود دمو ناموفق بود.");
      }
    } catch {
      setError("خطا در اتصال به سرور. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  function applyRateLimit(res: Response, fallback: string) {
    const secs = getRetryAfterSeconds(res);
    if (secs > 0) setCooldown(secs);
    setError(fallback);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("لطفاً ایمیل/شماره موبایل و رمز عبور را وارد کنید.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        // ذخیره اطلاعات کاربر برای نمایش در هدر و ثبت سفارش
        try {
          localStorage.setItem(
            "dk-user",
            JSON.stringify({ id: data.user.id, name: data.user.name || "کاربر", email: data.user.email })
          );
          if (data.token) localStorage.setItem("dk-token", data.token);
          // ثبت رویداد ورود
          pushEvent({
            type: "login",
            title: "ورود به حساب",
            description: `شما با حساب ${data.user.name || data.user.email} وارد شدید.`,
          });
          window.dispatchEvent(new Event("dk-user-changed"));
        } catch {}
        router.push("/");
      } else {
        setError(data.error || "اطلاعات وارد شده صحیح نیست.");
        if (res.status === 429) {
          applyRateLimit(res, "تعداد درخواست‌ها بیش از حد مجاز است. کمی صبر کنید و دوباره تلاش کنید.");
        }
      }
    } catch {
      setError("خطا در اتصال به سرور. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-dk-red"><Icon name="key" size={34} /></div>
          <h1 className="text-xl font-extrabold">ورود به دیجی‌کلون</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            با ایمیل یا شماره موبایل وارد شوید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">ایمیل یا شماره موبایل</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com یا ۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full h-11 pl-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
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
              ⏳ دکمه ورود تا {formatCooldown(cooldown)} دیگر فعال می‌شود
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
                ? "در حال ورود..."
                : "ورود"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>یا</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full h-11 rounded-lg border border-dk-red text-dk-red text-sm font-bold hover:bg-dk-red/5 transition-colors disabled:opacity-60"
        >
          ورود سریع دمو (بدون ثبت‌نام)
        </button>

        <div className="text-center mt-3">
          <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: "var(--text-secondary)" }}>
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
          حساب کاربری ندارید؟{" "}
          <Link href="/register" className="text-dk-red font-bold hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}