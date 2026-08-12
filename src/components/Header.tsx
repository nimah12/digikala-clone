"use client";

import { Fragment, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUB_HEADER_LINKS } from "@/lib/categories";
import type { MenuGroupForRender } from "@/lib/menu-server";
import { useTheme } from "@/lib/theme";
import { useUserSync } from "@/lib/user";
import { useCartCount } from "@/lib/cart-client";
import { pushEvent } from "@/lib/notifications";
import SearchBox from "./SearchBox";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import MobileMenu from "./MobileMenu";
import Icon from "./Icon";

type HeaderProps = {
  menuGroups?: MenuGroupForRender[];
};

export default function Header({ menuGroups }: HeaderProps) {
  const groups = menuGroups ?? [];
  const user = useUserSync();
  const userName = user?.name ?? null;
  const cartCount = useCartCount();
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  // Close mega menu and user menu on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40" style={{ background: "var(--panel)", color: "var(--text)" }}>
      {/* Top row: logo, search (desktop), actions */}
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

            {/* Desktop search */}
            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <SearchBox />
            </div>

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

            {/* Notification bell */}
            <NotificationBell />

            {/* Register / Login / User dropdown */}
            {userName ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-bold hover:shadow-md transition-shadow"
                  style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
                  title={userName}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white shrink-0"
                    style={{ background: "#ef4050" }}
                  >
                    {userName[0]}
                  </span>
                  <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 w-52 rounded-2xl border shadow-xl overflow-hidden z-50"
                    style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                  >
                    <div className="px-4 py-3 border-b text-sm font-bold" style={{ borderColor: "var(--border)" }}>
                      {userName}
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dk-bg transition-colors">
                      <Icon name="home" size={18} className="text-dk-red" /> داشبورد
                    </Link>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dk-bg transition-colors">
                      <Icon name="user" size={18} className="text-dk-red" /> پروفایل
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dk-bg transition-colors">
                      <Icon name="package" size={18} className="text-dk-red" /> سفارش‌های من
                    </Link>
                    <Link href="/cart" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dk-bg transition-colors">
                      <Icon name="bag" size={18} className="text-dk-red" /> سبد خرید
                    </Link>
                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        onClick={() => {
                          pushEvent({
                            type: "logout",
                            title: "خروج از حساب",
                            description: "از حساب کاربری خود خارج شدید.",
                          });
                          localStorage.removeItem("dk-user");
                          localStorage.removeItem("dk-token");
                          window.dispatchEvent(new Event("dk-user-changed"));
                          setUserMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dk-red/10 hover:text-dk-red transition-colors"
                        style={{ color: "#ef4050" }}
                      >
                        <Icon name="logout" size={18} /> خروج از حساب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:gap-1.5 rounded-lg text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark transition-colors"
                aria-label="ورود / ثبت‌نام"
                title="ورود / ثبت‌نام"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </Link>
            )}

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

      {/* Mobile search bar (below header) */}
      <div className="md:hidden border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
        <SearchBox />
      </div>

      {/* Sub-header: category trigger + curated quick links (digikala-style) */}
      <div className="hidden md:block border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 relative" ref={megaRef}>
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: "none" }}>
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((o) => !o)}
              className={`flex items-center gap-1.5 pl-3 h-10 text-sm font-medium transition-colors shrink-0 ${
                megaOpen ? "text-dk-red" : "text-dk-text-secondary hover:text-dk-red"
              }`}
              aria-expanded={megaOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
              </svg>
              دسته‌بندی کالاها
            </button>
            <span className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
            {SUB_HEADER_LINKS.map((link, idx) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Fragment key={link.label}>
                  {idx > 0 && <span className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />}
                  <Link
                    href={link.href}
                    className={`sub-header-link flex items-center gap-1.5 px-3 h-10 text-[13px] transition-colors shrink-0 ${
                      isActive ? "text-dk-red font-semibold" : "text-dk-text-secondary hover:text-dk-red"
                    }`}
                  >
                    <span className="text-dk-red"><Icon name={link.icon} size={16} /></span>
                    {link.label}
                  </Link>
                </Fragment>
              );
            })}
          </div>

          {/* Mega menu panel: group rail + subcategory panel (digikala-style) */}
          {megaOpen && groups.length > 0 && (
            <div
              className="mega-menu-panel absolute right-0 top-full z-30 shadow-2xl rounded-b-2xl border mt-0.5 overflow-hidden w-[calc(100vw-2rem)] max-w-[1040px]"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
              }}
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <div className="flex max-h-[min(calc(100vh-9rem),620px)]">
                {/* Group rail */}
                <div
                  className="w-44 md:w-52 lg:w-60 shrink-0 py-2 overflow-y-auto mega-menu-scroll"
                  style={{
                    background: "color-mix(in srgb, var(--bg) 55%, transparent)",
                    borderLeft: "1px solid var(--border)",
                  }}
                >
                  {groups.map((group, i) => {
                    const isActive = i === activeGroup;
                    return (
                      <button
                        key={`${group.id}-${group.title}`}
                        type="button"
                        onMouseEnter={() => setActiveGroup(i)}
                        onClick={() => setActiveGroup(i)}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isActive ? "text-dk-red font-bold" : "text-dk-text-secondary hover:bg-dk-bg"
                        }`}
                        style={isActive ? { background: "color-mix(in srgb, #ef4050 7%, transparent)" } : undefined}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-dk-red"><Icon name={group.icon} size={18} /></span>
                          {group.title}
                        </span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory panel */}
                <div className="flex-1 p-6 overflow-y-auto mega-menu-scroll">
                  {groups.length > 0 && (
                    <>
                      <h3 className="flex items-center gap-2 text-base font-extrabold mb-4">
                        <span className="text-dk-red"><Icon name={groups[activeGroup].icon} size={20} /></span>
                        {groups[activeGroup].title}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                        {groups[activeGroup].categories.map((cat) => (
                          <div key={cat.id}>
                            <Link
                              href={`/category/${cat.slug}`}
                              className="inline-flex items-center gap-1.5 text-sm font-bold hover:text-dk-red transition-colors mb-2"
                            >
                              <span className="text-dk-red"><Icon name={cat.icon} size={18} /></span>
                              {cat.name}
                            </Link>
                            {cat.subcategories.length > 0 && (
                              <ul className="space-y-1.5">
                                {cat.subcategories.slice(0, 5).map((sub) => (
                                  <li key={`${sub.slug}-${sub.name}`}>
                                    <Link
                                      href={sub.href}
                                      className="text-xs hover:text-dk-red transition-colors"
                                      style={{ color: "var(--text-secondary)" }}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom strip */}
              <div
                className="flex items-center justify-center gap-8 border-t px-4 py-3"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}
              >
                <Link href="/deals" className="text-xs font-bold text-dk-red hover:underline">
                  تخفیف‌های شگفت‌انگیز
                </Link>
                <Link
                  href="/"
                  className="text-xs font-bold transition-colors hover:text-dk-red"
                  style={{ color: "var(--text-secondary)" }}
                >
                  مشاهده همه دسته‌بندی‌ها
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer menu (separate component) */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} menuGroups={groups} />
    </header>
  );
}
