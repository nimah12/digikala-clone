import { prisma } from "@/lib/prisma";
import type { ProductWithCategory } from "@/components/ProductCard";
import { faNormalize } from "@/lib/normalize";

export { faNormalize };

// امتیاز ربط: نام محصول مهم‌ترین، سپس دسته، سپس توضیحات (فقط برای عبارت‌های بلند)
function scoreProduct(p: ProductWithCategory, qn: string): number {
  const N = faNormalize(p.name);
  const C = faNormalize(p.category.name);
  const CS = faNormalize(p.category.slug);
  const S = faNormalize(p.slug);
  const D = faNormalize(p.description || "");
  const tokens = qn.split(" ").filter(Boolean);

  if (N === qn) return 100;
  if (N.startsWith(qn)) return 90;
  if (N.includes(qn)) return 80;
  if (tokens.every((t) => N.includes(t))) return 75;
  if (C === qn) return 70;
  if (CS === qn) return 70;
  if (C.includes(qn)) return 65;
  if (CS.includes(qn)) return 62;
  if (tokens.every((t) => N.includes(t) || C.includes(t) || CS.includes(t))) return 60;
  if (S.includes(qn)) return 55;
  // جستجوی توضیحات فقط برای عبارت‌های حداقل ۳ حرف تا نتایج نامربوط نیایند
  if (qn.length >= 3 && D.includes(qn)) return 30;
  return 0;
}

export type SortOption = "relevance" | "newest" | "sales" | "rating" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "مرتبط‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "sales", label: "پرفروش‌ترین" },
  { value: "rating", label: "محبوب‌ترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
];

export type SearchOptions = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
};

// مرتب‌سازی بر اساس انتخاب کاربر؛ حالت «relevance» در تابع اصلی و جدا از امتیاز ربط اعمال می‌شود
function applySort(products: ProductWithCategory[], sort: SortOption): void {
  switch (sort) {
    case "newest":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "sales":
      products.sort((a, b) => b.salesCount - a.salesCount);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
      break;
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    default:
      break;
  }
}

export async function searchProducts(
  q: string,
  take = 50,
  options: SearchOptions = {},
): Promise<ProductWithCategory[]> {
  const qn = faNormalize(q);
  const { categorySlug, minPrice, maxPrice, sort } = options;

  let products = await prisma.product.findMany({
    include: { category: true },
  });

  if (categorySlug) {
    products = products.filter((p) => p.category.slug === categorySlug);
  }
  if (minPrice != null) {
    products = products.filter((p) => p.price >= minPrice);
  }
  if (maxPrice != null) {
    products = products.filter((p) => p.price <= maxPrice);
  }

  if (qn) {
    const scored = products.filter((p) => scoreProduct(p, qn) > 0);
    if (!sort || sort === "relevance") {
      scored.sort((a, b) => scoreProduct(b, qn) - scoreProduct(a, qn) || b.salesCount - a.salesCount);
    } else {
      applySort(scored, sort);
    }
    return scored.slice(0, take);
  }

  if (sort) {
    applySort(products, sort);
  } else {
    products.sort((a, b) => b.salesCount - a.salesCount);
  }
  return products.slice(0, take);
}
