"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserSync } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { formatPrice } from "@/lib/format";
import Icon from "@/components/Icon";
import OrderTimeline, {
  getTimelineStatus,
  getElapsedMinutes,
  useNow,
  TIMELINE_TOTAL_MINUTES,
  formatDuration,
} from "@/components/OrderTimeline";
import OrderRating from "@/components/OrderRating";

type Order = {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  shippingName: string;
  address: string;
  items: { id: number; quantity: number; product: { name: string; imageUrl: string | null } }[];
};

const DEMO_SPEED = 60;

export default function TrackOrderPage() {
  const user = useUserSync();
  const hydrated = useHydrated();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("order") || "";
    } catch {
      return "";
    }
  });
  const [speed, setSpeed] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const now = useNow();

  useEffect(() => {
    if (!hydrated || !user) return;
    const token = localStorage.getItem("dk-token") || "";
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
      })
      .catch(() => setOrders([]));
  }, [hydrated, user]);

  // سفارش منتخب از روی شماره ورودی مشتق می‌شود
  const selected = useMemo(() => {
    const num = Number(code.replace(/\D/g, ""));
    return num ? orders.find((o) => o.id === num) || null : null;
  }, [orders, code]);

  const elapsedMin = getElapsedMinutes(selected?.createdAt || "", now, speed);
  const status = getTimelineStatus(elapsedMin);
  const complete = elapsedMin >= TIMELINE_TOTAL_MINUTES;
  const remainingReal = selected
    ? TIMELINE_TOTAL_MINUTES - (now - new Date(selected.createdAt).getTime()) / 60000
    : 0;

  const deliveryInfo = useMemo(() => {
    if (!selected) return "";
    const idx = selected.address.indexOf(" — تحویل:");
    return idx >= 0 ? selected.address.slice(idx + 2) : "";
  }, [selected]);

  function track(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    if (!selected) {
      setSubmitError("سفارشی با این شماره پیدا نشد.");
      return;
    }
    setSubmitError("");
  }

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="lock" size={40} /></div>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          برای پیگیری سفارش ابتدا وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold"
        >
          ورود به حساب
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold">پیگیری سفارش</h1>
          <button
            type="button"
            onClick={() => setSpeed(speed === 1 ? DEMO_SPEED : 1)}
            className="h-8 px-3 rounded-full border text-[11px] font-bold transition-colors"
            style={
              speed > 1
                ? { background: "rgba(239,64,80,0.1)", color: "#ef4050", borderColor: "#ef4050" }
                : { background: "var(--bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }
            }
          >
            {speed > 1 ? "حالت دمو: ×۶۰ فعال است" : "تسریع دمو (×۶۰)"}
          </button>
        </div>

        <form onSubmit={track} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="شماره سفارش (مثلاً ۱۲۳۴۵)"
            className="flex-1 h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 digits"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <button
            type="submit"
            className="h-11 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            پیگیری
          </button>
        </form>

        {submitError && !selected && (
          <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
            {submitError}
          </div>
        )}

        {orders.length > 0 && !selected && (
          <div className="mt-4">
            <div className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
              یا از سفارش‌های خود انتخاب کنید:
            </div>
            <div className="flex flex-wrap gap-2">
              {orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setCode(String(o.id));
                    setSubmitError("");
                  }}
                  className="h-9 px-4 rounded-full border text-xs font-bold transition-colors hover:text-dk-red hover:border-dk-red"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  سفارش #{o.id.toLocaleString("fa-IR")}
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-8">
            <div className="rounded-xl p-4 mb-2" style={{ background: "var(--bg)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                    سفارش #{selected.id.toLocaleString("fa-IR")} — {selected.shippingName}
                  </div>
                  <div className="text-lg font-extrabold" style={{ color: complete ? "var(--dk-green, #26a65b)" : "#ef4050" }}>
                    {status.label}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {deliveryInfo || `مبلغ: ${formatPrice(selected.total)}`}
                  </div>
                  {!complete && (
                    <div className="text-[11px] mt-1 font-bold" style={{ color: "var(--text-muted)" }}>
                      {speed > 1
                        ? `مانده (دمو): ${formatDuration((TIMELINE_TOTAL_MINUTES - elapsedMin) / speed)}`
                        : `زمان تقریبی تحویل: ${formatDuration(remainingReal)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <OrderTimeline createdAt={selected.createdAt} speed={speed} />

            {complete && (
              <div className="mt-2 rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="star" size={18} className="text-dk-red" />
                  <h3 className="text-sm font-extrabold">سفارش تحویل شد! نظرتان را ثبت کنید</h3>
                </div>
                <OrderRating orderId={selected.id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
