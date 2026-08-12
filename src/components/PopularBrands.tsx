"use client";

import Link from "next/link";
import { useRef } from "react";
import Icon, { type IconName } from "./Icon";

const BRANDS: { name: string; slug: string; q: string; icon: IconName; color: string }[] = [
  { name: "اپل", slug: "apple", q: "iphone", icon: "monitor", color: "#eef2f7" },
  { name: "سامسونگ", slug: "samsung", q: "samsung", icon: "phone", color: "#e8f4fd" },
  { name: "شیائومی", slug: "xiaomi", q: "xiaomi", icon: "tag", color: "#fdf3e3" },
  { name: "لنوو", slug: "lenovo", q: "lenovo", icon: "laptop", color: "#f0f4fa" },
  { name: "نایک", slug: "nike", q: "nike", icon: "shoe", color: "#f2f2f7" },
  { name: "آدیداس", slug: "adidas", q: "adidas", icon: "t-shirt", color: "#eef7ec" },
  { name: "سونی", slug: "sony", q: "sony", icon: "headphones", color: "#f9e8f4" },
  { name: "بوش", slug: "bosch", q: "bosch", icon: "wrench", color: "#fdf3e3" },
  { name: "جی‌بی‌ال", slug: "jbl", q: "jbl", icon: "megaphone", color: "#fdf3e3" },
  { name: "ایسوس", slug: "asus", q: "asus", icon: "gamepad", color: "#eef2f7" },
  { name: "تفال", slug: "tefal", q: "tefal", icon: "pan", color: "#f5edf9" },
  { name: "پاناسونیک", slug: "panasonic", q: "panasonic", icon: "tv", color: "#eef3fa" },
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
          {BRANDS.map((brand, i) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="flex flex-col items-center gap-2.5 group shrink-0 w-[110px]"
            >
              <span
                className="brand-tile brand-item w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center border shadow-sm"
                style={
                  {
                    background: brand.color,
                    borderColor: "var(--border)",
                    animationDelay: `${i * 70}ms`,
                    "--glow": brand.color,
                  } as React.CSSProperties
                }
              >
                <span className="brand-icon" style={{ color: "#23254e" }}><Icon name={brand.icon} size={44} strokeWidth={1.4} /></span>
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
