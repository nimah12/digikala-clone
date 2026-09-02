"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { faNormalize } from "@/lib/normalize";
import { SafeImg } from "./SafeImage";

type Suggestion = {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  discountPercent: number;
  category: { name: string };
};

type Result = { q: string; items: Suggestion[] };

function Highlight({ text, query }: { text: string; query: string }) {
  const q = faNormalize(query);
  const target = faNormalize(text);
  if (!q) return <>{target}</>;
  const start = target.indexOf(q);
  if (start === -1) return <>{target}</>;
  const end = start + q.length;
  return (
    <>
      {target.slice(0, start)}
      <span style={{ color: "#ef4050" }}>{target.slice(start, end)}</span>
      {target.slice(end)}
    </>
  );
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suppressBlur = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const trimmed = query.trim();
  const loading = trimmed.length >= 2 && result?.q !== query;
  const items = result && result.q === query ? result.items : [];
  const safeActive = items.length === 0 ? -1 : Math.min(activeIndex, items.length - 1);
  const showPanel = open && focused && trimmed.length >= 2;

  // Close + reset on navigation — adjusting state during render is the
  // React-recommended way to react to a prop change without an effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setQuery("");
    setResult(null);
  }

  // Debounced fetch with abort — stale responses never overwrite newer ones.
  // The setState call happens asynchronously inside the timeout, so the
  // render/loading states are derived from `result.q !== query` instead.
  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success) setResult({ q: query, items: json.data });
      } catch {}
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, trimmed]);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function goTo(href: string) {
    suppressBlur.current = true;
    setOpen(false);
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showPanel || items.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((safeActive + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(safeActive <= 0 ? items.length - 1 : safeActive - 1);
    } else if (e.key === "Enter") {
      if (safeActive >= 0) {
        e.preventDefault();
        goTo(`/product/${items[safeActive].slug}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocused(false);
    }
  }

  return (
    <div className="relative w-full" ref={boxRef}>
      <form action="/search" role="search" onSubmit={() => setOpen(false)}>
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
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            autoCorrect="off"
            placeholder="جستجو در دیجی‌کلون..."
            className="w-full h-10 pr-10 pl-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 focus:border-dk-red transition"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            aria-label="جستجو در دیجی‌کلون"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="search-suggestions"
            aria-activedescendant={safeActive >= 0 ? `search-opt-${items[safeActive]?.id}` : undefined}
          />
          <button
            type="submit"
            aria-label="جستجو"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showPanel && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full right-0 left-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-50"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {items.length === 0 ? (
            loading ? (
              <div className="flex items-center justify-center gap-2.5 p-4">
                <span
                  className="loading-spinner w-4 h-4 rounded-full"
                  style={{ border: "2px solid var(--border)", borderTopColor: "#ef4050" }}
                />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  در حال جستجو...
                </span>
              </div>
            ) : (
              <p className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                کالایی با این عبارت پیدا نشد
              </p>
            )
          ) : (
            <>
              <div
                className="px-3 py-2 text-[11px] font-bold border-b"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {items.length.toLocaleString("fa-IR")} نتیجه
              </div>
              {items.map((s, idx) => (
                <div
                  key={s.id}
                  id={`search-opt-${s.id}`}
                  role="option"
                  aria-selected={idx === safeActive}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    goTo(`/product/${s.slug}`);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    color: "var(--text)",
                    background: idx === safeActive ? "var(--bg)" : "transparent",
                  }}
                >
                  <SafeImg
                    src={s.imageUrl || "/images/placeholder.svg"}
                    alt={s.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                    style={{ background: "var(--bg)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">
                      <Highlight text={s.name} query={query} />
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {s.category.name}
                    </div>
                  </div>
                  <div className="text-xs font-bold digits shrink-0">
                    {s.discountPercent > 0 ? (
                      <>
                        <span
                          className="block text-[10px] font-normal line-through"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatPrice(Math.round((s.price * 100) / (100 - s.discountPercent)))}
                        </span>
                        <span style={{ color: "#ef4050" }}>{formatPrice(s.price)}</span>
                      </>
                    ) : (
                      formatPrice(s.price)
                    )}
                    <span className="text-[10px] font-normal" style={{ color: "var(--text-secondary)" }}>
                      {" "}
                      تومان
                    </span>
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
