"use client";

import { useEffect, useState } from "react";
import Icon, { type IconName } from "./Icon";

export type TimelineStage = {
  at: number;
  label: string;
  desc: string;
  icon: IconName;
};

// تایملاین ۳ ساعته (۱۸۰ دقیقه) برای سفارش
export const TIMELINE_STAGES: TimelineStage[] = [
  { at: 0, label: "ثبت سفارش", desc: "سفارش شما با موفقیت ثبت شد", icon: "check" },
  { at: 15, label: "تأیید پرداخت", desc: "پرداخت شما تأیید شد", icon: "credit-card" },
  { at: 60, label: "در حال آماده‌سازی", desc: "کالاها در حال بسته‌بندی هستند", icon: "box" },
  { at: 120, label: "تحویل به مأمور ارسال", desc: "مرسوله به پست/پیک تحویل شد", icon: "truck" },
  { at: 180, label: "تحویل به گیرنده", desc: "سفارش تحویل شما شد", icon: "home" },
];

export const TIMELINE_TOTAL_MINUTES = 180;

export function formatDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r.toLocaleString("fa-IR")} دقیقه`;
  return `${h.toLocaleString("fa-IR")} ساعت و ${r.toLocaleString("fa-IR")} دقیقه`;
}

// وضعیت نمایشی سفارش بر اساس زمان سپری‌شده از ثبت
export function getTimelineStatus(elapsedMin: number): { label: string; color: string } {
  if (elapsedMin >= 180) return { label: "تحویل شده", color: "#2ab57d" };
  if (elapsedMin >= 120) return { label: "در مسیر تحویل", color: "#2ab57d" };
  if (elapsedMin >= 60) return { label: "در حال آماده‌سازی", color: "#7879f1" };
  if (elapsedMin >= 15) return { label: "تأیید پرداخت", color: "#f9a825" };
  return { label: "ثبت شده", color: "#f9a825" };
}

// ساعت به‌روز که با وقفه‌های منظم آپدیت می‌شود (برای محاسبه زمان سپری‌شده)
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function getElapsedMinutes(createdAt: string, now: number, speed: number): number {
  if (!createdAt || now === 0) return 0;
  const createdMs = new Date(createdAt).getTime();
  return Math.max(0, (now - createdMs) / 60000) * speed;
}

export default function OrderTimeline({ createdAt, speed }: { createdAt: string; speed: number }) {
  const now = useNow();
  const elapsedMin = getElapsedMinutes(createdAt, now, speed);
  const progressPct = Math.min(100, (elapsedMin / TIMELINE_TOTAL_MINUTES) * 100);
  const complete = elapsedMin >= TIMELINE_TOTAL_MINUTES;
  const activeIndex = complete
    ? TIMELINE_STAGES.length - 1
    : TIMELINE_STAGES.reduce((acc, s, i) => (elapsedMin >= s.at ? i : acc), -1);

  return (
    <div>
      {/* نوار پیشرفت */}
      <div className="h-2.5 rounded-full overflow-hidden mb-6" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progressPct}%`, background: complete ? "var(--dk-green, #26a65b)" : "#ef4050" }}
        />
      </div>

      {/* تایملاین */}
      <div className="space-y-0">
        {TIMELINE_STAGES.map((s, i) => {
          const done = elapsedMin >= s.at;
          const isCurrent = i === activeIndex && !complete;
          return (
            <div key={s.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    done ? "text-white" : ""
                  }`}
                  style={
                    done
                      ? { background: "var(--dk-green, #26a65b)", borderColor: "var(--dk-green, #26a65b)" }
                      : isCurrent
                        ? { borderColor: "#ef4050", color: "#ef4050", background: "rgba(239,64,80,0.08)" }
                        : { borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  {done ? <Icon name="check" size={18} /> : <Icon name={s.icon} size={17} />}
                </div>
                {i < TIMELINE_STAGES.length - 1 && (
                  <div className="w-px flex-1 min-h-8" style={{ background: done ? "var(--dk-green, #26a65b)" : "var(--border)" }} />
                )}
              </div>
              <div className="pb-5">
                <div className={`text-sm ${done || isCurrent ? "font-extrabold" : ""}`} style={{ color: done ? "var(--text)" : isCurrent ? "#ef4050" : "var(--text-secondary)" }}>
                  {s.label}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {s.desc}
                  {!done && speed > 1 && (
                    <span className="mr-2">· {formatDuration((s.at - elapsedMin) / speed)} مانده</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
