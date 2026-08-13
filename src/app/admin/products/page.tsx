"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  salesCount: number;
  stock: number;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
};

type MediaItem = {
  id: number;
  productId: number;
  url: string;
  type: string; // "image" | "video"
  order: number;
};

type ColorItem = {
  id: number;
  productId: number;
  name: string;
  hex: string;
  stock: number;
  order: number;
};

type VendorItem = {
  id: number;
  productId: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  price: number;
  stock: number;
};

type ReviewItem = {
  id: number;
  productId: number;
  author: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  verified: boolean;
};

type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  discountPercent: number;
  imageUrl: string | null;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
};

type CategoryOption = { value: string; label: string };

type TreeCategory = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  children: TreeCategory[];
};

function flattenCategoryTree(
  nodes: TreeCategory[],
  depth = 0,
): CategoryOption[] {
  let out: CategoryOption[] = [];
  for (const n of nodes) {
    out.push({ value: n.slug, label: `${"— ".repeat(depth)}${n.name}` });
    out = out.concat(flattenCategoryTree(n.children, depth + 1));
  }
  return out;
}

function findTreeCategory(
  nodes: TreeCategory[],
  slug: string,
): TreeCategory | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const found = findTreeCategory(n.children, slug);
    if (found) return found;
  }
  return null;
}

