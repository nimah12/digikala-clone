"use client";

import { useEffect, useState } from "react";
import { errorMessage, fetchProductDetail, saveProduct } from "./admin-api";
import { findTreeCategory } from "./category-tree";
import type { CategoryOption, TreeCategory } from "./types";
import VendorsManager from "./VendorsManager";
import ReviewsManager from "./ReviewsManager";
import SizeManager from "./SizeManager";

type Props = {
  productId: number;
  categoryOptions: CategoryOption[];
  catTree: TreeCategory[];
  onSaved: () => void;
};

export default function ProductEditPanel({
  productId,
  categoryOptions,
  catTree,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "", // قیمت اصلی (قبل از تخفیف)
    stock: "",
    discountPercent: "",
    imageUrl: "",
    categorySlug: "",
    subcategorySlug: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetchProductDetail(productId)
      .then((product) => {
        if (cancelled) return;
        const categorySlug = product.category?.slug ?? "";
        // قیمت اصلی: برای محصولات قدیمی از قیمت نهایی و ٪ تخفیف محاسبه می‌شود
        const originalPrice =
          product.originalPrice ??
          (product.discountPercent > 0 && product.discountPercent < 100
            ? Math.round((product.price * 100) / (100 - product.discountPercent))
            : product.price);
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: String(originalPrice),
          stock: String(product.stock),
          discountPercent: String(product.discountPercent),
          imageUrl: product.imageUrl ?? "",
          categorySlug,
          subcategorySlug: product.subcategory?.slug ?? "",
        });
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

  async function handleSave() {
    setError("");
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discountPercent = Number(form.discountPercent);

    if (!form.name.trim()) {
      setError("اسم محصول رو وارد کن");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("قیمت نامعتبره");
      return;
    }

    setSaving(true);
    try {
      await saveProduct(productId, {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        originalPrice: price,
        stock: Number.isInteger(stock) ? stock : 0,
        discountPercent: Number.isInteger(discountPercent) ? discountPercent : 0,
        imageUrl: form.imageUrl.trim() || undefined,
        categorySlug: form.categorySlug || undefined,
        subcategorySlug: form.subcategorySlug || null,
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setSaving(false);
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
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>در حال بارگذاری...</p>
      ) : (
        <>
          {/* اطلاعات پایه */}
          <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
            <input
              id="product-name"
              name="product-name"
              type="text"
              placeholder="اسم محصول"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                id="product-slug"
                name="product-slug"
                type="text"
                dir="ltr"
                placeholder="slug (فقط انگلیسی و خط تیره)"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <input
                id="product-image"
                name="product-image"
                type="text"
                dir="ltr"
                placeholder="عکس (url)"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              />
            </div>
            <textarea
              id="product-description"
              name="product-description"
              placeholder="توضیحات"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                id="product-price"
                name="product-price"
                type="number"
                placeholder="قیمت اصلی (تومان)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                style={{ width: 160, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <input
                id="product-stock"
                name="product-stock"
                type="number"
                placeholder="موجودی"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                style={{ width: 110, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <input
                id="product-discount"
                name="product-discount"
                type="number"
                placeholder="٪ تخفیف"
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                style={{ width: 100, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <select
                value={form.categorySlug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categorySlug: e.target.value,
                    subcategorySlug: "",
                  }))
                }
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              >
                <option value="">انتخاب دسته</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={form.subcategorySlug}
                onChange={(e) => setForm((f) => ({ ...f, subcategorySlug: e.target.value }))}
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}
              >
                <option value="">بدون ساب‌دسته</option>
                {/* ساب‌دسته‌های واقعیِ همین دسته (مدل Subcategory) — فقط این‌ها
                    توسط API ذخیره پذیرفته می‌شوند و با صفحه‌ی فروشگاه هماهنگ‌اند */}
                {(findTreeCategory(catTree, form.categorySlug)?.subs ?? []).map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#23254e",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {saving ? "در حال ذخیره..." : "ذخیره‌ی تغییرات"}
              </button>
            </div>
            {error && (
              <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>
            )}
          </div>

          {/* سایزها */}
          <SizeManager productId={productId} />

          {/* فروشنده‌ها و امتیاز */}
          <VendorsManager productId={productId} />

          {/* نظرات کاربران */}
          <ReviewsManager productId={productId} />
        </>
      )}
    </div>
  );
}
