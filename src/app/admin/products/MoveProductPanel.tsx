"use client";

import { useEffect, useState } from "react";
import { authHeaders, errorMessage, moveProduct } from "./admin-api";
import { findTreeCategory } from "./category-tree";
import type { CategoryOption, MoveResult, TreeCategory } from "./types";

type Props = {
  productId: number;
  productName: string;
  currentCategorySlug: string | null;
  currentSubcategorySlug: string | null;
  categoryOptions: CategoryOption[];
  catTree: TreeCategory[];
  onMoved: (result: MoveResult) => void;
  onClose: () => void;
};

export default function MoveProductPanel({
  productId,
  productName,
  currentCategorySlug,
  currentSubcategorySlug,
  categoryOptions,
  catTree,
  onMoved,
  onClose,
}: Props) {
  const [categorySlug, setCategorySlug] = useState(currentCategorySlug ?? "");
  const [subcategorySlug, setSubcategorySlug] = useState(
    currentSubcategorySlug ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // بررسی تکراری بودن نام در مقصد
  const [checking, setChecking] = useState(false);
  const [duplicate, setDuplicate] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // ساب‌دسته‌های واقعیِ دسته‌ی انتخاب‌شده (همان فیلتر هوشمندِ پنل ویرایش)
  const subs = findTreeCategory(catTree, categorySlug)?.subs ?? [];

  useEffect(() => {
    if (!categorySlug) return;
    let cancelled = false;
    // نمایش فوری حالت «در حال بررسی» هنگام تغییر مقصد
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(true);
    const params = new URLSearchParams({ category: categorySlug });
    if (subcategorySlug) params.set("subcategory", subcategorySlug);
    fetch(`/api/admin/products?${params}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const match = (data.products || []).find(
          (p: { id: number; name: string }) =>
            p.id !== productId &&
            p.name.trim().toLowerCase() === productName.trim().toLowerCase(),
        );
        setDuplicate(match ? { id: match.id, name: match.name } : null);
      })
      .catch(() => {
        if (!cancelled) setDuplicate(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug, subcategorySlug, productId, productName]);

  async function handleMove() {
    setError("");
    if (!categorySlug) {
      setError("دسته رو انتخاب کن");
      return;
    }
    setSaving(true);
    try {
      await moveProduct(productId, {
        categorySlug,
        subcategorySlug: subcategorySlug || null,
      });
      onMoved({
        productName,
        categorySlug,
        subcategorySlug: subcategorySlug || null,
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSaving(false);
    }
  }

  const selectStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--panel)",
    color: "var(--text)",
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #ddd" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        انتقال به دسته دیگر
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={categorySlug}
          onChange={(e) => {
            setCategorySlug(e.target.value);
            setSubcategorySlug("");
          }}
          style={selectStyle}
        >
          <option value="">انتخاب دسته</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={subcategorySlug}
          onChange={(e) => setSubcategorySlug(e.target.value)}
          style={selectStyle}
        >
          <option value="">بدون ساب‌دسته</option>
          {subs.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleMove}
          disabled={saving}
          style={{
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#23254e",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {saving ? "در حال انتقال..." : "انتقال"}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 13,
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          انصراف
        </button>
      </div>

      {/* باکس پیش‌نمایش مقصد */}
      {categorySlug && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            border: duplicate
              ? "1px solid #e6a23c"
              : "1px solid #e0e0e0",
            background: duplicate
              ? "color-mix(in srgb, #f9a825 14%, var(--panel))"
              : checking
                ? "var(--bg)"
                : "var(--bg)",
            color: duplicate ? "var(--text)" : "var(--text-secondary)",
          }}
        >
          {checking ? (
            <span>در حال بررسی نام محصول در دسته مقصد...</span>
          ) : duplicate ? (
            <span>
              ⚠️ محصولی با همین نام قبلاً در دسته مقصد وجود دارد: «
              {duplicate.name}»
            </span>
          ) : (
            <span>
              ✓ محصولی با همین نام در دسته مقصد وجود ندارد — امن برای انتقال.
            </span>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}
