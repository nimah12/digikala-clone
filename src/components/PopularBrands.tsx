"use client";

import Link from "next/link";
import { useRef } from "react";
import Icon, { type IconName } from "./Icon";

const BRANDS: { name: string; slug: string; q: string; icon: IconName; color: string }[] = [
  { name: "اپل", slug: "apple", q: "iphone", icon: "monitor", color: "#e8f0f9" },
  { name: "سامسونگ", slug: "samsung", q: "samsung", icon: "phone", color: "#dcebfa" },
  { name: "شیائومی", slug: "xiaomi", q: "xiaomi", icon: "tag", color: "#fdeeda" },
  { name: "لنوو", slug: "lenovo", q: "lenovo", icon: "laptop", color: "#e6eef7" },
  { name: "نایک", slug: "nike", q: "nike", icon: "shoe", color: "#e8e8ef" },
  { name: "آدیداس", slug: "adidas", q: "adidas", icon: "t-shirt", color: "#e0f3e9" },
  { name: "سونی", slug: "sony", q: "sony", icon: "headphones", color: "#f7e3f0" },
  { name: "بوش", slug: "bosch", q: "bosch", icon: "wrench", color: "#fdeeda" },
  { name: "جی‌بی‌ال", slug: "jbl", q: "jbl", icon: "megaphone", color: "#fdeeda" },
  { name: "ایسوس", slug: "asus", q: "asus", icon: "gamepad", color: "#e6eef7" },
  { name: "تفال", slug: "tefal", q: "tefal", icon: "pan", color: "#f3e6f8" },
  { name: "پاناسونیک", slug: "panasonic", q: "panasonic", icon: "tv", color: "#e2eef7" },
];

export default function PopularBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  }

  return (
    <section className="mb-10 cv-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)", color: "var(--text)" }}>
            <Icon name="Award" size={18} />
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold leading-6">محبوب‌ترین برندها</h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {BRANDS.length.toLocaleString("fa-IR")} برند پرفروش دیجی‌کلون
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-[var(--hover)] hover:scale-110 transition-all"
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
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-[var(--hover)] hover:scale-110 transition-all"
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
        <div ref={scrollRef} className="scroll-row flex items-center gap-4">
          {BRANDS.map((brand, i) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="flex flex-col items-center gap-2.5 group shrink-0 w-[104px]"
            >
              <span
                className="brand-tile brand-item w-[88px] h-[88px] rounded-2xl flex items-center justify-center border shadow-sm"
                style={
                  {
                    background: `linear-gradient(150deg, ${brand.color} 0%, color-mix(in srgb, ${brand.color} 62%, #ffffff) 100%)`,
                    borderColor: "var(--border)",
                    animationDelay: `${i * 60}ms`,
                    "--glow": brand.color,
                  } as React.CSSProperties
                }
              >
                <span className="brand-icon" style={{ color: "#23254e" }}>
                  <Icon name={brand.icon} size={40} strokeWidth={1.4} />
                </span>
              </span>
              <span className="text-sm font-bold flex items-center gap-1 group-hover:text-dk-red transition-colors">
                {brand.name}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
