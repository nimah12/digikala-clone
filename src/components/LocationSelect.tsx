"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Props = {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
};

export default function LocationSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  id,
  name,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => o.includes(query.trim()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-bold mb-1.5">{label}</label>
      <button
        id={id}
        name={name}
        type="button"
        onClick={() => {
          setQuery("");
          setOpen((o) => !o);
        }}
        className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 flex items-center justify-between transition-colors"
        style={{
          background: "var(--bg)",
          borderColor: open ? "#ef4050" : "var(--border)",
          color: value ? "var(--text)" : "var(--text-secondary)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "font-medium" : ""}>{value || placeholder}</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border shadow-xl overflow-hidden"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو..."
              autoFocus
              className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                موردی یافت نشد.
              </div>
            ) : (
              filtered.map((opt) => {
                const selected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between text-right px-3 py-2.5 text-sm transition-colors hover:bg-[var(--hover)]"
                    style={
                      selected
                        ? { color: "#ef4050", fontWeight: 700, background: "rgba(239,64,80,0.06)" }
                        : { color: "var(--text)" }
                    }
                  >
                    {opt}
                    {selected && <Icon name="check" size={16} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
