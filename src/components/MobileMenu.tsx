"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SUB_HEADER_LINKS } from "@/lib/categories";
import type { MenuGroupForRender } from "@/lib/menu-server";
import Logo from "./Logo";
import Icon from "./Icon";

export default function MobileMenu({
  open,
  onClose,
  menuGroups,
}: {
  open: boolean;
  onClose: () => void;
  menuGroups?: MenuGroupForRender[];
}) {
  const groups = menuGroups ?? [];
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({ 0: true });

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in" onClick={onClose} />

      {/* Drawer */}
      <aside
        className="absolute inset-y-0 right-0 w-[85%] max-w-sm flex flex-col shadow-2xl"
        style={{ background: "var(--panel)", color: "var(--text)", animation: "drawer-in 0.25s ease-out both" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-dk-bg transition-colors"
            aria-label="بستن منو"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick links */}
          <div className="px-4 py-3 space-y-1">
            {SUB_HEADER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold rounded-xl hover:bg-dk-bg transition-colors"
              >
                <span className="text-dk-red"><Icon name={link.icon} size={18} /></span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="h-px mx-4" style={{ background: "var(--border)" }} />

          {/* Category groups (accordion) */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-extrabold">دسته‌بندی کالاها</span>
            </div>
            <div className="space-y-1">
              {groups.map((group, i) => {
                const isOpen = !!openGroups[i];
                return (
                  <div key={`${group.id}-${group.title}`} className="rounded-xl overflow-hidden" style={{ background: "var(--bg)" }}>
                    <button
                      type="button"
                      onClick={() => setOpenGroups((g) => ({ ...g, [i]: !g[i] }))}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-dk-red"><Icon name={group.icon} size={18} /></span>
                        {group.title}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: "var(--text-muted)" }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-2.5 pt-1 space-y-0.5">
                        {group.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-2 text-[13px] rounded-lg hover:bg-dk-bg transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span className="text-dk-red"><Icon name={cat.icon} size={16} /></span>
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