export default function AdminProductsPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">(
    "loading",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // گالری چندعکسی/ویدیویی
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mediaByProduct, setMediaByProduct] = useState<
    Record<number, MediaItem[]>
  >({});
  const [galleryLoading, setGalleryLoading] = useState<number | null>(null);
  const [galleryUploading, setGalleryUploading] = useState<number | null>(
    null,
  );
  const [galleryError, setGalleryError] = useState("");

  // مدیریت رنگ‌ها
  const [colorPanelId, setColorPanelId] = useState<number | null>(null);
  const [colorsByProduct, setColorsByProduct] = useState<
    Record<number, ColorItem[]>
  >({});
  const [colorLoading, setColorLoading] = useState<number | null>(null);
  const [colorSaving, setColorSaving] = useState<number | null>(null);
  const [colorError, setColorError] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newColorStock, setNewColorStock] = useState(0);

  // افزودن/حذف محصول
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ویرایش محصول + فروشنده‌ها + نظرات
  const [editPanelId, setEditPanelId] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [catTree, setCatTree] = useState<TreeCategory[]>([]);
  const [editForm, setEditForm] = useState({
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

  const [vendorsByProduct, setVendorsByProduct] = useState<
    Record<number, VendorItem[]>
  >({});
  const [vendorSavingId, setVendorSavingId] = useState<number | null>(null);
  const [vendorError, setVendorError] = useState("");

  const [reviewsByProduct, setReviewsByProduct] = useState<
    Record<number, ReviewItem[]>
  >({});
  const [reviewEditingId, setReviewEditingId] = useState<number | null>(null);
  const [reviewEditForm, setReviewEditForm] = useState({
    title: "",
    text: "",
    rating: "",
  });
  const [reviewSavingId, setReviewSavingId] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState("");

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  async function loadProducts(category: string) {
    try {
      const res = await fetch(
        `/api/admin/products?category=${encodeURIComponent(category)}`,
        { headers: authHeaders() },
      );
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت لیست محصولات");
      setStatus("ready");
    }
  }

  async function loadCategories(): Promise<CategoryOption[]> {
    try {
      const res = await fetch("/api/admin/categories", { headers: authHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      const tree = data.tree || [];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setStatus("loading");
    loadProducts(value);
  }

  async function handleFileChange(productId: number, file: File) {
    setError("");
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("آپلود عکس ناموفق بود");
      const { url } = await uploadRes.json();

      const patchRes = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!patchRes.ok) throw new Error("ذخیره‌ی عکس ناموفق بود");

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, imageUrl: url } : p)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setUploadingId(null);
    }
  }

  async function toggleGallery(productId: number) {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(productId);
    setGalleryError("");
    if (!mediaByProduct[productId]) {
      setGalleryLoading(productId);
      try {
        const res = await fetch(`/api/admin/products/${productId}/media`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("خطا در دریافت گالری");
        const data = await res.json();
        setMediaByProduct((prev) => ({ ...prev, [productId]: data.media || [] }));
      } catch (err) {
        setGalleryError(err instanceof Error ? err.message : "خطای نامشخص");
      } finally {
        setGalleryLoading(null);
      }
    }
  }

  async function handleGalleryUpload(productId: number, files: FileList) {
    setGalleryError("");
    setGalleryUploading(productId);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch(`/api/admin/products/${productId}/media`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error("آپلود گالری ناموفق بود");
      const data = await res.json();

      setMediaByProduct((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), ...(data.media || [])],
      }));

      if (data.skipped && data.skipped.length > 0) {
        const names = data.skipped
          .map((s: { name: string; reason: string }) => `${s.name} (${s.reason})`)
          .join("، ");
        setGalleryError(`برخی فایل‌ها رد شدند: ${names}`);
      }
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setGalleryUploading(null);
    }
  }

  async function handleDeleteMedia(productId: number, mediaId: number) {
    setGalleryError("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/media?mediaId=${mediaId}`,
        { method: "DELETE", headers: authHeaders() },
      );
      if (!res.ok) throw new Error("حذف ناموفق بود");
      setMediaByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((m) => m.id !== mediaId),
      }));
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "خطای نامشخص");
    }
  }

  async function toggleColorPanel(productId: number) {
    if (colorPanelId === productId) {
      setColorPanelId(null);
      return;
    }
    setColorPanelId(productId);
    setColorError("");
    setNewColorName("");
    setNewColorHex("#000000");
    setNewColorStock(0);
    if (!colorsByProduct[productId]) {
      setColorLoading(productId);
      try {
        const res = await fetch(`/api/admin/products/${productId}/colors`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("خطا در دریافت رنگ‌ها");
        const data = await res.json();
        setColorsByProduct((prev) => ({ ...prev, [productId]: data.colors || [] }));
      } catch (err) {
        setColorError(err instanceof Error ? err.message : "خطای نامشخص");
      } finally {
        setColorLoading(null);
      }
    }
  }

  async function handleAddColor(productId: number) {
    setColorError("");
    if (!newColorName.trim()) {
      setColorError("اسم رنگ رو وارد کن");
      return;
    }
    setColorSaving(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/colors`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newColorName.trim(),
          hex: newColorHex,
          stock: newColorStock,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "افزودن رنگ ناموفق بود");

      setColorsByProduct((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), data.color],
      }));
      setNewColorName("");
      setNewColorHex("#000000");
      setNewColorStock(0);
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setColorSaving(null);
    }
  }

  async function handleDeleteColor(productId: number, colorId: number) {
    setColorError("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/colors?colorId=${colorId}`,
        { method: "DELETE", headers: authHeaders() },
      );
      if (!res.ok) throw new Error("حذف رنگ ناموفق بود");
      setColorsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((c) => c.id !== colorId),
      }));
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "خطای نامشخص");
    }
  }

  async function handleDeleteProduct(productId: number) {
    if (!confirm("مطمئنی می‌خوای این محصول رو کامل حذف کنی؟ این کار قابل بازگشت نیست.")) {
      return;
    }
    setError("");
    setDeletingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "حذف محصول ناموفق بود");

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleEditPanel(productId: number) {
    if (editPanelId === productId) {
      setEditPanelId(null);
      return;
    }
    setEditPanelId(productId);
    setEditError("");
    setVendorError("");
    setReviewError("");
    setEditLoading(productId);
    try {
      const [productRes, vendorsRes, reviewsRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}`, { headers: authHeaders() }),
        fetch(`/api/admin/products/${productId}/vendors`, { headers: authHeaders() }),
        fetch(`/api/admin/products/${productId}/reviews`, { headers: authHeaders() }),
      ]);
      if (!productRes.ok) throw new Error("خطا در دریافت اطلاعات محصول");
      const productData = await productRes.json();
      const product: ProductDetail = productData.product;
      const categorySlug = product.category?.slug ?? "";
      // قیمت اصلی: برای محصولات قدیمی از قیمت نهایی و ٪ تخفیف محاسبه می‌شود
      const originalPrice =
        product.originalPrice ??
        (product.discountPercent > 0 && product.discountPercent < 100
          ? Math.round((product.price * 100) / (100 - product.discountPercent))
          : product.price);
      setEditForm({
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

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendorsByProduct((prev) => ({ ...prev, [productId]: vendorsData.vendors || [] }));
      }
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviewsByProduct((prev) => ({ ...prev, [productId]: reviewsData.reviews || [] }));
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setEditLoading(null);
    }
  }

  async function handleSaveProductEdit(productId: number) {
    setEditError("");
    const price = Number(editForm.price);
    const stock = Number(editForm.stock);
    const discountPercent = Number(editForm.discountPercent);

    if (!editForm.name.trim()) {
      setEditError("اسم محصول رو وارد کن");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setEditError("قیمت نامعتبره");
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim() || undefined,
          description: editForm.description.trim() || null,
          originalPrice: price,
          stock: Number.isInteger(stock) ? stock : 0,
          discountPercent: Number.isInteger(discountPercent) ? discountPercent : 0,
          imageUrl: editForm.imageUrl.trim() || undefined,
          categorySlug: editForm.categorySlug || undefined,
          subcategorySlug: editForm.subcategorySlug || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ذخیره‌ی تغییرات ناموفق بود");

      setEditPanelId(null);
      await loadProducts(categoryFilter);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleUpdateVendorRating(productId: number, vendorId: number, rating: number) {
    setVendorError("");
    setVendorSavingId(vendorId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/vendors`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ویرایش امتیاز ناموفق بود");

      setVendorsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).map((v) =>
          v.id === vendorId ? { ...v, rating: data.vendor.rating } : v,
        ),
      }));
    } catch (err) {
      setVendorError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setVendorSavingId(null);
    }
  }

  async function handleDeleteVendor(productId: number, vendorId: number) {
    setVendorError("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/vendors?vendorId=${vendorId}`,
        { method: "DELETE", headers: authHeaders() },
      );
      if (!res.ok) throw new Error("حذف فروشنده ناموفق بود");
      setVendorsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((v) => v.id !== vendorId),
      }));
    } catch (err) {
      setVendorError(err instanceof Error ? err.message : "خطای نامشخص");
    }
  }

  function startEditReview(review: ReviewItem) {
    setReviewEditingId(review.id);
    setReviewEditForm({
      title: review.title,
      text: review.text,
      rating: String(review.rating),
    });
  }

  async function handleSaveReview(productId: number, reviewId: number) {
    setReviewError("");
    const rating = Number(reviewEditForm.rating);
    if (!reviewEditForm.title.trim() || !reviewEditForm.text.trim()) {
      setReviewError("عنوان و متن نظر نباید خالی باشن");
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError("امتیاز باید عددی بین ۱ تا ۵ باشه");
      return;
    }

    setReviewSavingId(reviewId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/reviews`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          title: reviewEditForm.title.trim(),
          text: reviewEditForm.text.trim(),
          rating,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ذخیره‌ی نظر ناموفق بود");

      setReviewsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).map((r) => (r.id === reviewId ? data.review : r)),
      }));
      setReviewEditingId(null);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setReviewSavingId(null);
    }
  }

  async function handleDeleteReview(productId: number, reviewId: number) {
    setReviewError("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/reviews?reviewId=${reviewId}`,
        { method: "DELETE", headers: authHeaders() },
      );
      if (!res.ok) throw new Error("حذف نظر ناموفق بود");
      setReviewsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((r) => r.id !== reviewId),
      }));
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "خطای نامشخص");
    }
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
        مدیریت عکس محصولات
      </h1>

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
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

      <div style={{ display: "grid", gap: 12 }}>
        {products.length === 0 && <p>محصولی توی این دسته پیدا نشد.</p>}
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: 80, height: 80, objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "#f2f2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#999",
                    borderRadius: 6,
                  }}
                >
                  بدون عکس
                </div>
              )}
              <div style={{ flex: 1 }}>
                <a
                  href={`/product/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginBottom: 6,
                    fontWeight: 700,
                    color: "#23254e",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  {product.name}
                </a>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                  {product.discountPercent > 0 && product.originalPrice ? (
                    <>
                      <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                        {product.originalPrice.toLocaleString("fa-IR")}
                      </span>{" "}
                      <span style={{ fontWeight: 700 }}>
                        {product.price.toLocaleString("fa-IR")} تومان
                      </span>{" "}
                      <span style={{ color: "#c0392b" }}>
                        (٪{product.discountPercent.toLocaleString("fa-IR")})
                      </span>
                    </>
                  ) : (
                    <>
                      {product.price.toLocaleString("fa-IR")} تومان
                      {product.discountPercent > 0
                        ? ` (٪${product.discountPercent.toLocaleString("fa-IR")})`
                        : ""}
                    </>
                  )}{" "}
                  • فروش: {product.salesCount.toLocaleString("fa-IR")} • موجودی:{" "}
                  {product.stock.toLocaleString("fa-IR")}
                  {product.subcategory ? ` • ${product.subcategory.name}` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingId === product.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(product.id, file);
                    }}
                  />
                  {uploadingId === product.id && (
                    <span style={{ fontSize: 13, color: "#555" }}>
                      در حال آپلود...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleGallery(product.id)}
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: expandedId === product.id ? "#eee" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {expandedId === product.id ? "بستن گالری" : "مدیریت گالری عکس/ویدیو"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleColorPanel(product.id)}
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: colorPanelId === product.id ? "#eee" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {colorPanelId === product.id ? "بستن رنگ‌ها" : "مدیریت رنگ‌ها"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEditPanel(product.id)}
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: editPanelId === product.id ? "#eee" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {editPanelId === product.id ? "بستن ویرایش" : "ویرایش محصول"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingId === product.id}
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #c0392b",
                      background: "#fff",
                      color: "#c0392b",
                      cursor: "pointer",
                    }}
                  >
                    {deletingId === product.id ? "در حال حذف..." : "حذف محصول"}
                  </button>
                </div>
              </div>
            </div>

            {expandedId === product.id && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px dashed #ddd",
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={galleryUploading === product.id}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleGalleryUpload(product.id, e.target.files);
                      }
                    }}
                  />
                  {galleryUploading === product.id && (
                    <span style={{ marginRight: 8, fontSize: 13, color: "#555" }}>
                      در حال آپلود گالری...
                    </span>
                  )}
                  <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                    می‌تونی چند عکس (حداکثر ۵ مگابایت هر کدام) و ویدیو (حداکثر ۱۰۰ مگابایت هر کدام) هم‌زمان انتخاب کنی.
                  </p>
                </div>

                {galleryError && (
                  <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
                    {galleryError}
                  </p>
                )}

                {galleryLoading === product.id ? (
                  <p style={{ fontSize: 13, color: "#888" }}>در حال بارگذاری گالری...</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {(mediaByProduct[product.id] || []).length === 0 && (
                      <p style={{ fontSize: 13, color: "#888" }}>هنوز رسانه‌ای اضافه نشده.</p>
                    )}
                    {(mediaByProduct[product.id] || []).map((m) => (
                      <div
                        key={m.id}
                        style={{
                          position: "relative",
                          border: "1px solid #eee",
                          borderRadius: 6,
                          overflow: "hidden",
                        }}
                      >
                        {m.type === "video" ? (
                          <video
                            src={m.url}
                            controls
                            style={{ width: "100%", height: 90, objectFit: "cover" }}
                          />
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            style={{ width: "100%", height: 90, objectFit: "cover" }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(product.id, m.id)}
                          style={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            background: "rgba(192,57,43,0.9)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 11,
                            padding: "2px 6px",
                            cursor: "pointer",
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {colorPanelId === product.id && (
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
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      fontSize: 13,
                      width: 160,
                    }}
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    style={{ width: 40, height: 32, padding: 0, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="موجودی"
                    value={newColorStock}
                    onChange={(e) => setNewColorStock(Number(e.target.value))}
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
                    onClick={() => handleAddColor(product.id)}
                    disabled={colorSaving === product.id}
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
                    {colorSaving === product.id ? "در حال افزودن..." : "افزودن رنگ"}
                  </button>
                </div>

                {colorError && (
                  <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
                    {colorError}
                  </p>
                )}

                {colorLoading === product.id ? (
                  <p style={{ fontSize: 13, color: "#888" }}>در حال بارگذاری رنگ‌ها...</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(colorsByProduct[product.id] || []).length === 0 && (
                      <p style={{ fontSize: 13, color: "#888" }}>هنوز رنگی اضافه نشده.</p>
                    )}
                    {(colorsByProduct[product.id] || []).map((c) => (
                      <div
                        key={c.id}
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
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: c.hex,
                            border: "1px solid #ccc",
                            display: "inline-block",
                          }}
                        />
                        <span>{c.name}</span>
                        <span style={{ color: "#888" }}>
                          (موجودی: {c.stock.toLocaleString("fa-IR")})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(product.id, c.id)}
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
            )}

            {editPanelId === product.id && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px dashed #ddd",
                }}
              >
                {editLoading === product.id ? (
                  <p style={{ fontSize: 13, color: "#888" }}>در حال بارگذاری...</p>
                ) : (
                  <>
                    {/* اطلاعات پایه */}
                    <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
                      <input
                        type="text"
                        placeholder="اسم محصول"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                      />
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="slug (فقط انگلیسی و خط تیره)"
                          value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                          style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="عکس (url)"
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
                          style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        />
                      </div>
                      <textarea
                        placeholder="توضیحات"
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        rows={3}
                        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                      />
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="number"
                          placeholder="قیمت اصلی (تومان)"
                          value={editForm.price}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                          style={{ width: 160, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        <input
                          type="number"
                          placeholder="موجودی"
                          value={editForm.stock}
                          onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                          style={{ width: 110, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        <input
                          type="number"
                          placeholder="٪ تخفیف"
                          value={editForm.discountPercent}
                          onChange={(e) => setEditForm((f) => ({ ...f, discountPercent: e.target.value }))}
                          style={{ width: 100, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        <select
                          value={editForm.categorySlug}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              categorySlug: e.target.value,
                              subcategorySlug: "",
                            }))
                          }
                          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        >
                          <option value="">انتخاب دسته</option>
                          {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editForm.subcategorySlug}
                          onChange={(e) => setEditForm((f) => ({ ...f, subcategorySlug: e.target.value }))}
                          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                        >
                          <option value="">بدون ساب‌دسته</option>
                          {(findTreeCategory(catTree, editForm.categorySlug)?.children ?? []).map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveProductEdit(product.id)}
                          disabled={editSaving}
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
                          {editSaving ? "در حال ذخیره..." : "ذخیره‌ی تغییرات"}
                        </button>
                      </div>
                      {editError && (
                        <p style={{ color: "#c0392b", fontSize: 13 }}>{editError}</p>
                      )}
                    </div>

                    {/* فروشنده‌ها و امتیاز */}
                    <div style={{ marginBottom: 18 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        فروشنده‌ها
                      </h3>
                      {vendorError && (
                        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 8 }}>
                          {vendorError}
                        </p>
                      )}
                      {(vendorsByProduct[product.id] || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: "#888" }}>فروشنده‌ای برای این محصول ثبت نشده.</p>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {(vendorsByProduct[product.id] || []).map((v) => (
                            <div
                              key={v.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                border: "1px solid #eee",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontSize: 13,
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ minWidth: 100 }}>{v.name}</span>
                              <span style={{ color: "#888" }}>{v.city}</span>
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
                                      handleUpdateVendorRating(product.id, v.id, val);
                                    }
                                  }}
                                  disabled={vendorSavingId === v.id}
                                  style={{ width: 60, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc" }}
                                />
                              </label>
                              {vendorSavingId === v.id && (
                                <span style={{ color: "#555" }}>در حال ذخیره...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteVendor(product.id, v.id)}
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

                    {/* نظرات کاربران */}
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        نظرات کاربران
                      </h3>
                      {reviewError && (
                        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 8 }}>
                          {reviewError}
                        </p>
                      )}
                      {(reviewsByProduct[product.id] || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: "#888" }}>نظری برای این محصول ثبت نشده.</p>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {(reviewsByProduct[product.id] || []).map((r) => (
                            <div
                              key={r.id}
                              style={{
                                border: "1px solid #eee",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 13,
                              }}
                            >
                              {reviewEditingId === r.id ? (
                                <div style={{ display: "grid", gap: 6 }}>
                                  <input
                                    type="text"
                                    value={reviewEditForm.title}
                                    onChange={(e) =>
                                      setReviewEditForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                                  />
                                  <textarea
                                    value={reviewEditForm.text}
                                    onChange={(e) =>
                                      setReviewEditForm((f) => ({ ...f, text: e.target.value }))
                                    }
                                    rows={2}
                                    style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                                  />
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input
                                      type="number"
                                      min={1}
                                      max={5}
                                      value={reviewEditForm.rating}
                                      onChange={(e) =>
                                        setReviewEditForm((f) => ({ ...f, rating: e.target.value }))
                                      }
                                      style={{ width: 60, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc" }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveReview(product.id, r.id)}
                                      disabled={reviewSavingId === r.id}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "#23254e",
                                        color: "#fff",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {reviewSavingId === r.id ? "در حال ذخیره..." : "ذخیره"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setReviewEditingId(null)}
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
                                      onClick={() => startEditReview(r)}
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
                                      onClick={() => handleDeleteReview(product.id, r.id)}
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
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
