"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | { status: string; steps: { label: string; done: boolean }[] }>(null);

  function track(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    // دمو: هر کدی که وارد شود، سفارش در حال آماده‌سازی است
    setResult({
      status: "در حال آماده‌سازی",
      steps: [
        { label: "ثبت سفارش", done: true },
        { label: "تأیید و بسته‌بندی", done: true },
        { label: "تحویل به پست", done: false },
        { label: "تحویل به گیرنده", done: false },
      ],
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h1 className="text-xl font-extrabold mb-6">پیگیری سفارش</h1>

        <form onSubmit={track} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="شماره سفارش را وارد کنید (مثلاً DK-12345)"
            className="flex-1 h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <button
            type="submit"
            className="h-11 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            پیگیری
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <div className="rounded-xl p-4 mb-6" style={{ background: "var(--bg)" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                وضعیت سفارش {code}
              </div>
              <div className="text-lg font-extrabold" style={{ color: "var(--dk-red, #ef4050)" }}>
                {result.status}
              </div>
            </div>
            <div className="space-y-0">
              {result.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        s.done ? "bg-dk-green text-white" : "border"
                      }`}
                      style={!s.done ? { borderColor: "var(--border)", color: "var(--text-secondary)" } : {}}
                    >
                      {s.done ? "✓" : i + 1}
                    </div>
                    {i < result.steps.length - 1 && (
                      <div className="w-px flex-1 min-h-6" style={{ background: "var(--border)" }} />
                    )}
                  </div>
                  <div className={`text-sm pt-1.5 ${s.done ? "font-bold" : ""}`} style={{ color: s.done ? "var(--text)" : "var(--text-secondary)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
