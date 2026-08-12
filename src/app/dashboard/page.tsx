"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCurrentUser, useUserSync } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { pushEvent } from "@/lib/notifications";
import Icon from "@/components/Icon";

export default function DashboardPage() {
  const user = useUserSync();
  const hydrated = useHydrated();
  const router = useRouter();

  // اگر لاگین نکرده، به صفحه ورود برو
  useEffect(() => {
    if (hydrated && !user) {
      router.push("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="shimmer rounded w-48 h-6 mx-auto mb-4" style={{ background: "var(--bg)" }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  function handleLogout() {
    // ثبت رویداد خروج
    pushEvent({
      type: "logout",
      title: "خروج از حساب",
      description: "از حساب کاربری خود خارج شدید.",
    });
    clearCurrentUser();
    router.push("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-extrabold mb-6">
        سلام {user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Profile card */}
        <Link
          href="/profile"
          className="group rounded-2xl border p-5 hover:shadow-lg transition-shadow"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-center mb-3 text-dk-red"><Icon name="user" size={28} /></div>
          <h2 className="font-bold text-sm mb-1">پروفایل من</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            مشاهده و ویرایش اطلاعات حساب
          </p>
        </Link>

        {/* Orders card */}
        <Link
          href="/orders"
          className="group rounded-2xl border p-5 hover:shadow-lg transition-shadow"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-center mb-3 text-dk-red"><Icon name="package" size={28} /></div>
          <h2 className="font-bold text-sm mb-1">سفارش‌های من</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            تاریخچه سفارش‌ها و پیگیری
          </p>
        </Link>

        {/* Cart card */}
        <Link
          href="/cart"
          className="group rounded-2xl border p-5 hover:shadow-lg transition-shadow"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-center mb-3 text-dk-red"><Icon name="bag" size={28} /></div>
          <h2 className="font-bold text-sm mb-1">سبد خرید</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            ادامه خرید و تسویه حساب
          </p>
        </Link>

        {/* Notifications card */}
        <Link
          href="/notifications"
          className="group rounded-2xl border p-5 hover:shadow-lg transition-shadow"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-center mb-3 text-dk-red"><Icon name="chat" size={28} /></div>
          <h2 className="font-bold text-sm mb-1">پیام‌ها</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            نظرسنجی‌ها و اعلان‌های حساب
          </p>
        </Link>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border p-5 mb-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h2 className="font-bold text-sm mb-4">اطلاعات حساب</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--text-secondary)" }}>نام</span>
            <span className="font-bold">{user.name}</span>
          </div>
          {user.email && (
            <div className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--text-secondary)" }}>ایمیل</span>
              <span className="font-bold" dir="ltr">{user.email}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold border hover:bg-dk-red/10 hover:text-dk-red transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
