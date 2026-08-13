"use client";

import { useMemo, useState } from "react";
import type { GoldHistoryPoint } from "@/lib/gold-prices";

type SeriesKey = "gold18k" | "sekkeh" | "nim" | "rob" | "usd";

type Series = {
  key: SeriesKey;
  label: string;
  color: string;
  unit: "m" | "k"; // میلیون تومان / هزار تومان
};

const SERIES: Series[] = [
  { key: "gold18k", label: "طلای ۱۸ عیار", color: "#f9a825", unit: "m" },
  { key: "sekkeh", label: "سکه امامی", color: "#ef4050", unit: "m" },
  { key: "nim", label: "نیم سکه", color: "#7879f1", unit: "m" },
  { key: "rob", label: "ربع سکه", color: "#2ab57d", unit: "m" },
  { key: "usd", label: "دلار آمریکا", color: "#22a7f0", unit: "k" },
];

const W = 640;
const H = 260;
const PAD = { l: 58, r: 14, t: 18, b: 30 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

const faNum = (n: number, maxFrac = 0) =>
  n.toLocaleString("fa-IR", { maximumFractionDigits: maxFrac });

const faDate = (t: number) =>
  new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(t));

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / pow;
  const f = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return f * pow;
}

export default function GoldPriceChart({
  history,
}: {
  history: GoldHistoryPoint[];
}) {
  const [activeKey, setActiveKey] = useState<SeriesKey>("gold18k");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const series = SERIES.find((s) => s.key === activeKey)!;

  const data = useMemo(() => {
    const pts: { t: number; v: number }[] = [];
    for (const p of history) {
      const v = p[activeKey];
      if (typeof v === "number" && Number.isFinite(v)) pts.push({ t: p.t, v });
    }
    return pts;
  }, [history, activeKey]);

  const { yMin, yMax, ticks, xs } = useMemo(() => {
    if (data.length < 2) {
      return { yMin: 0, yMax: 1, ticks: [] as number[], xs: [] as number[] };
    }
    const vs = data.map((d) => d.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const pad = (max - min) * 0.08 || max * 0.01 || 1;
    const yMin = min - pad;
    const yMax = max + pad;
    const step = niceStep((max - min) / 4);
    const ticks: number[] = [];
    for (let v = Math.floor(min / step) * step; v <= max + 1e-9; v += step) ticks.push(v);
    const n = data.length;
    const xs = Array.from({ length: n }, (_, i) => PAD.l + (i / (n - 1)) * IW);
    return { yMin, yMax, ticks, xs };
  }, [data]);

  const yOf = (v: number) => PAD.t + IH * (1 - (v - yMin) / (yMax - yMin));

  const linePath = useMemo(() => {
    if (xs.length < 2) return "";
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${yOf(d.v).toFixed(1)}`)
      .join(" ");
  }, [data, xs, yMin, yMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const areaPath = useMemo(() => {
    if (linePath) {
      return `${linePath} L${xs[xs.length - 1].toFixed(1)},${PAD.t + IH} L${xs[0].toFixed(1)},${PAD.t + IH} Z`;
    }
    return "";
  }, [linePath, xs]);

  const xLabelIdx = useMemo(() => {
    const n = data.length;
    if (n < 3) return [0, n - 1];
    const q = (n - 1) / 4;
    return [0, Math.round(q), Math.round(q * 2), Math.round(q * 3), n - 1].filter(
      (v, i, a) => a.indexOf(v) === i,
    );
  }, [data]);

  if (data.length < 2) {
    return (
      <div
        className="rounded-2xl border p-8 text-center text-sm"
        style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        داده کافی برای رسم نمودار وجود ندارد — تاریخچه پس از چند بروزرسانی قیمت تکمیل میشود.
      </div>
    );
  }

  const first = data[0].v;
  const last = data[data.length - 1].v;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const up = changePct >= 0;
  const maxV = Math.max(...data.map((d) => d.v));
  const minV = Math.min(...data.map((d) => d.v));
  const unitLabel = series.unit === "m" ? "میلیون تومان" : "هزار تومان";

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const hover = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div>
      {/* تب‌های انتخاب سری */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" dir="rtl">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              setActiveKey(s.key);
              setHoverIdx(null);
            }}
            className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full border transition-colors ${
              s.key === activeKey ? "text-white border-transparent" : ""
            }`}
            style={
              s.key === activeKey
                ? { background: s.color }
                : { background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: s.color, opacity: s.key === activeKey ? 1 : 0.9 }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* آمار سری */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
        <StatCard label="قیمت فعلی" value={`${faNum(last)} تومان`} />
        <StatCard
          label="تغییر ۳۰ روز"
          value={`${faNum(Math.abs(changePct), 2)}٪`}
          tone={up ? "up" : "down"}
          icon={up ? "▲" : "▼"}
        />
        <StatCard label="بیشترین" value={`${faNum(maxV)} تومان`} />
        <StatCard label="کمترین" value={`${faNum(minV)} تومان`} />
      </div>

      {/* نمودار */}
      <div
        className="rounded-2xl border mt-3 p-3"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-between gap-2 px-1 pb-2 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="inline-flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: series.color }} />
            {series.label}
            {hover ? (
              <span className="digits font-black" style={{ color: "var(--text)" }}>
                {faDate(hover.t)} — {faNum(hover.v)} {unitLabel}
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                (نمودار ۳۰ روزه)
              </span>
            )}
          </span>
          <span className="text-[11px]">واحد: {unitLabel}</span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block touch-none"
          onMouseMove={onMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={series.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* خطوط شبکه */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.l}
                x2={PAD.l + IW}
                y1={yOf(t)}
                y2={yOf(t)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={PAD.l - 8}
                y={yOf(t) + 3.5}
                textAnchor="end"
                fontSize="10.5"
                fill="var(--text-muted)"
                className="digits"
              >
                {faNum(Math.round(t))}
              </text>
            </g>
          ))}

          {/* برچسب‌های تاریخ */}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={xs[i]}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
              fontSize="10.5"
              fill="var(--text-muted)"
            >
              {faDate(data[i].t)}
            </text>
          ))}

          {/* ناحیه و خط */}
          {areaPath && <path d={areaPath} fill="url(#goldArea)" />}
          <path d={linePath} fill="none" stroke={series.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* نقطه آخر */}
          <circle cx={xs[xs.length - 1]} cy={yOf(last)} r="4.5" fill={series.color} stroke="var(--panel)" strokeWidth="2" />

          {/* هاور */}
          {hover && hoverIdx !== null && (
            <g>
              <line
                x1={xs[hoverIdx]}
                x2={xs[hoverIdx]}
                y1={PAD.t}
                y2={PAD.t + IH}
                stroke="var(--text-muted)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle cx={xs[hoverIdx]} cy={yOf(hover.v)} r="5" fill={series.color} stroke="var(--panel)" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  icon?: string;
}) {
  const color = tone === "up" ? "var(--color-dk-green, #2ab57d)" : tone === "down" ? "var(--color-dk-red, #ef4050)" : undefined;
  return (
    <div
      className="rounded-xl border px-3.5 py-2.5"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className="digits text-[13px] md:text-sm font-black mt-0.5 leading-snug break-words"
        style={color ? { color } : undefined}
      >
        {icon && <span className="text-[10px] ml-1">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
