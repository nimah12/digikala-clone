import Link from "next/link";
import Icon from "./Icon";

const FEATURES = [
  {
    icon: "shield" as const,
    title: "مدیریت و تأیید نظرات",
    desc: "نظرات کاربران تا زمانی که ادمین تأییدشان نکند، در صفحه‌ی محصول نمایش داده نمی‌شود. از بخش «نظرات کاربران» هر محصول می‌توانید نظر را تأیید یا رد کنید.",
    href: "/admin/products",
    cta: "مدیریت نظرات در محصولات",
  },
  {
    icon: "bell" as const,
    title: "اعلان نظرات جدید",
    desc: "با ثبت هر نظر جدید، زنگوله‌ی بالای پنل به‌روز می‌شود تا از نظرات در انتظار تأیید باخبر شوید و مستقیماً به محصول مربوطه بروید.",
    href: "/admin/products",
    cta: "مشاهده اعلان‌ها",
  },
];

export default function AdminFeaturesCard({ demo = false }: { demo?: boolean }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <h2 className="font-extrabold mb-1 flex items-center gap-2">
        <Icon name="sparkles" size={18} className="text-dk-red" />
        قابلیت‌های پنل ادمین سایت
      </h2>
      <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        {demo
          ? "با حساب دمو می‌توانید پنل مدیریت را به‌صورت فقط‌خواندنی ببینید و با قابلیت‌های ساخته‌شده آشنا شوید."
          : "ویژگی‌هایی که برای این سایت در پنل مدیریت پیاده‌سازی شده‌اند."}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--bg)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon name={f.icon} size={16} className="text-dk-red" />
              <span className="font-bold text-sm">{f.title}</span>
            </div>
            <p className="text-[12px] leading-6 mb-3" style={{ color: "var(--text-secondary)" }}>
              {f.desc}
            </p>
            <Link href={f.href} className="text-xs font-bold text-dk-red hover:underline">
              ← {f.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
