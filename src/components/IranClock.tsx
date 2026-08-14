"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getIranParts, type IranParts } from "@/lib/iran-time";

type Props = {
  compact?: boolean;
};

export default function IranClock({ compact = false }: Props) {
  const [parts, setParts] = useState<IranParts>(() => getIranParts());

  useEffect(() => {
    const id = setInterval(() => setParts(getIranParts()), 1000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <Link
        href="/iran-calendar"
        className="flex items-center gap-2 shrink-0 transition-colors hover:text-dk-red"
        dir="rtl"
        style={{ color: "var(--text-secondary)" }}
        title="ساعت و تقویم ایران"
      >
        <svg
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span className="text-xs font-bold tabular-nums" suppressHydrationWarning>
          {parts.faTime}
        </span>
        <span className="text-[11px]" suppressHydrationWarning>
          {parts.faDate}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/iran-calendar"
      className="flex items-center gap-2.5 shrink-0 px-3 h-10 border-x transition-colors hover:text-dk-red"
      style={{ borderColor: "var(--border)" }}
      title={`${parts.faDate} • ${parts.enDate}`}
    >
      <svg
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        style={{ color: "var(--text-muted)" }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span
          className="text-[13px] font-bold tabular-nums"
          dir="ltr"
          suppressHydrationWarning
        >
          {parts.faTime}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>
          {parts.faDate} • {parts.enDate}
        </span>
      </div>
    </Link>
  );
}
