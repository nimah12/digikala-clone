import Link from "next/link";
import Icon from "./Icon";

const CATEGORIES = [
  { icon: "phone", label: "موبایل", slug: "mobile", color: "#e8f4fd" },
  { icon: "laptop", label: "لپ‌تاپ", slug: "laptop", color: "#eef2f7" },
  { icon: "tablet", label: "تبلت", slug: "tablet", color: "#f5edf9" },
  { icon: "watch", label: "ساعت هوشمند", slug: "smartwatch", color: "#eef3fa" },
  { icon: "coins", label: "طلا و نقره", slug: "gold-silver", color: "#fdf3d9" },
  { icon: "basket", label: "سوپرمارکت", slug: "supermarket", color: "#eef7ec" },
  { icon: "shirt", label: "پوشاک", slug: "clothing", color: "#f0f4fa" },
  { icon: "gamepad", label: "کارت گرافیک", slug: "gpu", color: "#fdeef0" },
  { icon: "wrench", label: "ابزارآلات", slug: "tools", color: "#fdf3e3" },
  { icon: "headphones", label: "صوتی و تصویری", slug: "audio", color: "#f2f2f7" },
  { icon: "home", label: "خانه و آشپزخانه", slug: "home", color: "#fdf6ec" },
  { icon: "coffee", label: "لوازم خانگی", slug: "home-appliances", color: "#f5edf9" },
  { icon: "book", label: "کتاب", slug: "books", color: "#f5f0e8" },
  { icon: "spray", label: "عطر و ادکلن", slug: "perfume", color: "#f9e8f4" },
  { icon: "gift", label: "اسباب‌بازی", slug: "toys", color: "#eef7ec" },
  { icon: "lamp", label: "دکوراتیو", slug: "decor", color: "#f5f0e8" },
  { icon: "tag", label: "لباس و مد", slug: "fashion", color: "#f9e8f4" },
  { icon: "camera", label: "دوربین", slug: "camera", color: "#eef4fa" },
] as const;

export default function CategoryCircles() {
  return (
    <section className="mb-8 cv-auto">
      <div
        className="rounded-2xl border p-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="scroll-row flex gap-3.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 shrink-0 w-[82px] group"
            >
              <span
                className="cat-tile w-[70px] h-[70px] flex items-center justify-center"
                style={{ "--c": cat.color } as React.CSSProperties}
              >
                <Icon name={cat.icon} size={28} strokeWidth={1.6} className="cat-tile-icon" />
              </span>
              <span className="text-[11px] font-bold text-center leading-4 group-hover:text-dk-red transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
