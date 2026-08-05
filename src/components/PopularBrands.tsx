"use client";

import Link from "next/link";
import { useRef } from "react";

const BRANDS = [
  { name: "اپل", slug: "apple", icon: "🍎", color: "#eef2f7" },
  { name: "سامسونگ", slug: "samsung", icon: "📱", color: "#e8f4fd" },
  { name: "شیائومی", slug: "xiaomi", icon: "🐝", color: "#fdf3e3" },
  { name: "لنوو", slug: "lenovo", icon: "💻", color: "#f0f4fa" },
  { name: "نایک", slug: "nike", icon: "👟", color: "#f2f2f7" },
  { name: "ادیداس", slug: "adidas", icon: "👕", color: "#eef7ec" },
  { name: "سونی", slug: "sony", icon: "🎧", color: "#f9e8f4" },
  { name: "بوش", slug: "bosch", icon: "🔧", color: "#fdf3e3" },
  { name: "جی‌بی‌ال", slug: "jbl", icon: "🔊", color: "#fdf3e3" },
  { name: "ایسوس", slug: "asus", icon: "🖥️", color: "#eef2f7" },
  { name: "تفال", slug: "tefal", icon: "🍳", color: "#f5edf9" },
  { name: "پاناسونیک", slug: "panasonic", icon: "📺", color: "#eef3fa" },
];

export default function PopularBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold">محبوب‌ترین برندها</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-dk-bg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            aria-label="اسکرول به راست"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-dk-bg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            aria-label="اسکرول به چپ"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div ref={scrollRef} className="scroll-row flex items-center gap-5">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/search?q=${brand.name}`}
              className="flex flex-col items-center gap-2.5 group shrink-0 w-[110px]"
            >
              <span
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-5xl lg:text-6xl border shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:border-dk-red/40 transition-all duration-200"
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
