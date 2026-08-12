"use client";

import { useState } from "react";

type ColorOption = {
  id: number;
  name: string;
  hex: string;
  stock: number;
};

type Props = {
  colors: ColorOption[];
};

export default function ProductColorPicker({ colors }: Props) {
  const [selectedId, setSelectedId] = useState<number>(colors[0]?.id ?? -1);

  if (colors.length === 0) return null;

  const selected = colors.find((c) => c.id === selectedId) ?? colors[0];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span style={{ color: "var(--text-secondary)" }}>رنگ:</span>
        <span className="font-bold">{selected.name}</span>
        {selected.stock === 0 && (
          <span className="text-xs text-dk-red">(ناموجود)</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            title={c.name}
            aria-label={c.name}
            aria-pressed={c.id === selectedId}
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition"
            style={{
              background: c.hex,
              border:
                c.id === selectedId
                  ? "2px solid var(--dk-red, #ef4050)"
                  : "1px solid var(--border)",
              boxShadow: c.id === selectedId ? "0 0 0 2px rgba(239,64,80,0.15)" : "none",
              opacity: c.stock === 0 ? 0.4 : 1,
            }}
          >
            {c.id === selectedId && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke={isLight(c.hex) ? "#000" : "#fff"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// تشخیص روشن یا تیره بودن رنگ برای انتخاب رنگ درست تیک
function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150;
}
