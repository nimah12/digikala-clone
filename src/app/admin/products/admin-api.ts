import type {
  ColorItem,
  MediaItem,
  Product,
  ProductDetail,
  ReviewItem,
  SizeItem,
  TreeCategory,
  VendorItem,
} from "./types";

// وقتی پاسخ 401/403 است این پیام throw می‌شود تا صفحه وضعیت «denied» بگیرد
export const UNAUTHORIZED = "UNAUTHORIZED";

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem("dk-token") || "";
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(): HeadersInit {
  return { ...authHeaders(), "Content-Type": "application/json" };
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ---------- لیست و دسته‌ها ----------

export async function fetchProductList(
  category: string,
  search = "",
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("q", search);
  const res = await fetch(`/api/admin/products?${params}`, {
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) throw new Error(UNAUTHORIZED);
  const data = await res.json();
  return data.products || [];
}

export async function fetchCategoryTree(): Promise<TreeCategory[]> {
  const res = await fetch("/api/admin/categories", { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.tree || [];
}

// ---------- عکس اصلی محصول ----------

export async function uploadProductImage(
  productId: number,
  file: File,
): Promise<string> {
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
    headers: jsonHeaders(),
    body: JSON.stringify({ imageUrl: url }),
  });
  if (!patchRes.ok) throw new Error("ذخیره‌ی عکس ناموفق بود");
  return url as string;
}

// ---------- گالری ----------

export async function fetchMedia(productId: number): Promise<MediaItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/media`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("خطا در دریافت گالری");
  const data = await res.json();
  return data.media || [];
}

export async function uploadProductMedia(
  productId: number,
  files: FileList,
): Promise<{ media: MediaItem[]; skipped: { name: string; reason: string }[] }> {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append("files", f));
  const res = await fetch(`/api/admin/products/${productId}/media`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("آپلود گالری ناموفق بود");
  return res.json();
}

export async function deleteMedia(productId: number, mediaId: number) {
  const res = await fetch(
    `/api/admin/products/${productId}/media?mediaId=${mediaId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("حذف ناموفق بود");
}

// ---------- رنگ‌ها ----------

export async function fetchColors(productId: number): Promise<ColorItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/colors`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("خطا در دریافت رنگ‌ها");
  const data = await res.json();
  return data.colors || [];
}

export async function addColor(
  productId: number,
  input: { name: string; hex: string; stock: number },
): Promise<ColorItem> {
  const res = await fetch(`/api/admin/products/${productId}/colors`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "افزودن رنگ ناموفق بود");
  return data.color as ColorItem;
}

export async function deleteColor(productId: number, colorId: number) {
  const res = await fetch(
    `/api/admin/products/${productId}/colors?colorId=${colorId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("حذف رنگ ناموفق بود");
}

// ---------- سایزها ----------

export async function fetchSizes(productId: number): Promise<SizeItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/sizes`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("خطا در دریافت سایزها");
  const data = await res.json();
  return data.sizes || [];
}

export async function addSize(
  productId: number,
  input: { name: string; stock: number },
): Promise<SizeItem> {
  const res = await fetch(`/api/admin/products/${productId}/sizes`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "افزودن سایز ناموفق بود");
  return data.size as SizeItem;
}

export async function deleteSize(productId: number, sizeId: number) {
  const res = await fetch(
    `/api/admin/products/${productId}/sizes?sizeId=${sizeId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("حذف سایز ناموفق بود");
}

// ---------- حذف محصول ----------

export async function deleteProduct(productId: number) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "حذف محصول ناموفق بود");
}

// ---------- ویرایش محصول ----------

export async function fetchProductDetail(
  productId: number,
): Promise<ProductDetail> {
  const res = await fetch(`/api/admin/products/${productId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات محصول");
  const data = await res.json();
  return data.product as ProductDetail;
}

export async function moveProduct(
  productId: number,
  input: { categorySlug: string; subcategorySlug: string | null },
) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "انتقال ناموفق بود");
}

export async function deleteProductImage(productId: number) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ imageUrl: null }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "حذف عکس ناموفق بود");
}

export async function saveProduct(
  productId: number,
  input: {
    name: string;
    slug?: string;
    description: string | null;
    originalPrice: number;
    stock: number;
    discountPercent: number;
    imageUrl?: string;
    categorySlug?: string;
    subcategorySlug?: string | null;
  },
) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "ذخیره‌ی تغییرات ناموفق بود");
}

// ---------- فروشنده‌ها ----------

export async function fetchVendors(productId: number): Promise<VendorItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/vendors`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return res.ok ? data.vendors || [] : [];
}

export async function updateVendorRating(
  productId: number,
  vendorId: number,
  rating: number,
): Promise<VendorItem> {
  const res = await fetch(`/api/admin/products/${productId}/vendors`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ vendorId, rating }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "ویرایش امتیاز ناموفق بود");
  return data.vendor as VendorItem;
}

export async function deleteVendor(productId: number, vendorId: number) {
  const res = await fetch(
    `/api/admin/products/${productId}/vendors?vendorId=${vendorId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("حذف فروشنده ناموفق بود");
}

// ---------- نظرات ----------

export async function fetchReviews(productId: number): Promise<ReviewItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/reviews`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return res.ok ? data.reviews || [] : [];
}

export async function saveReview(
  productId: number,
  reviewId: number,
  input: { title: string; text: string; rating: number },
): Promise<ReviewItem> {
  const res = await fetch(`/api/admin/products/${productId}/reviews`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ reviewId, ...input }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "ذخیره‌ی نظر ناموفق بود");
  return data.review as ReviewItem;
}

export async function deleteReview(productId: number, reviewId: number) {
  const res = await fetch(
    `/api/admin/products/${productId}/reviews?reviewId=${reviewId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("حذف نظر ناموفق بود");
}

export { errorMessage };

