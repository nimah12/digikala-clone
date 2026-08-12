"use client";

import { useState } from "react";

function StarButton({ value, active, onClick }: { value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-transform hover:scale-125"
      aria-label={`${value} ستاره`}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill={active ? "#f9a825" : "none"} stroke="#f9a825" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l2.9 6.26 6.85.83-5.06 4.68 1.33 6.77L12 17.2 5.98 20.54l1.33-6.77L2.25 9.09l6.85-.83L12 2z" />
      </svg>
    </button>
  );
}

export default function OrderRating({ orderId }: { orderId: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rated, setRated] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(localStorage.getItem(`dk-rated-${orderId}`) || 0);
    } catch {
      return 0;
    }
  });

  async function submit() {
    if (rating < 1) {
      setError("لطفاً ابتدا امتیاز بدهید.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("dk-token") || "";
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.error || "ثبت نظر با خطا مواجه شد.");
        return;
      }
      localStorage.setItem(`dk-rated-${orderId}`, String(rating));
      setRated(rating);
    } catch {
      setError("خطا در اتصال به سرور.");
    } finally {
      setSubmitting(false);
    }
  }

  if (rated > 0) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarButton key={n} value={n} active={n <= rated} onClick={() => {}} />
          ))}
        </div>
        <p className="text-sm font-bold" style={{ color: "var(--dk-green, #26a65b)" }}>
          امتیاز شما ثبت شد، ممنون!
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          دیدگاه شما در صفحه محصول هم نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-4" dir="rtl">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarButton key={n} value={n} active={n <= rating} onClick={() => setRating(n)} />
        ))}
        {rating > 0 && (
          <span className="mr-3 text-sm font-bold" style={{ color: "#f9a825" }}>
            {rating.toLocaleString("fa-IR")} از ۵
          </span>
        )}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="نظر خود را درباره کیفیت خرید و ارسال بنویسید..."
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
        style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
      />
      {error && (
        <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="mt-4 h-11 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "در حال ثبت..." : "ثبت امتیاز و دیدگاه"}
      </button>
    </div>
  );
}
