"use client";

import { useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/lib/hydration";
import Icon from "@/components/Icon";
import { useRateLimitCooldown, getRetryAfterSeconds, formatCooldown } from "@/lib/use-rate-limit";

type Method = "email" | "phone";

export default function RegisterPage() {
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaNum, setCaptchaNum] = useState(() => Math.floor(10 + Math.random() * 89));
  const { cooldown, setCooldown } = useRateLimitCooldown();
  const hydrated = useHydrated();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("لطفاً نام خود را وارد کنید.");
      return;
    }

    if (method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("ایمیل وارد شده معتبر نیست.");
        return;
      }
    } else {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(phone.replace(/[^\d]/g, ""))) {
        setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
        return;
      }
    }

    // اعتبارسنجی رمز عبور
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("رمز عبور باید حداقل یک حرف بزرگ (A-Z) داشته باشد.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("رمز عبور باید حداقل یک کاراکتر خاص (مثل @ یا !) داشته باشد.");
      return;
    }

    // کپچا
    if (parseInt(captcha) !== captchaNum) {
      setError("پاسخ کپچا اشتباه است.");
      setCaptchaNum(Math.floor(10 + Math.random() * 89));
      setCaptcha("");
      return;
    }

    // ثبت‌نام در دیتابیس از طریق API
    fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: method === "email" ? email : null,
        phone: method === "phone" ? phone : null,
        password,
      }),
    })
      .then((res) =>
        res.json().then((data) => {
          if (data.success) {
            try {
              localStorage.setItem(
                "dk-user",
                JSON.stringify({
                  id: data.user?.id,
                  name: data.user?.name || name.trim(),
                  email: data.user?.email,
                  phone: data.user?.phone,
                }),
              );
              if (data.token) localStorage.setItem("dk-token", data.token);
              window.dispatchEvent(new Event("dk-user-changed"));
            } catch {}
            setSuccess(true);
          } else {
            setError(data.error || "خطا در ثبت‌نام. دوباره تلاش کنید.");
            if (res.status === 429) {
              const secs = getRetryAfterSeconds(res);
              if (secs > 0) setCooldown(secs);
            }
          }
        }),
      )
      .catch(() => setError("خطا در اتصال به سرور. دوباره تلاش کنید."));
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="sparkles" size={52} /></div>
        <h1 className="text-xl font-extrabold mb-2">
          ثبت‌نام با موفقیت انجام شد
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          خوش آمدید! حساب کاربری شما در دیجی‌کلون ساخته شد.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div
        className="rounded-2xl border p-6 md:p-8"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-dk-red"><Icon name="user" size={34} /></div>
          <h1 className="text-xl font-extrabold">ثبت‌نام در دیجی‌کلون</h1>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            با ایمیل یا شماره موبایل ثبت‌نام کنید
          </p>
        </div>

        {/* Method tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "var(--bg)" }}
        >
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex-1 h-9 rounded-lg text-sm font-bold transition-colors ${
              method === "email" ? "bg-white shadow text-dk-red" : ""
            }`}
            style={
              method === "email"
                ? { color: "#ef4050", background: "var(--panel)" }
                : { color: "var(--text-secondary)" }
            }
          >
            ایمیل
          </button>
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`flex-1 h-9 rounded-lg text-sm font-bold transition-colors ${
              method === "phone" ? "bg-white shadow text-dk-red" : ""
            }`}
            style={
              method === "phone"
                ? { color: "#ef4050", background: "var(--panel)" }
                : { color: "var(--text-secondary)" }
            }
          >
            شماره موبایل
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: علی محمدی"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {method === "email" ? (
            <div>
              <label className="block text-xs font-bold mb-1.5">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold mb-1.5">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر با @ و حرف بزرگ"
                className="w-full h-11 pl-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
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
            <p
              className="text-[10px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              حداقل ۶ کاراکتر، شامل یک حرف بزرگ (A-Z) و یک کاراکتر خاص (مثل @ یا
              !)
            </p>
          </div>

          {/* Simple anti-bot captcha */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg text-lg font-extrabold select-none min-w-[60px]"
              style={{
                background: "var(--bg)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                fontStyle: "italic",
                letterSpacing: "0.2em",
              }}
            >
              {hydrated ? captchaNum : "•"}
            </span>
            <input
              type="text"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="عدد را وارد کنید"
              dir="ltr"
              inputMode="numeric"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}
            >
              <Icon name="alert" size={14} className="inline-block align-middle ml-1" /> {error}
            </div>
          )}

          {cooldown > 0 && (
            <div
              className="p-3 rounded-lg text-xs font-bold text-center"
              style={{ background: "rgba(255,152,0,0.12)", color: "#e65100", border: "1px solid rgba(255,152,0,0.4)" }}
            >
              ⏳ دکمه ثبت‌نام تا {formatCooldown(cooldown)} دیگر فعال می‌شود
            </div>
          )}

          <button
            type="submit"
            disabled={cooldown > 0}
            className="w-full h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-60"
          >
            {cooldown > 0 ? `لطفاً ${formatCooldown(cooldown)} صبر کنید` : "ثبت‌نام"}
          </button>
        </form>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--text-secondary)" }}
        >
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-dk-red font-bold hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
