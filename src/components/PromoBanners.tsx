import Link from "next/link";
import Icon, { type IconName } from "./Icon";

const BANNERS: {
  title: string;
  subtitle: string;
  icon: IconName;
  bg: string;
  href: string;
  chip: string;
}[] = [
  {
    title: "طلا و نقره اصل",
    subtitle: "با عیار تضمینی و کد اصالت",
    icon: "coins",
    bg: "#b8860b",
    href: "/category/gold-silver",
    chip: "قیمت روز",
  },
  {
    title: "کارت گرافیک و گیمینگ",
    subtitle: "RTX 4070 و RX 580 با بهترین قیمت",
    icon: "gamepad",
    bg: "#23254e",
    href: "/category/gpu",
    chip: "تا ٪۲۰ تخفیف",
  },
  {
    title: "پوشاک تابستانی",
    subtitle: "نایک، لی، اسکچرز و...",
    icon: "shirt",
    bg: "#0e7a5f",
    href: "/category/clothing",
    chip: "جدیدترین‌ها",
  },
];

export default function PromoBanners() {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BANNERS.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className="promo-banner group relative overflow-hidden rounded-2xl p-5 min-h-[150px] flex items-center justify-between gap-3 hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${b.bg} 0%, color-mix(in srgb, ${b.bg} 68%, #000000) 100%)`,
            }}
          >
            {/* برچسب گوشه */}
            <span className="absolute top-3 right-3 z-10 text-[10px] font-black text-white/95 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
              {b.chip}
            </span>

            <div className="relative z-10">
              <h3 className="text-white text-lg font-extrabold leading-7 drop-shadow-sm">{b.title}</h3>
              <p className="text-white/80 text-xs mt-1.5">{b.subtitle}</p>
              <span className="inline-flex items-center gap-1 mt-3 bg-white/20 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-lg group-hover:bg-white/35 group-hover:gap-2 transition-all">
                مشاهده ←
              </span>
            </div>

            <span className="promo-icon relative z-10 text-white/95">
              <Icon name={b.icon} size={54} strokeWidth={1.4} />
            </span>

            {/* دایره‌های تزئینی */}
            <span className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            <span className="absolute -bottom-8 left-12 w-20 h-20 rounded-full bg-white/10" />
            <span className="absolute top-1/2 -translate-y-1/2 -right-8 w-16 h-16 rounded-full bg-white/5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
