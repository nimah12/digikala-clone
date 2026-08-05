"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/user";
import { formatPrice } from "@/lib/format";

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
    product: { name: string; imageUrl: string | null; slug: string };
  }[];
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار پرداخت", color: "#f9a825" },
  processing: { label: "در حال آماده‌سازی", color: "#7879f1" },
  shipped: { label: "ارسال شده", color: "#2ab57d" },
  delivered: { label: "تحویل شده", color: "#2ab57d" },
  cancelled: { label: "لغو شده", color: "#ef4050" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    setChecked(true);
    if (!user) return;
    fetch(`/api/orders?email=${encodeURIComponent(user.email || "")}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
        else setOrders([]);
      })
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (checked && !getCurrentUser()) router.push("/login");
  }, [checked, router]);

  if (!checked) {
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
          <div className="text-5xl mb-4">📦</div>
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
            const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
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
                      <span className="text-xs flex-1">{item.product.name}</span>
                      <span className="text-xs digits" style={{ color: "var(--text-secondary)" }}>
                        {item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    ارسال: {order.shippingName}
                  </span>
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
