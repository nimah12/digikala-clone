"use client";

import Link from "next/link";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  MessageSquare,
  LogOut,
  Star,
  Wallet,
  Bell,
  Clock,
  Gift,
  Settings,
  ChevronLeft,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface Order {
  id: string;
  count: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  seller: string;
  isExpress?: boolean;
}

interface UserDashboardProps {
  user: {
    name: string;
    phone: string;
    isPlusUser?: boolean;
    wallet?: number;
    digiPoints?: number;
    savedAmount?: number;
  };
  recentOrders?: Order[];
  frequentProducts?: Product[];
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav links                                                   */
/* ------------------------------------------------------------------ */
const sidebarLinks = [
  { icon: ShoppingBag, label: "سفارش‌ها", href: "/profile/orders" },
  { icon: Heart, label: "لیست‌های من", href: "/profile/wishlists" },
  { icon: MessageSquare, label: "دیدگاه‌ها و پرسش‌ها", href: "/profile/comments" },
  { icon: MapPin, label: "آدرس‌ها", href: "/profile/addresses" },
  { icon: Gift, label: "کارت‌های هدیه", href: "/profile/gift-cards" },
  { icon: Bell, label: "پیام‌ها", href: "/profile/messages" },
  { icon: Clock, label: "بازدیدهای اخیر", href: "/profile/history" },
  { icon: Settings, label: "اطلاعات حساب کاربری", href: "/profile/settings" },
  { icon: LogOut, label: "خروج از حساب کاربری", href: "/logout", isDanger: true },
];

/* ------------------------------------------------------------------ */
/*  Helper: format price                                                */
/* ------------------------------------------------------------------ */
function formatPrice(n: number) {
  return n.toLocaleString("fa-IR");
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function UserDashboard({
  user,
  recentOrders,
  frequentProducts = [],
}: UserDashboardProps) {
  const orders: Order[] = recentOrders ?? [
    {
      id: "current",
      count: 0,
      label: "جاری",
      icon: <Truck size={28} className="text-sky-400" />,
      color: "text-sky-500",
    },
    {
      id: "delivered",
      count: 13,
      label: "تحویل شده",
      icon: <Package size={28} className="text-green-500" />,
      color: "text-green-600",
    },
    {
      id: "returned",
      count: 1,
      label: "مرجوع شده",
      icon: <RefreshCw size={28} className="text-yellow-500" />,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5">
        {/* ---------------------------------------------------------------- */}
        {/*  Sidebar                                                          */}
        {/* ---------------------------------------------------------------- */}
        <aside className="w-64 shrink-0 space-y-2">
          {/* User Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-1">
              <button className="text-gray-400 hover:text-blue-500 transition-colors">
                <Settings size={16} />
              </button>
              <div className="text-right">
                <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {sidebarLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 text-sm transition-colors group
                  ${link.isDanger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
                  ${i !== sidebarLinks.length - 1 ? "border-b border-gray-50" : ""}
                `}
              >
                <link.icon
                  size={17}
                  className={
                    link.isDanger
                      ? "text-red-400"
                      : "text-gray-400 group-hover:text-red-500 transition-colors"
                  }
                />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/*  Main Content                                                     */}
        {/* ---------------------------------------------------------------- */}
        <main className="flex-1 space-y-4">
          {/* Orders Summary */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <Link
                href="/profile/orders"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                مشاهده همه
              </Link>
              <h2 className="font-bold text-gray-800 text-sm">سفارش‌های من</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/profile/orders?status=${o.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {o.icon}
                  <span className={`text-lg font-bold ${o.color}`}>
                    {o.count} سفارش
                  </span>
                  <span className="text-xs text-gray-500">{o.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Wallet & Points */}
          <div className="grid grid-cols-2 gap-4">
            {/* Wallet */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <Link
                  href="/profile/wallet"
                  className="text-xs text-blue-500 hover:underline"
                >
                  افزایش موجودی
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">کیف پول</span>
                  <Wallet size={18} className="text-gray-400" />
                </div>
              </div>
              <p className="text-left text-gray-400 text-sm font-bold">
                {user.wallet !== undefined ? (
                  <span className="text-gray-800">
                    {formatPrice(user.wallet)}{" "}
                    <span className="text-xs font-normal">تومن</span>
                  </span>
                ) : (
                  <span className="text-gray-300">- ریال</span>
                )}
              </p>
            </div>

            {/* DigiPoints */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <Link
                  href="/profile/digipoints"
                  className="text-xs text-blue-500 hover:underline"
                >
                  مشاهده ماموریت‌ها
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">دیجی‌کوین</span>
                  <Star size={18} className="text-amber-400" fill="currentColor" />
                </div>
              </div>
              <p className="text-gray-300 text-sm font-bold">
                {user.digiPoints !== undefined
                  ? `${formatPrice(user.digiPoints)} تومن`
                  : "۰ تومن"}
              </p>
            </div>
          </div>

          {/* Plus Banner */}
          {!user.isPlusUser && user.savedAmount !== undefined && (
            <div className="bg-gradient-to-l from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4 flex items-center justify-between">
              <Link
                href="/plus"
                className="text-sm font-bold text-purple-600 flex items-center gap-1 hover:text-purple-800 transition-colors"
              >
                خرید اشتراک
                <Star size={14} fill="currentColor" className="text-amber-400" />
              </Link>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">
                  {formatPrice(user.savedAmount)} تومان را از دست دادید!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  با اشتراک پلاس می‌توانستید در ۴ خرید آخرتان این مبلغ را صرفه‌جویی کنید.
                </p>
              </div>
            </div>
          )}

          {/* Frequent Products */}
          {frequentProducts.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-4 text-right">
                خریدهای پرتکرار شما
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {frequentProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="shrink-0 w-44 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all p-3 flex flex-col gap-2"
                  >
                    <div className="relative">
                      {p.discount && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {p.discount}٪
                        </span>
                      )}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-28 object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-700 text-right leading-5 line-clamp-2">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 justify-end">
                      <span>دیجی‌کالا</span>
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    </div>
                    <div className="text-right">
                      {p.originalPrice && (
                        <p className="text-[10px] text-gray-300 line-through">
                          {formatPrice(p.originalPrice)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-800">
                        {formatPrice(p.price)}{" "}
                        <span className="text-xs font-normal text-gray-500">تومن</span>
                      </p>
                    </div>
                    <button className="w-full border border-gray-200 hover:border-red-400 hover:text-red-500 text-gray-600 text-xs py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <ShoppingBag size={12} />
                      اضافه به سبد
                    </button>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
