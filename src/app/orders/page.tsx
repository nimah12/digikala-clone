"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserSync } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { formatPrice } from "@/lib/format";
import Icon from "@/components/Icon";
import { getTimelineStatus, getElapsedMinutes, useNow } from "@/components/OrderTimeline";

type Order = {
  id: number;
  status: string;
  total: number;
  shippingName: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    price: number;
    colorName?: string | null;
    colorHex?: string | null;
    product: { name: string; imageUrl: string | null; slug: string };
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const user = useUserSync();
  const hydrated = useHydrated();
  const router = useRouter();
  const now = useNow();

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("dk-token");
    fetch(`/api/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
        else setOrders([]);
      })
      .catch(() => setOrders([]));
  }, [user]);

  useEffect(() => {
    if (hydrated && !user) router.push("/login");
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/dashboard" className="hover:text-dk-red">پنل کاربری</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>سفارش‌های من</span>
      </nav>

      <h1 className="text-lg font-extrabold mb-6">سفارش‌های من</h1>

      {orders === null ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 text-dk-red"><Icon name="package" size={44} /></div>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            هنوز سفارشی ثبت نکرده‌اید.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            شروع خرید
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getTimelineStatus(getElapsedMinutes(order.createdAt, now, 1));
            return (
              <div key={order.id} className="rounded-2xl border p-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold">سفارش #{order.id}</span>
                    <span className="text-[11px] mr-2" style={{ color: "var(--text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: `${status.color}1a`, color: status.color }}>
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <Link key={item.id} href={`/product/${item.product.slug}`} className="flex items-center gap-3 hover:text-dk-red transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.imageUrl || "/images/placeholder.svg"}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        style={{ background: "var(--bg)" }}
                      />
                      <span className="text-xs flex-1 flex items-center gap-1.5">
                        {item.product.name}
                        {item.colorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ background: item.colorHex ?? undefined, border: "1px solid var(--border)" }}
                            />
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              ({item.colorName})
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="text-xs digits" style={{ color: "var(--text-secondary)" }}>
                        {item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border text-xs font-bold transition-colors hover:text-dk-red hover:border-dk-red"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <Icon name="box" size={14} />
                    جزئیات و پیگیری سفارش
                  </Link>
                  <span className="text-sm font-extrabold digits">
                    {formatPrice(order.total)} <span className="text-[10px] font-normal" style={{ color: "var(--text-secondary)" }}>تومان</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
