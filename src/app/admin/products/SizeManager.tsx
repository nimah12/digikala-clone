"use client";

import { useEffect, useState } from "react";
import { addSize, deleteSize, errorMessage, fetchSizes } from "./admin-api";
import type { SizeItem } from "./types";

export default function SizeManager({ productId }: { productId: number }) {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSizes(productId)
      .then((s) => {
        if (!cancelled) setSizes(s);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "خطای نامشخص"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleAdd() {
    setError("");
    if (!name.trim()) {
      setError("اسم سایز رو وارد کن (مثلاً S یا XL یا ۳۸)");
      return;
    }
    setSaving(true);
    try {
      const size = await addSize(productId, { name: name.trim(), stock });
      setSizes((prev) => [...prev, size]);
      setName("");
      setStock(0);
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(sizeId: number) {
    setError("");
    try {
      await deleteSize(productId, sizeId);
      setSizes((prev) => prev.filter((s) => s.id !== sizeId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        سایزها
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <input
          type="text"
          placeholder="اسم سایز (مثلاً S یا XL یا ۳۸)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
            width: 160,
          }}
        />
        <input
          type="number"
          min={0}
          placeholder="موجودی"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
            width: 90,
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          style={{
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            background: "#23254e",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {saving ? "در حال افزودن..." : "افزودن سایز"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "#888" }}>در حال بارگذاری سایزها...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {sizes.length === 0 && (
            <p style={{ fontSize: 13, color: "#888" }}>هنوز سایزی اضافه نشده.</p>
          )}
          {sizes.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #eee",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: "#888" }}>
                (موجودی: {s.stock.toLocaleString("fa-IR")})
              </span>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
