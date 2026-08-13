"use client";

import { useEffect, useState } from "react";
import { deleteReview, errorMessage, fetchReviews, saveReview } from "./admin-api";
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
        <p style={{ fontSize: 13, color: "#888" }}>نظری برای این محصول ثبت نشده.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              {editingId === r.id ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                  />
                  <textarea
                    value={editForm.text}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, text: e.target.value }))
                    }
                    rows={2}
                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                  />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editForm.rating}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, rating: e.target.value }))
                      }
                      style={{ width: 60, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc" }}
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
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <strong>{r.author}</strong>
                    <span style={{ color: "#888" }}>
                      امتیاز: {r.rating.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
                  <p style={{ color: "#555", marginBottom: 6 }}>{r.text}</p>
                  <div style={{ display: "flex", gap: 10 }}>
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
