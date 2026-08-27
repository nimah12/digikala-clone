"use client";

import Link from "next/link";
import { useRef } from "react";
import Icon from "./Icon";
import BrandLogo, { type BrandLogoName } from "./BrandLogo";

const BRANDS: {
  name: string;
  slug: string;
  q: string;
  logo: BrandLogoName;
  color: string;
  tileBg: string;
}[] = [
  {
    name: "اپل",
    slug: "apple",
    q: "iphone",
    logo: "apple",
    color: "#e8f0f9",
    tileBg: "#111113",
  },
  {
    name: "سامسونگ",
    slug: "samsung",
    q: "samsung",
    logo: "samsung",
    color: "#dcebfa",
    tileBg: "#ffffff",
  },
  {
    name: "شیائومی",
    slug: "xiaomi",
    q: "xiaomi",
    logo: "xiaomi",
    color: "#fdeeda",
    tileBg: "#ffffff",
  },
  {
    name: "لنوو",
    slug: "lenovo",
    q: "lenovo",
    logo: "lenovo",
    color: "#e6eef7",
    tileBg: "#ffffff",
  },
  { name: "نایک", slug: "nike", q: "nike", logo: "nike", color: "#e8e8ef", tileBg: "#ffffff" },
  {
    name: "آدیداس",
    slug: "adidas",
    q: "adidas",
    logo: "adidas",
    color: "#e0f3e9",
    tileBg: "#ffffff",
  },
  {
    name: "سونی",
    slug: "sony",
    q: "sony",
    logo: "sony",
    color: "#f7e3f0",
    tileBg: "#111113",
  },
  { name: "بوش", slug: "bosch", q: "bosch", logo: "bosch", color: "#fdeeda", tileBg: "#ffffff" },
  {
    name: "جی‌بی‌ال",
    slug: "jbl",
    q: "jbl",
    logo: "jbl",
    color: "#fdeeda",
    tileBg: "#ffffff",
  },
  { name: "ایسوس", slug: "asus", q: "asus", logo: "asus", color: "#e6eef7", tileBg: "#ffffff" },
  { name: "تفال", slug: "tefal", q: "tefal", logo: "tefal", color: "#f3e6f8", tileBg: "#ffffff" },
  {
    name: "پاناسونیک",
    slug: "panasonic",
    q: "panasonic",
    logo: "panasonic",
    color: "#e2eef7",
    tileBg: "#ffffff",
  },
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
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "color-mix(in srgb, var(--text) 8%, transparent)",
              color: "var(--text)",
            }}
          >
            <Icon name="Award" size={18} />
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold leading-6">
              محبوب‌ترین برندها
            </h2>
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
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            aria-label="اسکرول به راست"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-[var(--hover)] hover:scale-110 transition-all"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            aria-label="اسکرول به چپ"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
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
                className="brand-tile brand-item w-[92px] h-[92px] rounded-2xl flex items-center justify-center border shadow-sm"
                style={
                  {
                    background: brand.tileBg,
                    borderColor: "var(--border)",
                    animationDelay: `${i * 60}ms`,
                    "--glow": brand.color,
                  } as React.CSSProperties
                }
              >
                <span className="brand-icon">
                  <BrandLogo name={brand.logo} size={52} />
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
