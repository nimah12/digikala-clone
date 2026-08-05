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
  { name: "جیبیال", slug: "jbl", icon: "🔊", color: "#fdf3e3" },
  { name: "ایسوس", slug: "asus", icon: "🖥️", color: "#eef2f7" },
  { name: "دیجی‌کلون", slug: "digikala", icon: "🛍️", color: "#fdeef0" },
];

export default function PopularBrands() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold mb-5">محبوب‌ترین برندها</h2>
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/search?q=${brand.name}`}
              className="flex flex-col items-center gap-2.5 group py-3"
            >
              <span
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center text-5xl lg:text-6xl border shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:border-dk-red/40 transition-all duration-200"
                style={{ background: brand.color, borderColor: "var(--border)" }}
              >
                {brand.icon}
              </span>
              <span className="text-sm font-bold group-hover:text-dk-red transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
