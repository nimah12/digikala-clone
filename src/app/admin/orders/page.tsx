"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatSizeName } from "@/lib/format";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  colorName: string | null;
  sizeName: string | null;
  productName: string | null;
  productSlug: string | null;
  productImageUrl: string | null;
  product: { id: number; name: string; slug: string; imageUrl: string | null } | null;
};

type Order = {
  id: number;
  status: string;
  total: number;
  shippingName: string;
  shippingPrice: number;
  receiverName: string;
  phone: string;
  address: string;
  createdAt: string;
  user: { id: number; name: string | null; email: string } | null;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار تایید",
  processing: "در حال آماده‌سازی",
  shipped: "تحویل به پست",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#b8860b",
  processing: "#2563eb",
  shipped: "#7c3aed",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  const loadOrders = useCallback(async (statusFilter: string, query: string) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: authHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت سفارش‌ها");
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    fetch("/api/admin/me", { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) {
        setStatus("denied");
        return;
      }
      await loadOrders("all", "");
    });
  }, [loadOrders]);

  async function handleStatusChange(orderId: number, next: string) {
    setError("");
    setSavingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "به‌روزرسانی وضعیت ناموفق بود");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSavingId(null);
    }
  }

  // تایید سفارش: با کسر موجودی و ثبت فروش همراه است
  function handleApprove(orderId: number) {
    if (
      !confirm(
        "با تایید این سفارش، موجودی محصولات کسر و فروش موفق ثبت می‌شود. ادامه می‌دهی؟",
      )
    ) {
      return;
    }
    handleStatusChange(orderId, "processing");
  }

  function formatPrice(n: number): string {
    return `${n.toLocaleString("fa-IR")} تومان`;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // خروجی اکسل (فایل .xls با جدول HTML — پشتیبانی کامل فارسی و اعداد)
  function exportExcel() {
    if (!orders.length) return;
    const esc = (s: string) =>
      String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const head = ["شماره", "تاریخ", "گیرنده", "تلفن", "آدرس", "اقلام", "مبلغ (تومان)", "وضعیت"]
      .map((h) => `<th style="background:#ef4050;color:#fff;padding:8px;border:1px solid #ddd;text-align:right">${h}</th>`)
      .join("");
    const body = orders
      .map(
        (o) =>
          `<tr>` +
          [
            o.id,
            formatDate(o.createdAt),
            o.receiverName,
            o.phone,
            o.address,
            o.items.map((i) => `${i.productName ?? i.product?.name ?? "?"} ×${i.quantity}`).join(" | "),
            o.total.toLocaleString("fa-IR"),
            STATUS_LABELS[o.status] ?? o.status,
          ]
            .map(
              (c) =>
                `<td style="padding:8px;border:1px solid #ddd;text-align:right;vertical-align:top">${esc(String(c))}</td>`,
            )
            .join("") +
          `</tr>`,
      )
      .join("");
    const html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8">` +
      `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>سفارش‌ها</x:Name>` +
      `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
      `<body><table style="border-collapse:collapse;direction:rtl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob(["\uFEFF" + html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-5 py-2.5 transition-colors"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-extrabold">سفارش‌ها</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            مدیریت و به‌روزرسانی وضعیت سفارش‌های فروشگاه
          </p>
        </div>
        <button
          type="button"
          onClick={exportExcel}
          disabled={!orders.length}
          className="inline-flex items-center gap-2 text-sm font-bold rounded-xl px-4 py-2.5 border transition-colors hover:border-dk-green hover:text-dk-green disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--border)" }}
          title="خروجی اکسل از سفارش‌های نمایش‌داده‌شده"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h5" />
          </svg>
          خروجی اکسل ({orders.length.toLocaleString("fa-IR")})
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          dir="ltr"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadOrders(filter, q);
          }}
          placeholder="جستجو با شماره سفارش، نام گیرنده یا تلفن..."
          style={{ ...inputStyle, width: 260 }}
        />
        <button
          type="button"
          onClick={() => loadOrders(filter, q)}
          className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors hover:border-dk-red hover:text-dk-red"
          style={{ borderColor: "var(--border)" }}
        >
          جستجو
        </button>
        <span className="w-px bg-[var(--border)]" />
        {["all", ...Object.keys(STATUS_LABELS)].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s);
              loadOrders(s, q);
            }}
            className={`text-xs font-bold rounded-xl px-3 py-2 border transition-colors ${
              filter === s ? "bg-dk-red text-white border-dk-red" : "hover:border-dk-red hover:text-dk-red"
            }`}
            style={{ borderColor: "var(--border)", color: filter === s ? undefined : "var(--text-secondary)" }}
          >
            {s === "all" ? "همه" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center text-sm" style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          سفارشی پیدا نشد.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="text-right px-4 py-2 font-bold">شماره</th>
                  <th className="text-right px-4 py-2 font-bold">تاریخ</th>
                  <th className="text-right px-4 py-2 font-bold">گیرنده</th>
                  <th className="text-right px-4 py-2 font-bold">تلفن</th>
                  <th className="text-right px-4 py-2 font-bold">اقلام</th>
                  <th className="text-right px-4 py-2 font-bold">مبلغ</th>
                  <th className="text-right px-4 py-2 font-bold">وضعیت</th>
                  <th className="text-left px-4 py-2 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.id}>
                  <tr className="border-b last:border-b-0 align-top" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                          className="font-extrabold hover:text-dk-red transition-colors"
                          dir="ltr"
                        >
                          #{o.id.toLocaleString("fa-IR")}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {o.receiverName}
                        <div className="text-[11px] font-normal" style={{ color: "var(--text-secondary)" }}>
                          {o.user?.name ?? o.user?.email ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" dir="ltr">{o.phone}</td>
                      <td className="px-4 py-3">
                        {o.items.reduce((s, it) => s + it.quantity, 0).toLocaleString("fa-IR")}
                      </td>
                      <td className="px-4 py-3 font-bold text-dk-red">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg text-white"
                          style={{ background: STATUS_COLORS[o.status] ?? "#6b7280" }}
                        >
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {o.status === "pending" ? (
                            <button
                              type="button"
                              onClick={() => handleApprove(o.id)}
                              disabled={savingId === o.id}
                              className="text-[11px] font-bold rounded-lg px-2.5 py-1 bg-dk-green text-white hover:opacity-90 transition-colors disabled:opacity-50"
                              style={{ background: "var(--dk-green, #26a65b)" }}
                            >
                              {savingId === o.id ? "..." : "تایید سفارش"}
                            </button>
                          ) : (
                            STATUS_FLOW.includes(o.status) &&
                            STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1] && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    o.id,
                                    STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1],
                                  )
                                }
                                disabled={savingId === o.id}
                                className="text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors hover:border-dk-red hover:text-dk-red disabled:opacity-50"
                                style={{ borderColor: "var(--border)" }}
                              >
                                {savingId === o.id
                                  ? "..."
                                  : STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1]]}
                              </button>
                            )
                          )}
                          {o.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(o.id, "cancelled")}
                              disabled={savingId === o.id}
                              className="text-[11px] font-bold rounded-lg px-2.5 py-1 text-dk-red border border-dk-red/40 hover:bg-dk-red/10 transition-colors disabled:opacity-50"
                            >
                              لغو
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === o.id && (
                      <tr key={`${o.id}-items`} style={{ background: "color-mix(in srgb, var(--bg) 55%, transparent)" }}>
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid gap-2">
                            {o.items.length === 0 && (
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>اقلامی ندارد.</p>
                            )}
                            {o.items.map((it) => {
                              const name = it.product?.name ?? it.productName ?? "محصول حذف‌شده";
                              const slug = it.product?.slug ?? it.productSlug;
                              const imageUrl = it.product?.imageUrl ?? it.productImageUrl ?? "";
                              return (
                                <div key={it.id} className="flex items-center gap-3 rounded-xl border px-3 py-2" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                  {slug ? (
                                    <Link href={`/product/${slug}`} target="_blank" className="text-xs font-bold hover:text-dk-red transition-colors flex-1 min-w-0 truncate">
                                      {name}
                                    </Link>
                                  ) : (
                                    <span className="text-xs font-bold flex-1 min-w-0 truncate" style={{ color: "var(--text-secondary)" }}>
                                      {name}
                                    </span>
                                  )}
                                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                    {[it.colorName, it.sizeName ? formatSizeName(it.sizeName) : null]
                                      .filter(Boolean)
                                      .join(" • ")}
                                    {it.colorName || it.sizeName ? " • " : ""}
                                    {it.quantity.toLocaleString("fa-IR")} عدد
                                  </span>
                                  <span className="text-xs font-bold">{formatPrice(it.price)}</span>
                                </div>
                              );
                            })}
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs pt-1" style={{ color: "var(--text-secondary)" }}>
                              <span>روش ارسال: {o.shippingName}</span>
                              <span>هزینه ارسال: {formatPrice(o.shippingPrice)}</span>
                              <span className="w-full truncate">آدرس: {o.address}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
