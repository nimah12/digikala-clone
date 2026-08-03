"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@prisma/client";
import { MENU_CATEGORIES, MEGA_MENU } from "@/lib/categories";
import { useTheme } from "@/lib/theme";
import SearchBox from "./SearchBox";
import Logo from "./Logo";

export default function Header({ initialCartCount }: { initialCartCount: number }) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);

  // Cart count sync from localStorage
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem("dk-cart");
        if (raw) {
          const ids: string[] = JSON.parse(raw);
          setCartCount(ids.length);
        }
      } catch {}
    };
    sync();
    window.addEventListener("dk-cart-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dk-cart-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Close mega menu on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40" style={{ background: "var(--panel)", color: "var(--text)" }}>
      {/* Red top promo bar linking to jayar project */}
      <a
        href="https://jayar-nine.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-l from-dk-red to-[#e05a2e] text-white text-center text-xs py-2 px-4 hover:from-dk-red-dark transition-all duration-300"
      >
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="text-sm">🏨</span>
          <span className="font-bold">جایا</span>
          <span>— سامانه رزرواسیون هتل و اقامتگاه؛</span>
          <span className="font-bold underline underline-offset-2 decoration-2 decoration-white/50 hover:decoration-white">برای رزرو اقامتگاه کلیک کنید ←</span>
        </span>
      </a>

      {/* Top row: logo, search, actions */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dk-bg transition-colors"
              aria-label="منو"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>

            <Logo />

            <SearchBox />

          <div className="flex items-center gap-1 shrink-0">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dk-bg transition-colors"
              aria-label={theme === "dark" ? "حالت روز" : "حالت شب"}
              title={theme === "dark" ? "حالت روز" : "حالت شب"}
            >
              {theme === "dark" ? (
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dk-bg transition-colors"
              aria-label="سبد خرید"
              title="سبد خرید"
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="21" r="1.5" />
                <circle cx="20" cy="21" r="1.5" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="badge-bounce absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-dk-red text-white text-[11px] font-bold flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          </div>
        </div>
      </div>

      {/* Category bar + mega menu */}
      <div className="hidden md:block border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 relative" ref={megaRef}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 h-10 text-sm font-medium transition-colors ${
                megaOpen ? "text-dk-red" : "text-dk-text-secondary hover:text-dk-red"
              }`}
              aria-expanded={megaOpen}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              دسته‌بندی کالاها
            </button>
            {MENU_CATEGORIES.map((cat: Category) => {
              const isActive = pathname.startsWith(`/category/${cat.slug}`);
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`px-3 h-10 flex items-center text-sm transition-colors ${
                    isActive
                      ? "text-dk-red font-semibold"
                      : "text-dk-text-secondary hover:text-dk-text"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Mega menu panel: near-full width like before, but blurred */}
          {megaOpen && (
            <>
              {/* Blurred backdrop */}
              <div
                className="fixed inset-0 z-10"
                style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
                onClick={() => setMegaOpen(false)}
                aria-hidden="true"
              />
              <div
                className="mega-menu-panel absolute right-0 left-0 top-full z-20 shadow-2xl rounded-b-2xl border p-6"
                style={{
                  background: "color-mix(in srgb, var(--panel) 85%, transparent)",
                  borderColor: "var(--border)",
                }}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                  {MEGA_MENU.map((section) => (
                    <div key={section.slug}>
                      <Link
                        href={`/category/${section.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold hover:text-dk-red transition-colors mb-2.5"
                      >
                        <span className="text-lg">{section.icon}</span>
                        {section.name}
                      </Link>
                      <ul className="space-y-1.5">
                        {section.subcategories.slice(0, 4).map((sub) => (
                          <li key={sub}>
                            <Link
                              href={`/search?q=${encodeURIComponent(sub)}`}
                              className="text-xs hover:text-dk-red transition-colors"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t p-4 space-y-1" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
          <Link href="/" className="block px-3 py-2 text-sm rounded-lg hover:bg-dk-bg">خانه</Link>
          {MENU_CATEGORIES.map((cat: Category) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="block px-3 py-2 text-sm rounded-lg hover:bg-dk-bg"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
