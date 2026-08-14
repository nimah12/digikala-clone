"use client";

import { useEffect, useState } from "react";
import {
  authHeaders,
  deleteProduct,
  deleteProductImage,
  errorMessage,
  fetchCategoryTree,
  fetchProductList,
  uploadProductImage,
} from "./admin-api";
import { flattenCategoryTree } from "./category-tree";
import type { CategoryOption, MoveResult, Product, TreeCategory } from "./types";
import ProductListRow from "./ProductListRow";

export default function AdminProductsPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">(
    "loading",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [catTree, setCatTree] = useState<TreeCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  // متن آزاد در باکس جستجو — فقط با Enter یا دکمه‌ی جستجو اعمال می‌شود
  const [searchInput, setSearchInput] = useState("");
  // عبارت تأییدشده‌ی جستجو
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // پنل‌های باز
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [colorPanelId, setColorPanelId] = useState<number | null>(null);
  const [editPanelId, setEditPanelId] = useState<number | null>(null);
  const [movePanelId, setMovePanelId] = useState<number | null>(null);
  const [moveSuccess, setMoveSuccess] = useState<MoveResult | null>(null);

  async function loadProducts(category: string, search = "") {
    try {
      const list = await fetchProductList(category, search);
      setProducts(list);
      setStatus("ready");
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        setStatus("denied");
        return;
      }
      setError("خطا در دریافت لیست محصولات");
      setStatus("ready");
    }
  }

  async function loadCategories(): Promise<CategoryOption[]> {
    try {
      const tree = await fetchCategoryTree();
      setCatTree(tree);
      const flat = flattenCategoryTree(tree);
      setCategoryOptions(flat);
      return flat;
    } catch {
      return [];
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    fetch("/api/admin/me", { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) {
        setStatus("denied");
        return;
      }
      const options = await loadCategories();
      const initial = options[0]?.value;
      if (initial) {
        setCategoryFilter(initial);
        await loadProducts(initial);
      } else {
        setStatus("ready");
      }
    });
  }, []);

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    if (searchQuery.trim()) return;
    setStatus("loading");
    loadProducts(value);
  }

  function runSearch(term: string) {
    const t = term.trim();
    setSearchQuery(t);
    setStatus("loading");
    // جستجو همیشه روی همه‌ی محصولات انجام می‌شود (مثل قبل)
    loadProducts(t ? "" : categoryFilter, t);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchQuery("");
    setStatus("loading");
    loadProducts(categoryFilter);
  }

  async function handleFileChange(productId: number, file: File) {
    setError("");
    setUploadingId(productId);
    try {
      const url = await uploadProductImage(productId, file);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, imageUrl: url } : p)),
      );
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDeleteImage(productId: number) {
    if (!confirm("مطمئنی می‌خوای عکس اصلی این محصول رو حذف کنی؟")) {
      return;
    }
    setError("");
    setDeletingImageId(productId);
    try {
      await deleteProductImage(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, imageUrl: null } : p)),
      );
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleDeleteProduct(productId: number) {
    if (!confirm("مطمئنی می‌خوای این محصول رو کامل حذف کنی؟ این کار قابل بازگشت نیست.")) {
      return;
    }
    setError("");
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setDeletingId(null);
    }
  }

  function handleEditSaved() {
    setEditPanelId(null);
    const term = searchQuery.trim();
    loadProducts(term ? "" : categoryFilter, term);
  }

  function handleMoved(result: MoveResult) {
    setMoveSuccess(result);
    setMovePanelId(null);
    const term = searchQuery.trim();
    loadProducts(term ? "" : categoryFilter, term);
  }

  if (status === "loading") {
    return <div style={{ padding: 24 }}>در حال بررسی دسترسی...</div>;
  }

  if (status === "denied") {
    return (
      <div style={{ padding: 24 }}>
        <p>دسترسی نداری. باید با یه حساب ادمین وارد شده باشی.</p>
        <a href="/login">رفتن به صفحه‌ی ورود</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }} dir="rtl">
      <h1 style={{ marginBottom: 16, fontSize: 22, fontWeight: 700 }}>
        پنل مدیریت محصولات
      </h1>

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{ position: "relative", flex: 1, minWidth: 220, display: "flex", gap: 8 }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجوی محصول (اسم یا slug) — Enter بزن"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              background: "#23254e",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            جستجو
          </button>
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
              title="پاک کردن جستجو"
            >
              ×
            </button>
          )}
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{ padding: 8, borderRadius: 6 }}
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <a
          href="/admin/categories"
          style={{
            fontSize: 13,
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            background: "#23254e",
            color: "#fff",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + افزودن محصول جدید
        </a>
      </div>

      {error && <p style={{ color: "#c0392b", marginBottom: 12 }}>{error}</p>}

      {moveSuccess && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 14px",
            borderRadius: 8,
            background: "color-mix(in srgb, #66bb6a 15%, var(--panel))",
            border: "1px solid #66bb6a",
            color: "var(--text)",
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <span>
            محصول «{moveSuccess.productName}» با موفقیت منتقل شد.
          </span>
          <a
            href={`/category/${moveSuccess.categorySlug}${
              moveSuccess.subcategorySlug
                ? `/${moveSuccess.subcategorySlug}`
                : ""
            }`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--text)", fontWeight: 700 }}
          >
            مشاهده در دسته مقصد
          </a>
          <button
            type="button"
            onClick={() => setMoveSuccess(null)}
            aria-label="بستن پیام"
            style={{
              marginRight: "auto",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {searchQuery.trim() && (
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
          نتایج جستجو در همه محصولات برای «{searchQuery.trim()}» — {products.length}{" "}
          محصول
        </p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {products.length === 0 && (
          <p>
            {searchQuery.trim()
              ? "محصولی با این عبارت پیدا نشد."
              : "محصولی توی این دسته پیدا نشد."}
          </p>
        )}
        {products.map((product) => (
          <ProductListRow
            key={product.id}
            product={product}
            categoryOptions={categoryOptions}
            catTree={catTree}
            uploading={uploadingId === product.id}
            deleting={deletingId === product.id}
            deletingImage={deletingImageId === product.id}
            galleryOpen={expandedId === product.id}
            colorOpen={colorPanelId === product.id}
            editOpen={editPanelId === product.id}
            moveOpen={movePanelId === product.id}
            onUploadImage={(file) => handleFileChange(product.id, file)}
            onDeleteImage={() => handleDeleteImage(product.id)}
            onDelete={() => handleDeleteProduct(product.id)}
            onToggleGallery={() =>
              setExpandedId((prev) => (prev === product.id ? null : product.id))
            }
            onToggleColor={() =>
              setColorPanelId((prev) => (prev === product.id ? null : product.id))
            }
            onToggleEdit={() =>
              setEditPanelId((prev) => (prev === product.id ? null : product.id))
            }
            onToggleMove={() =>
              setMovePanelId((prev) => (prev === product.id ? null : product.id))
            }
            onEditSaved={handleEditSaved}
            onMoved={handleMoved}
          />
        ))}
      </div>
    </div>
  );
}
