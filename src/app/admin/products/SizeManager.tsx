"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { addSize, deleteSize, errorMessage, fetchSizes } from "./admin-api";
import type { SizeItem } from "./types";

export default function SizeManager({ productId }: { productId: number }) {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);

  // افزودن بازه‌ای سایزهای عددی (مثلاً کفش: ۳۶ تا ۴۵)
  const [rangeFrom, setRangeFrom] = useState("36");
  const [rangeTo, setRangeTo] = useState("45");
  const [rangeStep, setRangeStep] = useState("1");
  const [rangeStock, setRangeStock] = useState("3");
  const [rangeSaving, setRangeSaving] = useState(false);

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

  // تولید سایزهای عددی از بازه (مثلاً ۳۶ تا ۴۵ با گام ۱) و ثبت همه
  async function handleAddRange() {
    setError("");
    const from = Number(rangeFrom);
    const to = Number(rangeTo);
    const step = Number(rangeStep);
    const stockVal = Number(rangeStock);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      setError("بازه‌ی سایز نامعتبره (از باید کوچک‌تر یا مساوی تا باشه)");
      return;
    }
    if (!Number.isFinite(step) || step <= 0) {
      setError("گام باید عددی مثبت باشه (مثلاً ۱ یا ۰٫۵)");
      return;
    }
    const names: string[] = [];
    for (let v = from; v <= to + 1e-9; v += step) {
      names.push(Number(v.toFixed(2)).toString());
      if (names.length > 60) break;
    }
    if (names.length === 0) {
      setError("هیچ سایزی در این بازه تولید نشد");
      return;
    }

    setRangeSaving(true);
    const added: SizeItem[] = [];
    try {
      for (const n of names) {
        const size = await addSize(productId, {
          name: n,
          stock: Number.isFinite(stockVal) ? Math.max(0, stockVal) : 0,
        });
        added.push(size);
      }
      setSizes((prev) => [...prev, ...added]);
      setRangeFrom("");
      setRangeTo("");
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
      // آنچه تا این‌جا اضافه شده را نشان بده
      if (added.length > 0) setSizes((prev) => [...prev, ...added]);
    } finally {
      setRangeSaving(false);
    }
  }

  const inputSmall: CSSProperties = {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    fontSize: 13,
    width: 70,
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        سایزها
      </h3>

      {/* افزودن بازه‌ای سایزهای عددی (کفش و ...) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 10,
          padding: 10,
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg)",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>سایز عددی از</span>
        <input
          id="size-range-from"
          name="size-range-from"
          type="number"
          step={0.5}
          value={rangeFrom}
          onChange={(e) => setRangeFrom(e.target.value)}
          style={inputSmall}
          aria-label="سایز شروع"
        />
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>تا</span>
        <input
          id="size-range-to"
          name="size-range-to"
          type="number"
          step={0.5}
          value={rangeTo}
          onChange={(e) => setRangeTo(e.target.value)}
          style={inputSmall}
          aria-label="سایز پایان"
        />
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>گام</span>
        <input
          id="size-range-step"
          name="size-range-step"
          type="number"
          step={0.5}
          min={0.5}
          value={rangeStep}
          onChange={(e) => setRangeStep(e.target.value)}
          style={{ ...inputSmall, width: 60 }}
          aria-label="گام"
        />
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>موجودی هر کدوم</span>
        <input
          id="size-range-stock"
          name="size-range-stock"
          type="number"
          min={0}
          value={rangeStock}
          onChange={(e) => setRangeStock(e.target.value)}
          style={{ ...inputSmall, width: 60 }}
          aria-label="موجودی هر سایز"
        />
        <button
          type="button"
          onClick={handleAddRange}
          disabled={rangeSaving}
          style={{
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #23254e",
            background: "var(--panel)",
            color: "#23254e",
            cursor: "pointer",
          }}
        >
          {rangeSaving ? "در حال افزودن..." : "افزودن بازه‌ای (۳۶ تا ۴۵)"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRangeFrom("36");
            setRangeTo("45");
            setRangeStep("1");
            setRangeStock("3");
          }}
          style={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            border: "none",
            background: "var(--hover)",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
          title="پیش‌فرض سایز کفش"
        >
          پیش‌فرض کفش
        </button>
      </div>

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
          id="size-name"
          name="size-name"
          type="text"
          placeholder="اسم سایز (مثلاً S یا XL یا ۳۸)"
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
          id="size-stock"
          name="size-stock"
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
          {saving ? "در حال افزودن..." : "افزودن سایز"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>در حال بارگذاری سایزها...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {sizes.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>هنوز سایزی اضافه نشده.</p>
          )}
          {sizes.map((s) => (
            <div
              key={s.id}
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
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: "var(--text-muted)" }}>
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
