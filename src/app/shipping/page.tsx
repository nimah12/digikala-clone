import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "رویه ارسال سفارش" };

export default function ShippingPage() {
  return (
    <InfoPage title="رویه ارسال سفارش" subtitle="هر روش ارسال، با قیمت و زمان مشخص" icon="🚚">
      <div className="space-y-4">
        {[
          { icon: "🛵", name: "پیک گنجه", price: "۶۰,۰۰۰ تومان", time: "تحویل همان روز", desc: "مخصوص تهران؛ سفارش‌های ثبت‌شده تا ساعت ۱۲ ظهر، همان روز تحویل می‌شوند." },
          { icon: "🚚", name: "تیپاکس", price: "۴۵,۰۰۰ تومان", time: "۱ تا ۲ روز کاری", desc: "ارسال سریع به سراسر کشور با امکان رهگیری آنلاین مرسوله." },
          { icon: "📮", name: "پست پیشتاز", price: "۳۰,۰۰۰ تومان", time: "۳ تا ۵ روز کاری", desc: "ارسال اقتصادی با پست ملی برای سفارش‌های کم‌فوریت." },
        ].map((m) => (
          <div key={m.name} className="flex items-start gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            <div className="text-3xl shrink-0">{m.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{m.name}</div>
                <div className="text-sm font-bold digits" style={{ color: "var(--dk-red, #ef4050)" }}>{m.price}</div>
              </div>
              <div className="text-[11px] font-bold mt-1" style={{ color: "var(--text-secondary)" }}>{m.time}</div>
              <p className="text-xs leading-6 mt-1">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
