"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/user";
import { useNotificationEvents } from "@/lib/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const events = useNotificationEvents();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const load = () => setUserName(getCurrentUser()?.name || null);
    load();
    window.addEventListener("dk-user-changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("dk-user-changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // بستن با کلیک بیرون
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function handleClick() {
    if (!userName) {
      // اگر لاگین نکرده → برو به ثبت‌نام
      router.push("/register");
      return;
    }
    setOpen((o) => !o);
  }

  const unread = events.filter((e) => e.unread).length;
  const unreadEvents = events.filter((e) => e.unread);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-[var(--hover)] transition-colors"
        aria-label="نوتیفیکیشن‌ها"
        title="نوتیفیکیشن‌ها"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {userName && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-dk-red text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread.toLocaleString("fa-IR")}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[calc(100vw-1rem)] max-w-[13rem] sm:left-0 sm:translate-x-0 sm:w-80 rounded-2xl border shadow-xl overflow-hidden z-50"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 border-b font-bold text-sm flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <span className="flex items-center gap-2">
              <Icon name="bell" size={16} className="text-dk-red" /> فعالیت‌های حساب
            </span>
            {unread > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
                {unread.toLocaleString("fa-IR")} پیام نخوانده
              </span>
            )}
          </div>
          {events.length === 0 ? (
            <div className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              هنوز فعالیتی ثبت نشده است.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {unreadEvents.length === 0 && (
                <div className="px-4 py-3 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  همه پیام‌ها خوانده شده‌اند.
                </div>
              )}
              {(unreadEvents.length > 0 ? unreadEvents.slice(0, 5) : events.slice(0, 5)).map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    setOpen(false);
                    if (e.href) router.push(e.href);
                  }}
                  className={`flex items-start gap-3 px-4 py-2.5 border-b text-xs ${
                    e.href ? "cursor-pointer hover:bg-[var(--hover)] transition-colors" : ""
                  }`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${e.unread ? "bg-dk-red" : ""}`} style={!e.unread ? { background: "var(--border)" } : {}} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold truncate">{e.title}</span>
                    {e.description && (
                      <span className="block text-[11px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                        {e.description}
                      </span>
                    )}
                    <span className="block text-[10px] mt-1" style={{ color: "var(--text-muted)" }} dir="ltr">
                      {e.time}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center py-2.5 text-xs font-bold border-t hover:text-dk-red transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            مشاهده همه پیام‌ها
          </Link>
        </div>
      )}
    </div>
  );
}
