"use client";

import { useEffect, useState } from "react";
import { deleteReview, errorMessage, fetchReviews, saveReview, setReviewApproved } from "./admin-api";
import type { ReviewItem } from "./types";

export default function ReviewsManager({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", text: "", rating: "" });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchReviews(productId)
      .then((r) => {
        if (!cancelled) setReviews(r);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "خطای نامشخص"));
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function startEdit(review: ReviewItem) {
    setEditingId(review.id);
    setEditForm({
      title: review.title,
      text: review.text,
      rating: String(review.rating),
    });
  }

  async function handleSave(reviewId: number) {
    setError("");
    const rating = Number(editForm.rating);
    if (!editForm.title.trim() || !editForm.text.trim()) {
      setError("عنوان و متن نظر نباید خالی باشن");
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("امتیاز باید عددی بین ۱ تا ۵ باشه");
      return;
    }

    setSavingId(reviewId);
    try {
      const updated = await saveReview(productId, reviewId, {
        title: editForm.title.trim(),
        text: editForm.text.trim(),
        rating,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? updated : r)),
      );
      setEditingId(null);
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(reviewId: number) {
    setError("");
    try {
      await deleteReview(productId, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  async function handleToggleApproved(review: ReviewItem) {
    setError("");
    const next = !review.approved;
    try {
      const updated = await setReviewApproved(productId, review.id, next);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? updated : r)),
      );
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        نظرات کاربران
      </h3>
      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 8 }}>
          {error}
        </p>
      )}
      {reviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>نظری برای این محصول ثبت نشده.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              {editingId === r.id ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <input
                    id={`review-title-${r.id}`}
                    name={`review-title-${r.id}`}
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)" }}
                  />
                  <textarea
                    id={`review-text-${r.id}`}
                    name={`review-text-${r.id}`}
                    value={editForm.text}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, text: e.target.value }))
                    }
                    rows={2}
                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)" }}
                  />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      id={`review-rating-${r.id}`}
                      name={`review-rating-${r.id}`}
                      type="number"
                      min={1}
                      max={5}
                      value={editForm.rating}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, rating: e.target.value }))
                      }
                      style={{ width: 60, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(r.id)}
                      disabled={savingId === r.id}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "#23254e",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {savingId === r.id ? "در حال ذخیره..." : "ذخیره"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "var(--panel)",
                        cursor: "pointer",
                      }}
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                 <div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                     <strong>{r.author}</strong>
                     <span style={{ color: "var(--text-muted)" }}>
                       امتیاز: {r.rating.toLocaleString("fa-IR")}
                     </span>
                     {r.approved ? (
                       <span
                         style={{
                           fontSize: 11,
                           color: "#2ab57d",
                           border: "1px solid #2ab57d",
                           borderRadius: 999,
                           padding: "1px 8px",
                         }}
                       >
                         تأییدشده
                       </span>
                     ) : (
                       <span
                         style={{
                           fontSize: 11,
                           color: "#c0392b",
                           border: "1px solid #c0392b",
                           borderRadius: 999,
                           padding: "1px 8px",
                         }}
                       >
                         در انتظار تأیید
                       </span>
                     )}
                   </div>
                   <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
                   <p style={{ color: "var(--text-secondary)", marginBottom: 6 }}>{r.text}</p>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                     {!r.approved && (
                       <button
                         type="button"
                         onClick={() => handleToggleApproved(r)}
                         style={{
                           background: "none",
                           border: "none",
                           color: "#2ab57d",
                           cursor: "pointer",
                           fontSize: 12,
                         }}
                       >
                         تأیید و نمایش
                       </button>
                     )}
                     {r.approved && (
                       <button
                         type="button"
                         onClick={() => handleToggleApproved(r)}
                         style={{
                           background: "none",
                           border: "none",
                           color: "#c0392b",
                           cursor: "pointer",
                           fontSize: 12,
                         }}
                       >
                         ردّ و پنهان‌سازی
                       </button>
                     )}
                     <button
                       type="button"
                       onClick={() => startEdit(r)}
                       style={{
                         background: "none",
                         border: "none",
                         color: "#23254e",
                         cursor: "pointer",
                         fontSize: 12,
                       }}
                     >
                       ویرایش
                     </button>
                     <button
                       type="button"
                       onClick={() => handleDelete(r.id)}
                       style={{
                         background: "none",
                         border: "none",
                         color: "#c0392b",
                         cursor: "pointer",
                         fontSize: 12,
                       }}
                     >
                       حذف
                     </button>
                   </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
