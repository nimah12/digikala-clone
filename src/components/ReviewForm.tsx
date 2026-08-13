"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserSync } from "@/lib/user";

function StarButton({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-transform hover:scale-125"
      aria-label={`${value} ستاره`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill={active ? "#f9a825" : "none"}
        stroke="#f9a825"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 2l2.9 6.26 6.85.83-5.06 4.68 1.33 6.77L12 17.2 5.98 20.54l1.33-6.77L2.25 9.09l6.85-.83L12 2z" />
      </svg>
    </button>
  );
}

type CheckState =
  | { status: "checking" }
  | { status: "denied"; reason: string }
  | { status: "ready" };

export default function ReviewForm({ productId }: { productId: number }) {
  const user = useUserSync();
  const router = useRouter();
  const [check, setCheck] = useState<CheckState>({ status: "checking" });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // بررسی می‌کند که کاربرِ واردشده خریدارِ این محصول با سفارش تحویل‌شده است یا نه
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheck({ status: "denied", reason: "not-logged-in" });
      return;
    }
    let cancelled = false;
    const token = localStorage.getItem("dk-token") || "";
    fetch(`/api/reviews?productId=${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.success || !data.canReview) {
          setCheck({ status: "denied", reason: data?.reason || "not-purchased" });
          return;
        }
        setCheck({ status: "ready" });
      })
      .catch(() => {
        if (!cancelled) setCheck({ status: "denied", reason: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [user, productId]);

  if (!user) {
    return (
      <div
        className="mt-6 p-4 rounded-xl border text-sm text-center"
        style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      >
        برای ثبت دیدگاه{" "}
        <Link href="/login" className="font-bold text-dk-red hover:underline">
          وارد حساب کاربری
        </Link>{" "}
        شوید.
      </div>
    );
  }

  if (check.status === "checking") {
    return null;
  }

  if (check.status === "denied") {
    const messages: Record<string, string> = {
      "not-logged-in": "برای ثبت دیدگاه وارد حساب کاربری شوید.",
      "not-purchased": "فقط خریداران این محصول می‌توانند دیدگاه ثبت کنند.",
      "not-delivered":
        "دیدگاه شما پس از تحویل سفارش این محصول فعال می‌شود.",
      "already-reviewed": "شما قبلاً برای این محصول دیدگاه ثبت کرده‌اید.",
      error: "بررسی دسترسی شما با خطا مواجه شد.",
    };
    return (
      <div
        className="mt-6 p-4 rounded-xl border text-sm text-center"
        style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      >
        {messages[check.reason] || messages["not-purchased"]}
      </div>
    );
  }

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.error || "ثبت دیدگاه با خطا مواجه شد.");
        return;
      }
      setDone(true);
      // صفحه‌ی محصول را رفرش کن تا دیدگاه جدید و امتیاز به‌روز دیده شود
      router.refresh();
    } catch {
      setError("خطا در اتصال به سرور.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 p-4 rounded-xl text-center" style={{ background: "rgba(42,181,125,0.08)" }}>
        <p className="text-sm font-bold" style={{ color: "#2ab57d" }}>
          دیدگاه شما ثبت شد، ممنون! ✓
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          نظر شما در همین بخش نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-xl border p-4 md:p-5"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-extrabold">ثبت دیدگاه شما</h3>
        <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          شما این محصول را خریده‌اید — امتیاز بدهید و نظرتان را بنویسید
        </span>
      </div>
      <div className="flex items-center gap-1 mb-3" dir="rtl">
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
        placeholder="نظر خود را درباره کیفیت محصول بنویسید..."
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
        style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
      />
      {error && (
        <div
          className="mt-3 p-3 rounded-lg text-xs"
          style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}
        >
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
