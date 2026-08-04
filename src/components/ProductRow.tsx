"use client";

import { useRef } from "react";
import ProductCard, { type ProductWithCategory } from "./ProductCard";

export default function ProductRow({
  products,
  title,
  subtitle,
}: {
  products: ProductWithCategory[];
  title?: string;
  subtitle?: string;
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
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

      <div ref={scrollRef} className="scroll-row flex gap-3">
        {products.map((product) => (
          <div key={product.id} className="w-44 sm:w-48 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
