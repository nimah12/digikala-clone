import Link from "next/link";

const CATEGORIES = [
  { icon: "📱", label: "موبایل", slug: "mobile", color: "#e8f4fd" },
  { icon: "💻", label: "لپ‌تاپ", slug: "laptop", color: "#eef2f7" },
  { icon: "📲", label: "تبلت", slug: "tablet", color: "#f5edf9" },
  { icon: "⌚", label: "ساعت هوشمند", slug: "smartwatch", color: "#eef3fa" },
  { icon: "🥇", label: "طلا و نقره", slug: "gold-silver", color: "#fdf3d9" },
  { icon: "🛒", label: "سوپرمارکت", slug: "supermarket", color: "#eef7ec" },
  { icon: "🧥", label: "پوشاک", slug: "clothing", color: "#f0f4fa" },
  { icon: "🎮", label: "کارت گرافیک", slug: "gpu", color: "#fdeef0" },
  { icon: "🔧", label: "ابزارآلات", slug: "tools", color: "#fdf3e3" },
  { icon: "🎧", label: "صوتی و تصویری", slug: "audio", color: "#f2f2f7" },
  { icon: "🏠", label: "خانه و آشپزخانه", slug: "home", color: "#fdf6ec" },
  { icon: "👕", label: "لباس و مد", slug: "fashion", color: "#f9e8f4" },
];

export default function CategoryCircles() {
  return (
    <section className="mb-8">
      <div
        className="rounded-2xl border p-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 shrink-0 w-[76px] group"
            >
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200"
                style={{ background: cat.color }}
              >
                {cat.icon}
              </span>
              <span className="text-[11px] text-center leading-4 group-hover:text-dk-red transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
