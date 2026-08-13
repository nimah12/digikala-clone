"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

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
          <input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="حداقل ۶ کاراکتر با حرف بزرگ و علامت"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">تکرار رمز عبور</label>
          <input
            type="password"
            dir="ltr"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="تکرار رمز عبور"
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
          {loading ? "در حال ذخیره..." : "تغییر رمز عبور"}
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
