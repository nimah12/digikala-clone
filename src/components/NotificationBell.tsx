"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/user";

type LoginEvent = { type: "login" | "logout"; time: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      const u = getCurrentUser();
      setUserName(u?.name || null);
      try {
        const raw = localStorage.getItem("dk-events");
        setEvents(raw ? JSON.parse(raw) : []);
      } catch {
        setEvents([]);
      }
    };
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dk-bg transition-colors"
        aria-label="نوتیفیکیشن‌ها"
        title="نوتیفیکیشن‌ها"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {events.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-dk-red text-white text-[10px] font-bold flex items-center justify-center">
            {events.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-72 rounded-2xl border shadow-xl overflow-hidden z-50"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 border-b font-bold text-sm" style={{ borderColor: "var(--border)" }}>
            🔔 فعالیت‌های حساب
          </div>
          {events.length === 0 ? (
            <div className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              هنوز فعالیتی ثبت نشده است.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {events.map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b text-xs" style={{ borderColor: "var(--border)" }}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${e.type === "login" ? "bg-dk-green" : "bg-dk-red"}`} />
                  <span className="flex-1">
                    {e.type === "login" ? "ورود به حساب" : "خروج از حساب"}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }} dir="ltr">
                    {e.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
