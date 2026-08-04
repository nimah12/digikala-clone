import Link from "next/link";

const BRANDS = [
  { name: "اپل", slug: "apple", icon: "🍎", color: "#eef2f7" },
  { name: "سامسونگ", slug: "samsung", icon: "📱", color: "#e8f4fd" },
  { name: "شیائومی", slug: "xiaomi", icon: "🐝", color: "#fdf3e3" },
  { name: "لنوو", slug: "lenovo", icon: "💻", color: "#f0f4fa" },
  { name: "نایک", slug: "nike", icon: "👟", color: "#f2f2f7" },
  { name: "ادیداس", slug: "adidas", icon: "👕", color: "#eef7ec" },
  { name: "سونی", slug: "sony", icon: "🎧", color: "#f9e8f4" },
  { name: "بوش", slug: "bosch", icon: "🔧", color: "#fdf3e3" },
];

export default function PopularBrands() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold mb-4">محبوب‌ترین برندها</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/search?q=${brand.name}`}
            className="flex flex-col items-center gap-2 shrink-0 w-[80px] group"
          >
            <span
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200"
              style={{ background: brand.color, borderColor: "var(--border)" }}
            >
              {brand.icon}
            </span>
            <span className="text-[11px] font-medium group-hover:text-dk-red transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
