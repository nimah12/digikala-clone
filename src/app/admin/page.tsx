"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  productCount: number;
  categoryCount: number;
  subcategoryCount: number;
  groupCount: number;
  lowStock: number;
  userCount: number;
  orderCount: number;
  revenue: number;
  reviewCount: number;
};

function formatPrice(n: number): string {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیون`
    : `${n.toLocaleString("fa-IR")} تومان`;
}

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">(
    "loading",
  );
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          setStatus("denied");
          return;
        }
        const data = await res.json();
        setStats(data.stats || null);
        setStatus("ready");
      })
      .catch(() => setStatus("ready"));
  }, []);

  if (status === "loading") {
    return <p className="text-sm py-16 text-center">در حال بارگذاری...</p>;
  }

  if (status === "denied") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          برای ورود به پنل مدیریت باید با حساب ادمین وارد شوید.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-5 py-2.5 transition-colors"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  const cards = [
    { label: "محصولات", value: stats?.productCount ?? 0, href: "/admin/products" },
    { label: "دسته‌های اصلی", value: stats?.categoryCount ?? 0, href: "/admin/categories" },
    { label: "ساب‌دسته‌ها", value: stats?.subcategoryCount ?? 0, href: "/admin/categories" },
    { label: "گروه‌های منو", value: stats?.groupCount ?? 0, href: "/admin/groups" },
    { label: "سفارش‌ها", value: stats?.orderCount ?? 0, href: "/admin/orders" },
    { label: "کاربران", value: stats?.userCount ?? 0, href: "/admin/users" },
    { label: "نظرات", value: stats?.reviewCount ?? 0, href: "/admin/products" },
    { label: "موجودی کم", value: stats?.lowStock ?? 0, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-lg font-extrabold mb-1">داشبورد مدیریت</h1>
      <p className="text-xs mb-6" style={{ color: "var(--text-secondary)" }}>
        مدیریت گروه‌ها، دسته‌بندی‌ها، ساب‌دسته‌ها، محصولات، سفارش‌ها و کاربران
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border p-4 hover:border-dk-red transition-colors"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            <div className="text-2xl font-extrabold text-dk-red mb-1">
              {card.value.toLocaleString("fa-IR")}
            </div>
            <div className="text-xs font-bold">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border p-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="text-[11px] font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
            مجموع فروش (بدون سفارش‌های لغو شده)
          </div>
          <div className="text-2xl font-extrabold text-dk-red">{formatPrice(stats?.revenue ?? 0)}</div>
        </div>
        <Link href="/admin/menu" className="rounded-2xl border p-5 hover:border-dk-red transition-colors" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="text-[11px] font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
            وضعیت مگامنو
          </div>
          <div className="text-sm font-extrabold mb-1">
            {stats?.groupCount ?? 0} گروه • {stats?.categoryCount ?? 0} دسته • {stats?.subcategoryCount ?? 0} ساب‌دسته
          </div>
          <div className="text-xs text-dk-red font-bold">پیش‌نمایش زنده مگامنو ←</div>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border p-5 text-sm leading-7"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h2 className="font-extrabold mb-2">نکته درباره محدودیت ISR ورسل</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          صفحات فروشگاه (خانه، دسته‌بندی، محصول و لیست‌ها) به‌صورت کاملاً داینامیک
          رندر می‌شوند و هیچ تماس revalidate/ISR مصرف نمی‌شود؛ بنابراین تغییرات پنل
          ادمین روی پلن رایگان ورسل، هم‌زمان و بدون محدودیت روی سایت اعمال می‌شود.
        </p>
      </div>
    </div>
  );
}
