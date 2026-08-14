"use client";

import { useEffect, useState } from "react";
import { addColor, deleteColor, errorMessage, fetchColors } from "./admin-api";
import type { ColorItem } from "./types";

export default function ColorManager({ productId }: { productId: number }) {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
  const [stock, setStock] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchColors(productId)
      .then((c) => {
        if (!cancelled) setColors(c);
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
      setError("اسم رنگ رو وارد کن");
      return;
    }
    setSaving(true);
    try {
      const color = await addColor(productId, { name: name.trim(), hex, stock });
      setColors((prev) => [...prev, color]);
      setName("");
      setHex("#000000");
      setStock(0);
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(colorId: number) {
    setError("");
    try {
      await deleteColor(productId, colorId);
      setColors((prev) => prev.filter((c) => c.id !== colorId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px dashed #ddd",
      }}
    >
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
          placeholder="اسم رنگ (مثلاً مشکی)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            fontSize: 13,
            width: 160,
          }}
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          style={{ width: 40, height: 32, padding: 0, border: "1px solid var(--border)", borderRadius: 6 }}
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
            border: "1px solid var(--border)",
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
          {saving ? "در حال افزودن..." : "افزودن رنگ"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>در حال بارگذاری رنگ‌ها...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {colors.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>هنوز رنگی اضافه نشده.</p>
          )}
          {colors.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: c.hex,
                  border: "1px solid var(--border)",
                  display: "inline-block",
                }}
              />
              <span>{c.name}</span>
              <span style={{ color: "var(--text-muted)" }}>
                (موجودی: {c.stock.toLocaleString("fa-IR")})
              </span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
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
