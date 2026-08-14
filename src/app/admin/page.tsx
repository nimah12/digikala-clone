"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import GoldPriceChart from "@/components/GoldPriceChart";

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

type HistPoint = {
  t: number;
  gold18k: number | null;
  sekkeh: number | null;
  rob: number | null;
  nim: number | null;
  usd: number | null;
};

const faDT = (t: number) =>
  new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(t));

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">(
    "loading",
  );
  const [stats, setStats] = useState<Stats | null>(null);

  // تاریخچه قیمت طلا
  const [historyPoints, setHistoryPoints] = useState<HistPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // همگام‌سازی دستی قیمت طلا
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    updatedAt: string | null;
    gold18k: number | null;
    sekkeh: number | null;
    rob: number | null;
    nim: number | null;
    usd: number | null;
  } | null>(null);
  const [syncError, setSyncError] = useState("");

  async function handleGoldSync() {
    setSyncing(true);
    setSyncError("");
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/gold-sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncError(data.error || "خطا در همگام‌سازی قیمت طلا");
        return;
      }
      setSyncResult(data);
    } catch {
      setSyncError("خطا در ارتباط با سرور");
    } finally {
      setSyncing(false);
    }
  }

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

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) return;
    fetch("/api/admin/gold-history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHistoryPoints(Array.isArray(data.points) ? data.points : []);
      })
      .catch(() => setHistoryError("خطا در خواندن تاریخچه قیمت طلا"))
      .finally(() => setHistoryLoading(false));
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

      {/* همگام‌سازی دستی قیمت طلا */}
      <div className="mt-6 rounded-2xl border p-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-extrabold mb-1 flex items-center gap-2">
              <Icon name="coins" size={18} className="text-dk-amber" />
              قیمت لحظه‌ای طلا و سکه
            </h2>
            <p className="text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
              قیمت‌ها به‌صورت خودکار هر ۸ ساعت از ناواسان بروزرسانی می‌شوند.
              با این دکمه می‌توانی بدون انتظار، همین الان همگام‌سازی کنی.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGoldSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-dk-red text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-dk-red-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {syncing ? (
              <>
                <span className="loading-spinner inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                در حال همگام‌سازی...
              </>
            ) : (
              <>همگام‌سازی دستی قیمت طلا</>
            )}
          </button>
        </div>

        {syncError && <p className="text-xs mt-3 text-dk-red font-bold">{syncError}</p>}

        {syncResult && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { label: "طلای ۱۸ عیار", value: syncResult.gold18k },
              { label: "سکه امامی", value: syncResult.sekkeh },
              { label: "ربع سکه", value: syncResult.rob },
              { label: "نیم سکه", value: syncResult.nim },
              { label: "دلار", value: syncResult.usd },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                <div className="text-[10px] font-bold mb-0.5" style={{ color: "var(--text-secondary)" }}>{item.label}</div>
                <div className="text-xs font-extrabold digits">{item.value ? formatPrice(item.value) : "—"}</div>
              </div>
            ))}
          </div>
        )}

        {syncResult && (
          <p className="text-xs mt-3 font-bold text-dk-green">
            ✓ {syncResult.synced.toLocaleString("fa-IR")} محصول به‌روزرسانی شد
            {syncResult.updatedAt ? ` — آخرین بروزرسانی: ${syncResult.updatedAt}` : ""}
          </p>
        )}
      </div>

      {/* تاریخچه قیمت طلا */}
      <div className="mt-6 rounded-2xl border p-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="font-extrabold flex items-center gap-2">
            <Icon name="chart-line" size={18} className="text-dk-amber" />
            نمودار و تاریخچه قیمت طلا و سکه
          </h2>
          <span className="text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>
            {historyLoading
              ? "در حال بارگذاری..."
              : `${historyPoints.length.toLocaleString("fa-IR")} نقطه ثبت‌شده`}
          </span>
        </div>

        {/* نمودار قیمت طلا — با کنترل بازه (۷/۳۰/۹۰ روز) */}
        {!historyLoading && historyPoints.length > 1 && (
          <div className="mb-5">
            <GoldPriceChart history={historyPoints} />
          </div>
        )}

        {historyError && (
          <p className="text-xs text-dk-red font-bold mb-2">{historyError}</p>
        )}

        {historyPoints.length > 0 ? (
          <div
            className="overflow-auto rounded-xl border max-h-[360px]"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full text-xs min-w-[680px]">
              <thead>
                <tr
                  className="text-right"
                  style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
                >
                  {["#", "تاریخ", "طلای ۱۸ عیار", "سکه امامی", "نیم سکه", "ربع سکه"].map(
                    (h) => (
                      <th key={h} className="px-3 py-2.5 font-bold sticky top-0 whitespace-nowrap" style={{ background: "var(--bg)" }}>
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {historyPoints.map((p, i) => {
                  const prev = historyPoints[i - 1];
                  const cell = (v: number | null, prevV: number | null | undefined) => {
                    if (v === null || v === undefined) {
                      return (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      );
                    }
                    let tone: string | undefined;
                    let arrow: string | null = null;
                    if (prevV !== null && prevV !== undefined && prevV !== v) {
                      arrow = v > prevV ? "▲" : "▼";
                      tone =
                        v > prevV
                          ? "var(--color-dk-green, #2ab57d)"
                          : "var(--color-dk-red, #ef4050)";
                    }
                    return (
                      <span className="digits whitespace-nowrap" style={{ color: tone }}>
                        {arrow && <span className="text-[9px] ml-0.5">{arrow}</span>}
                        {v.toLocaleString("fa-IR")}
                      </span>
                    );
                  };
                  return (
                    <tr key={p.t} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-3 py-2 digits" style={{ color: "var(--text-muted)" }}>
                        {historyPoints.length - i}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap font-bold">{faDT(p.t)}</td>
                      <td className="px-3 py-2">{cell(p.gold18k, prev?.gold18k)}</td>
                      <td className="px-3 py-2">{cell(p.sekkeh, prev?.sekkeh)}</td>
                      <td className="px-3 py-2">{cell(p.nim, prev?.nim)}</td>
                      <td className="px-3 py-2">{cell(p.rob, prev?.rob)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          !historyLoading && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              هنوز نقطه‌ای ثبت نشده — با همگام‌سازی دستی یا بروزرسانی خودکار، تاریخچه ساخته می‌شود.
            </p>
          )
        )}
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
