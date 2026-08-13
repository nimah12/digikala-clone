"use client";

import { useEffect, useRef, useState } from "react";
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
import type { CategoryOption, Product, TreeCategory } from "./types";
import ProductListRow from "./ProductListRow";

export default function AdminProductsPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">(
    "loading",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [catTree, setCatTree] = useState<TreeCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // پنل‌های باز
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [colorPanelId, setColorPanelId] = useState<number | null>(null);
  const [editPanelId, setEditPanelId] = useState<number | null>(null);

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

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const term = value.trim();
    searchTimer.current = setTimeout(() => {
      setStatus("loading");
      loadProducts(term ? "" : categoryFilter, term);
    }, 300);
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
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="جستجوی محصول (اسم یا slug)..."
            style={{
              width: "100%",
              padding: "8px 34px 8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                if (searchTimer.current) clearTimeout(searchTimer.current);
                setStatus("loading");
                loadProducts(categoryFilter);
              }}
              style={{
                position: "absolute",
                left: 6,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 14,
              }}
              title="پاک کردن جستجو"
              aria-label="پاک کردن جستجو"
            >
              ×
            </button>
          )}
        </div>
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

      {searchQuery.trim() && (
        <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
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
            onEditSaved={handleEditSaved}
          />
        ))}
      </div>
    </div>
  );
}
