"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("لطفاً ایمیل/شماره موبایل و رمز عبور را وارد کنید.");
      return;
    }
    // در دمو، ورود به سادگی انجام می‌شود
    setError("");
    alert("ورود موفق! (نسخه دمو)");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ورود
          </button>
        </form>

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
