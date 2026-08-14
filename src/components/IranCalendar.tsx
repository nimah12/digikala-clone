"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getIranParts,
  getPersianMonthGrid,
  WEEKDAYS_FA,
  type IranParts,
} from "@/lib/iran-time";

export default function IranCalendar() {
  const [parts, setParts] = useState<IranParts>(() => getIranParts());
  const [ym, setYm] = useState(() => {
    const g = getPersianMonthGrid();
    return { year: g.year, month: g.month };
  });

  useEffect(() => {
    const id = setInterval(() => setParts(getIranParts()), 1000);
    return () => clearInterval(id);
  }, []);

  const grid = useMemo(
    () => getPersianMonthGrid(ym.year, ym.month),
    [ym.year, ym.month],
  );

  const shift = (delta: number) => {
    setYm(({ year, month }) => {
      let m = month + delta;
      let y = year;
      if (m < 1) {
        m = 12;
        y -= 1;
      } else if (m > 12) {
        m = 1;
        y += 1;
      }
      return { year: y, month: m };
    });
  };

  const goToday = () => {
    const g = getPersianMonthGrid();
    setYm({ year: g.year, month: g.month });
  };

  const faYear = grid.year.toLocaleString("fa-IR", { useGrouping: false });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ساعت لایو + تاریخ امروز */}
      <div
        className="rounded-2xl border shadow-sm px-6 py-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <svg
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            className="text-dk-red shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <div>
            <p
              className="text-3xl font-black tabular-nums"
              dir="ltr"
              suppressHydrationWarning
            >
              {parts.faTime}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
              suppressHydrationWarning
            >
              {parts.faDate} • {parts.enDate}
            </p>
          </div>
        </div>
        <button
          onClick={goToday}
          className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full border transition-colors hover:opacity-80 self-start sm:self-auto"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          بازگشت به امروز
        </button>
      </div>

      {/* تقویم ماهانه */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        {/* هدر ماه + ناوبری */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => shift(-1)}
            aria-label="ماه قبل"
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-base md:text-lg font-black">
              {grid.monthName} {faYear}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              تقویم شمسی
            </p>
          </div>

          <button
            onClick={() => shift(1)}
            aria-label="ماه بعد"
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        {/* روزهای هفته */}
        <div
          className="grid grid-cols-7 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          {WEEKDAYS_FA.map((w, i) => (
            <div
              key={w}
              className={`py-2 text-center text-[11px] md:text-xs font-black ${
                i === 6 ? "text-dk-red" : ""
              }`}
              style={{ color: i === 6 ? undefined : "var(--text-secondary)" }}
            >
              {w}
            </div>
          ))}
        </div>

        {/* شبکه روزها */}
        <div className="grid grid-cols-7" dir="rtl">
          {grid.cells.map((c, i) => {
            const today = c.inMonth && c.isToday;
            return (
              <div
                key={i}
                title={c.gregorian}
                className="relative aspect-square flex items-center justify-center border-b border-l last:border-l-0"
                style={{
                  borderColor: "var(--border)",
                  background: today
                    ? "var(--dk-red, #e11d48)"
                    : undefined,
                }}
              >
                {today && (
                  <span
                    className="absolute top-0.5 text-[9px] font-bold text-white"
                    style={{ opacity: 0.9 }}
                  >
                    امروز
                  </span>
                )}
                <span
                  className={`text-sm md:text-base font-bold tabular-nums ${
                    today
                      ? "text-white"
                      : c.inMonth
                        ? c.isFriday
                          ? "text-dk-red"
                          : ""
                        : ""
                  }`}
                  style={
                    !today && !c.inMonth
                      ? { color: "var(--text-muted)", opacity: 0.55 }
                      : !today && !c.isFriday && c.inMonth
                        ? undefined
                        : undefined
                  }
                >
                  {c.faDay}
                </span>
              </div>
            );
          })}
        </div>

        {/* راهنما */}
        <div
          className="px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t text-[10px]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded"
              style={{ background: "var(--dk-red, #e11d48)" }}
            />
            امروز
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded border"
              style={{ borderColor: "var(--border)" }}
            />
            روزهای خاکستری: ماه قبل / بعد
          </span>
          <span>شروع هفته: شنبه</span>
        </div>
      </div>
    </div>
  );
}
