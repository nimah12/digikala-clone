"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
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
} from "@/components/OrderTimeline";
import OrderRating from "@/components/OrderRating";

type Order = {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  shippingName: string;
  shippingPrice: number;
  receiverName: string;
  phone: string;
  address: string;
  items: {
    id: number;
    quantity: number;
    price: number;
    colorName?: string | null;
    colorHex?: string | null;
    sizeName?: string | null;
    productName?: string | null;
    productSlug?: string | null;
    productImageUrl?: string | null;
    product: { name: string; imageUrl: string | null; slug: string } | null;
  }[];
};

const DEMO_SPEED = 60;

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useUserSync();
  const hydrated = useHydrated();
  const router = useRouter();
  const now = useNow();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("dk-token");
    fetch("/api/orders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setOrders(d.success ? d.data : []))
      .catch(() => setOrders([]));
  }, [user]);

  const order = useMemo(() => {
    const num = Number(id.replace(/\D/g, ""));
    if (!orders || !num) return null;
    return orders.find((o) => o.id === num) || null;
  }, [orders, id]);

  const deliveryInfo = useMemo(() => {
    if (!order) return "";
    const idx = order.address.indexOf(" — تحویل:");
    return idx >= 0 ? order.address.slice(idx + 2) : "";
  }, [order]);

  useEffect(() => {
    if (hydrated && !user) router.push("/login");
  }, [hydrated, user, router]);

  if (!hydrated || orders === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-dk-red"><Icon name="package" size={44} /></div>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>سفارش موردنظر پیدا نشد.</p>
        <Link href="/orders" className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold">
          بازگشت به سفارش‌ها
        </Link>
      </div>
    );
  }

  const elapsedMin = getElapsedMinutes(order.createdAt, now, speed);
  const status = getTimelineStatus(elapsedMin);
  const complete = elapsedMin >= TIMELINE_TOTAL_MINUTES;
  const remainingReal = TIMELINE_TOTAL_MINUTES - (now - new Date(order.createdAt).getTime()) / 60000;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/dashboard" className="hover:text-dk-red">پنل کاربری</Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-dk-red">سفارش‌های من</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>سفارش #{order.id.toLocaleString("fa-IR")}</span>
      </nav>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold">سفارش #{order.id.toLocaleString("fa-IR")}</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${status.color}1a`, color: status.color }}>
            {status.label}
          </span>
        </div>
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

      {/* وضعیت گرافیکی سفارش */}
      <div className="rounded-2xl border p-5 md:p-6 mb-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="text-sm font-extrabold">وضعیت سفارش</div>
          {!complete && (
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {speed > 1
                ? `مانده (دمو): ${Math.max(0, TIMELINE_TOTAL_MINUTES - elapsedMin) / speed >= 60 ? `${Math.floor((TIMELINE_TOTAL_MINUTES - elapsedMin) / speed / 60)} ساعت` : `${Math.max(0, Math.round((TIMELINE_TOTAL_MINUTES - elapsedMin) / speed))} دقیقه`}`
                : `زمان تقریبی تحویل: ${remainingReal >= 60 ? `${Math.floor(remainingReal / 60)} ساعت و ${Math.round(remainingReal % 60)} دقیقه` : `${Math.round(remainingReal)} دقیقه`}`}
            </div>
          )}
        </div>
        <OrderTimeline createdAt={order.createdAt} speed={speed} />
      </div>

      {/* جزئیات سفارش */}
      <div className="rounded-2xl border p-5 md:p-6 space-y-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-extrabold">کالاهای سفارش</h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            const name = item.product?.name ?? item.productName ?? "محصول حذف‌شده";
            const slug = item.product?.slug ?? item.productSlug;
            const imageUrl = item.product?.imageUrl ?? item.productImageUrl ?? "/images/placeholder.svg";
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-12 h-12 rounded-lg object-cover"
                  style={{ background: "var(--bg)" }}
                />
                <span className="text-sm flex-1 flex items-center gap-1.5">
                  {name}
                  {(item.colorName || item.sizeName) && (
                    <span className="inline-flex items-center gap-1">
                      {item.colorName && (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ background: item.colorHex ?? undefined, border: "1px solid var(--border)" }}
                        />
                      )}
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        ({[item.colorName, item.sizeName].filter(Boolean).join(" • ")})
                      </span>
                    </span>
                  )}
                </span>
                <span className="text-xs digits" style={{ color: "var(--text-secondary)" }}>
                  {item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.price)}
                </span>
              </>
            );
            return slug ? (
              <Link key={item.id} href={`/product/${slug}`} className="flex items-center gap-3 hover:text-dk-red transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={item.id} className="flex items-center gap-3">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>گیرنده</span>
            <span className="font-bold">{order.receiverName}</span>
          </div>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>شماره تماس</span>
            <span className="digits">{order.phone}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>آدرس</span>
            <span className="leading-6">{order.address}</span>
          </div>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>روش ارسال</span>
            <span>{order.shippingName}</span>
          </div>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>هزینه ارسال</span>
            <span className={order.shippingPrice === 0 ? "font-bold text-dk-green" : "digits"}>
              {order.shippingPrice === 0 ? "رایگان" : formatPrice(order.shippingPrice)}
            </span>
          </div>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>روز و بازه تحویل</span>
            <span>{deliveryInfo || "—"}</span>
          </div>
          <div>
            <span className="block mb-1 font-bold" style={{ color: "var(--text-secondary)" }}>تاریخ ثبت</span>
            <span>{new Date(order.createdAt).toLocaleDateString("fa-IR")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-extrabold">مبلغ کل</span>
          <span className="text-base font-extrabold digits text-dk-red">
            {formatPrice(order.total)} <span className="text-[10px] font-normal" style={{ color: "var(--text-secondary)" }}>تومان</span>
          </span>
        </div>
      </div>

      {/* امتیازدهی پس از تحویل */}
      {complete && (
        <div className="mt-4 rounded-2xl border p-5 md:p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="star" size={18} className="text-dk-red" />
            <h3 className="text-sm font-extrabold">سفارش تحویل شد! نظرتان را ثبت کنید</h3>
          </div>
          <OrderRating orderId={order.id} />
        </div>
      )}
    </div>
  );
}
