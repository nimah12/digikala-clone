"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserSync } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { markAllRead, useNotificationEvents } from "@/lib/notifications";
import { SafeImg } from "@/components/SafeImage";
import Icon from "@/components/Icon";

type Category = "all" | "activity" | "order" | "discount" | "magnet" | "digicoin";

type ProductLite = { id: number; name: string; slug: string; imageUrl: string | null };

type NotificationItem = {
  id: string;
  category: Exclude<Category, "all">;
  icon: "chat" | "info" | "tag" | "coin";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  date: string;
  image?: string | null;
  productSlug?: string;
};

const TABS: { key: Category; label: string }[] = [
  { key: "all", label: "همه پیام‌ها" },
  { key: "activity", label: "فعالیت‌ها" },
  { key: "order", label: "سفارش‌ها" },
  { key: "discount", label: "تخفیف‌ها" },
  { key: "magnet", label: "مگنت" },
  { key: "digicoin", label: "دیجی‌کوین" },
];

const RELATIVE_DATES = ["۷ مرداد", "۶ مرداد", "۳ مرداد", "۱ مرداد"];

function IconBubble({ icon }: { icon: NotificationItem["icon"] }) {
  const paths: Record<NotificationItem["icon"], React.ReactNode> = {
    chat: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    tag: (
      <>
        <path d="M20.59 13.41 11 3.83 3.83 11l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
    coin: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5c0-1 .9-1.8 2.5-1.8s2.5.6 2.5 1.6c0 2.2-5 1.4-5 3.8 0 1 1 1.7 2.5 1.7s2.5-.7 2.5-1.7M12 6.5v11" />
      </>
    ),
  };

  return (
    <span
      className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
      style={{ background: "rgba(249,168,37,0.12)", color: "#f9a825" }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
    </span>
  );
}

export default function NotificationsPage() {
  const user = useUserSync();
  const hydrated = useHydrated();
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
  const accountEvents = useNotificationEvents();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.push("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return;
    const qs = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
    fetch(`/api/notifications${qs}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.success ? d.data : []))
      .catch(() => setProducts([]));
  }, [user]);

  // هنگام بازدید از صفحه، همه رویدادها خوانده‌شده ثبت می‌شوند
  useEffect(() => {
    if (hydrated && user) markAllRead();
  }, [hydrated, user]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const productReviewItems: NotificationItem[] = products.map((p, i) => ({
      id: `review-${p.id}`,
      category: "order",
      icon: "chat",
      title: "کالاهای خریدتان چطور بودند؟",
      description: "ممنون می‌شویم به کیفیت کالاهای خریدتان امتیاز بدهید و دیدگاهتان را ثبت کنید.",
      actionLabel: "ثبت دیدگاه",
      actionHref: `/product/${p.slug}#reviews`,
      date: RELATIVE_DATES[i % RELATIVE_DATES.length],
      image: p.imageUrl,
      productSlug: p.slug,
    }));

    const serviceItem: NotificationItem = {
      id: "service-feedback",
      category: "activity",
      icon: "info",
      title: "خدمات دیجی‌کالا چطور بود؟",
      description: "ممنون می‌شویم به کیفیت فرآیند خرید و استفاده از دیجی‌کالا امتیاز بدهید.",
      actionLabel: "ثبت نظر",
      date: RELATIVE_DATES[3],
    };

    const discountItem: NotificationItem = {
      id: "discount-reminder",
      category: "discount",
      icon: "tag",
      title: "یک تخفیف ویژه برایتان فعال شد",
      description: "کد تخفیف اختصاصی شما تا پایان هفته روی دسته‌بندی‌های منتخب فعال است.",
      date: RELATIVE_DATES[2],
    };

    const magnetItem: NotificationItem = {
      id: "magnet-club",
      category: "magnet",
      icon: "tag",
      title: "به باشگاه مشتریان مگنت خوش آمدید",
      description: "با هر خرید امتیاز جمع کنید و از تخفیف‌های ویژه اعضای مگنت بهره‌مند شوید.",
      date: RELATIVE_DATES[1],
    };

    const digicoinItem: NotificationItem = {
      id: "digicoin-earned",
      category: "digicoin",
      icon: "coin",
      title: "دیجی‌کوین جدید دریافت کردید",
      description: "از خرید اخیرتان مقداری دیجی‌کوین به کیف‌پول شما اضافه شد.",
      date: RELATIVE_DATES[0],
    };

    const accountItems: NotificationItem[] = accountEvents.map((e) => ({
      id: e.id,
      category: "activity",
      icon: "info",
      title: e.title,
      description: e.description || "",
      date: e.time,
      ...(e.href ? { actionLabel: "پیگیری سفارش", actionHref: e.href } : {}),
    }));

    return [
      ...accountItems,
      ...productReviewItems,
      serviceItem,
      discountItem,
      magnetItem,
      digicoinItem,
    ];
  }, [products, accountEvents]);

  const filtered = activeTab === "all" ? notifications : notifications.filter((n) => n.category === activeTab);

  if (!hydrated || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-bold hover:text-dk-red transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
          بازگشت
        </Link>
        <h1 className="text-lg font-extrabold border-b-2 border-dk-red pb-1">پیام‌ها</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="h-9 px-4 rounded-full text-xs font-bold border transition-colors whitespace-nowrap"
              style={
                isActive
                  ? { background: "var(--text)", color: "var(--panel)", borderColor: "var(--text)" }
                  : { background: "var(--panel)", color: "var(--text-secondary)", borderColor: "var(--border)" }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 text-dk-red"><Icon name="bell" size={44} /></div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            پیامی در این بخش وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border divide-y" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.actionHref) router.push(n.actionHref);
              }}
              className={`flex items-start gap-4 p-4 md:p-5 ${
                n.actionHref ? "cursor-pointer hover:bg-[var(--hover)] transition-colors" : ""
              }`}
            >
              <IconBubble icon={n.icon} />

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold mb-1">{n.title}</h3>
                <p className="text-xs leading-6 mb-3" style={{ color: "var(--text-secondary)" }}>
                  {n.description}
                </p>

                {n.actionLabel && n.actionHref && (
                  <Link
                    href={n.actionHref}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center h-8 px-4 rounded-lg border text-xs font-bold hover:bg-dk-red/10 hover:text-dk-red hover:border-dk-red transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {n.actionLabel}
                  </Link>
                )}

                {n.actionLabel && !n.actionHref && (
                  <button
                    type="button"
                    disabled={feedbackSent[n.id]}
                    onClick={() => setFeedbackSent((s) => ({ ...s, [n.id]: true }))}
                    className="inline-flex items-center justify-center h-8 px-4 rounded-lg border text-xs font-bold hover:bg-dk-red/10 hover:text-dk-red hover:border-dk-red transition-colors disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {feedbackSent[n.id] ? "ثبت شد، ممنون" : n.actionLabel}
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0">
                {n.image ? (
                  <SafeImg
                    src={n.image}
                    alt={n.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    style={{ background: "var(--bg)" }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg" style={{ background: "var(--bg)" }} />
                )}
                <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  {n.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
