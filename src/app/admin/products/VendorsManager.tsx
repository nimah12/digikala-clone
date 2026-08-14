"use client";

import { useEffect, useState } from "react";
import { deleteVendor, errorMessage, fetchVendors, updateVendorRating } from "./admin-api";
import type { VendorItem } from "./types";

export default function VendorsManager({ productId }: { productId: number }) {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchVendors(productId)
      .then((v) => {
        if (!cancelled) setVendors(v);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "خطای نامشخص"));
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleUpdateRating(vendorId: number, rating: number) {
    setError("");
    setSavingId(vendorId);
    try {
      const updated = await updateVendorRating(productId, vendorId, rating);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, rating: updated.rating } : v)),
      );
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(vendorId: number) {
    setError("");
    try {
      await deleteVendor(productId, vendorId);
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        فروشنده‌ها
      </h3>
      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 8 }}>
          {error}
        </p>
      )}
      {vendors.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>فروشنده‌ای برای این محصول ثبت نشده.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {vendors.map((v) => (
            <div
              key={v.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 13,
                flexWrap: "wrap",
              }}
            >
              <span style={{ minWidth: 100 }}>{v.name}</span>
              <span style={{ color: "var(--text-muted)" }}>{v.city}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                امتیاز:
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  defaultValue={v.rating}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (Number.isFinite(val) && val !== v.rating) {
                      handleUpdateRating(v.id, val);
                    }
                  }}
                  disabled={savingId === v.id}
                  style={{ width: 60, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)" }}
                />
              </label>
              {savingId === v.id && (
                <span style={{ color: "var(--text-secondary)" }}>در حال ذخیره...</span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                style={{
                  marginRight: "auto",
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
