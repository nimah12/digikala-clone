"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminNotification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  productId: number | null;
  reviewId: number | null;
  orderId: number | null;
  read: boolean;
  createdAt: string;
};

function faTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("dk-token") || ""}` },
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setItems(data.notifications || []);
      setUnread(data.unreadCount || 0);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("click", onClick);
    };
  }, [load]);

  async function markRead(id: number) {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("dk-token") || ""}`,
        },
        body: JSON.stringify({ id }),
      });
    } catch {}
    load();
  }

  async function markAllRead() {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("dk-token") || ""}`,
        },
        body: JSON.stringify({ all: true }),
      });
    } catch {}
    load();
  }

  function openNotification(n: AdminNotification) {
    setOpen(false);
    if (n.orderId) {
      router.push(`/admin/orders?focus=${n.orderId}`);
    } else if (n.productId) {
      router.push(`/admin/products?focus=${n.productId}`);
    }
    if (!n.read) markRead(n.id);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-[var(--hover)] transition-colors"
        style={{ borderColor: "var(--border)" }}
        aria-label="اعلان‌های ادمین"
        title="اعلان‌های ادمین"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-dk-red text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread.toLocaleString("fa-IR")}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-80 rounded-2xl border shadow-xl overflow-hidden z-50"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 border-b font-bold text-sm flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <span>اعلان‌های مدیریت</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}
              >
                خواندن همه
              </button>
            )}
          </div>
          {error ? (
            <div className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              خطا در دریافت اعلان‌ها
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              اعلان جدیدی نیست.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className="flex items-start gap-3 px-4 py-2.5 border-b text-xs cursor-pointer hover:bg-[var(--hover)] transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1 ${n.read ? "" : "bg-dk-red"}`}
                    style={n.read ? { background: "var(--border)" } : {}}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold truncate">{n.title}</span>
                    {n.body && (
                      <span className="block text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {n.body}
                      </span>
                    )}
                    <span className="block text-[10px] mt-1" style={{ color: "var(--text-muted)" }} dir="ltr">
                      {faTime(n.createdAt)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
