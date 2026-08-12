"use client";

import { useRef } from "react";
import ProductCard, { type ProductWithCategory } from "./ProductCard";
import Icon, { type IconName } from "./Icon";

export default function ProductRow({
  products,
  title,
  subtitle,
  icon,
  headerBg,
  headerColor,
}: {
  products: ProductWithCategory[];
  title?: string;
  subtitle?: string;
  icon?: IconName;
  headerBg?: string;
  headerColor?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "right" ? el.clientWidth * 0.8 : -el.clientWidth * 0.8;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="mb-8">
      <div
        className="flex items-center justify-between mb-3 rounded-xl px-4 py-3"
        style={{
          background: headerBg || "transparent",
          color: headerColor || "var(--text)",
        }}
      >
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            {icon && <Icon name={icon} size={20} className="shrink-0" />}
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: subtitle && headerBg ? "rgba(255,255,255,0.85)" : "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {/* Scroll arrows */}
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

      {products.length === 0 ? (
        <div className="text-center py-10 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
          <div className="flex justify-center mb-3 text-dk-red">
            <Icon name="bag" size={36} strokeWidth={1.5} />
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            در حال حاضر کالایی در این بخش وجود ندارد.
          </p>
        </div>
      ) : (
        <div ref={scrollRef} className="scroll-row flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="w-44 sm:w-48 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
