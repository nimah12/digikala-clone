import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "نحوه ثبت سفارش" };

const STEPS = [
  { icon: "🔍", title: "جستجوی محصول", desc: "محصول موردنظر خود را با جستجو یا از دسته‌بندی‌ها پیدا کنید." },
  { icon: "🛒", title: "افزودن به سبد", desc: "روی دکمه «افزودن به سبد خرید» کلیک کنید و به سبد بروید." },
  { icon: "📦", title: "انتخاب روش ارسال", desc: "از بین پست پیشتاز، تیپاکس یا پیک گنجه، روش مناسب خود را انتخاب کنید." },
  { icon: "📍", title: "ثبت آدرس", desc: "نام، شماره تماس و آدرس گیرنده را وارد کنید." },
  { icon: "💳", title: "پرداخت", desc: "با فعال شدن درگاه پرداخت، مبلغ را پرداخت و سفارش را نهایی کنید." },
];

export default function HowToOrderPage() {
  return (
    <InfoPage title="نحوه ثبت سفارش" subtitle="خرید از دیجی‌کلون فقط ۵ قدم ساده است" icon="🛒">
      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            <div className="text-3xl shrink-0">{s.icon}</div>
            <div>
              <div className="text-sm font-bold">
                قدم {i + 1}: {s.title}
              </div>
              <p className="text-xs leading-6 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
