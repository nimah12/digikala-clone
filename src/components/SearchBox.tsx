"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Suggestion = {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  discountPercent: number;
  category: { name: string };
};

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const suppressBlur = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // debounced fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) setSuggestions(json.data);
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // close on navigation
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  const showPanel = open && focused && query.trim().length >= 2;

  // mousedown fires before blur: navigate via router so blur doesn't eat the click
  function goTo(href: string) {
    suppressBlur.current = true;
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto relative min-w-0" ref={boxRef}>
      <form
        action="/search"
        role="search"
        onSubmit={() => setOpen(false)}
      >
        <div className="relative">
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (suppressBlur.current) {
                suppressBlur.current = false;
                return;
              }
              setFocused(false);
            }}
            placeholder="جستجو در دیجی‌کلون..."
            className="w-full h-10 pr-10 pl-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 focus:border-dk-red transition"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            aria-label="جستجو در دیجی‌کلون"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            style={{ color: "var(--text-secondary)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showPanel && (
        <div
          className="absolute top-full right-0 left-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-50"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {suggestions.length === 0 ? (
            <p className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              در حال جستجو...
            </p>
          ) : (
            <>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    goTo(`/product/${s.slug}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goTo(`/product/${s.slug}`);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                  style={{ color: "var(--text)" }}
                  data-hover-bg="var(--bg)"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl || "/images/placeholder.svg"}
                    alt={s.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                    style={{ background: "var(--bg)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{s.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {s.category.name}
                    </div>
                  </div>
                  <div className="text-xs font-bold digits shrink-0">
                    {formatPrice(s.price)}
                    <span className="text-[10px] font-normal" style={{ color: "var(--text-secondary)" }}> تومان</span>
                  </div>
                </div>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-bold py-2.5 border-t transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                مشاهده همه نتایج «{query}»
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
