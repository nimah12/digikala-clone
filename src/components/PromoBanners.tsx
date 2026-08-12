import Link from "next/link";
import Icon, { type IconName } from "./Icon";

const BANNERS: { title: string; subtitle: string; icon: IconName; bg: string; href: string }[] = [
  {
    title: "طلا و نقره اصل",
    subtitle: "با عیار تضمینی و کد اصالت",
    icon: "coins",
    bg: "#b8860b",
    href: "/category/gold-silver",
  },
  {
    title: "کارت گرافیک و گیمینگ",
    subtitle: "RTX 4070 و RX 580 با بهترین قیمت",
    icon: "gamepad",
    bg: "#23254e",
    href: "/category/gpu",
  },
  {
    title: "پوشاک جدید",
    subtitle: "نایک، لی، اسکچرز و...",
    icon: "shirt",
    bg: "#0e7a5f",
    href: "/category/clothing",
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
            className="group relative overflow-hidden rounded-2xl p-5 min-h-[140px] flex items-center justify-between gap-3 hover:shadow-xl transition-shadow"
            style={{ background: b.bg }}
          >
            <div className="relative z-10">
              <h3 className="text-white text-lg font-extrabold leading-7">{b.title}</h3>
              <p className="text-white/80 text-xs mt-1.5">{b.subtitle}</p>
              <span className="inline-flex items-center gap-1 mt-3 bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                مشاهده ←
              </span>
            </div>
            <span className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-300">
              <Icon name={b.icon} size={52} strokeWidth={1.4} />
            </span>
            {/* decorative circles */}
            <span className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            <span className="absolute -bottom-8 left-12 w-20 h-20 rounded-full bg-white/10" />
          </Link>
        ))}
      </div>
    </section>
  );
}
