import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchProducts, SORT_OPTIONS, type SortOption } from "@/lib/search";
import ProductCard, {
  type ProductWithCategory,
} from "@/components/ProductCard";
import Icon from "@/components/Icon";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    cat?: string | string[];
    min?: string | string[];
    max?: string | string[];
    sort?: string | string[];
  }>;
};

export const metadata: Metadata = { title: "جستجو" };

// نتایج جستجو بی‌نهایت حالت مختلف دارن (q/cat/min/max/sort)، پس ISR اینجا
// مناسب نیست: هر ترکیب جستجو یک write جدا مصرف می‌کرد. رندر معمولی (SSR) بهتره.
export const dynamic = "force-dynamic";

const getParam = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = getParam(params.q);
  const cat = getParam(params.cat);
  const sortRaw = getParam(params.sort);

  const minRaw = getParam(params.min);
  const maxRaw = getParam(params.max);
  const min = Number(minRaw);
  const max = Number(maxRaw);
  const minPrice =
    minRaw !== "" && Number.isInteger(min) && min >= 0 ? min : undefined;
  const maxPrice =
    maxRaw !== "" && Number.isInteger(max) && max >= 0 ? max : undefined;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const validCat =
    cat && categories.some((c) => c.slug === cat) ? cat : undefined;
  const sort = SORT_OPTIONS.some((s) => s.value === sortRaw)
    ? (sortRaw as SortOption)
    : undefined;

  const browsing = Boolean(q.trim()) || Boolean(validCat);
  const results: ProductWithCategory[] = browsing
    ? await searchProducts(q, 100, {
        categorySlug: validCat,
        minPrice,
        maxPrice,
        sort,
      })
    : [];

  const hasFilters =
    Boolean(validCat) || minPrice != null || maxPrice != null || sort != null;
  const clearHref = q.trim() ? `/search?q=${encodeURIComponent(q)}` : "/search";
  const categoryName = validCat
    ? categories.find((c) => c.slug === validCat)?.name
    : undefined;

  const title = q.trim()
    ? `نتایج جستجو برای «${q}»`
    : categoryName
      ? `محصولات دسته «${categoryName}»`
      : "جستجو";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        {title}
        {browsing && (
          <span
            className="text-sm font-normal"
            style={{ color: "var(--text-secondary)" }}
          >
            {" "}
            ({results.length.toLocaleString("fa-IR")} کالا)
          </span>
        )}
      </h1>

      {browsing && (
        <form
          action="/search"
          method="get"
          className="mb-6 rounded-xl border p-4"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <input type="hidden" name="q" value={q} />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <label
                className="flex flex-col gap-1.5 text-[11px] font-bold w-full sm:w-44"
                style={{ color: "var(--text-secondary)" }}
              >
                دسته‌بندی
                <select
                  name="cat"
                  defaultValue={validCat ?? ""}
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <option value="">همه دسته‌ها</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="flex flex-col gap-1.5 text-[11px] font-bold w-full sm:w-36"
                style={{ color: "var(--text-secondary)" }}
              >
                حداقل قیمت
                <input
                  type="number"
                  name="min"
                  min="0"
                  defaultValue={minPrice ?? ""}
                  placeholder="مثلاً ۵۰۰۰۰۰"
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </label>

              <label
                className="flex flex-col gap-1.5 text-[11px] font-bold w-full sm:w-36"
                style={{ color: "var(--text-secondary)" }}
              >
                حداکثر قیمت
                <input
                  type="number"
                  name="max"
                  min="0"
                  defaultValue={maxPrice ?? ""}
                  placeholder="مثلاً ۲۰۰۰۰۰۰۰"
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </label>

              <label
                className="flex flex-col gap-1.5 text-[11px] font-bold w-full sm:w-40"
                style={{ color: "var(--text-secondary)" }}
              >
                مرتب‌سازی
                <select
                  name="sort"
                  defaultValue={sort ?? "relevance"}
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2 lg:shrink-0">
              <button
                type="submit"
                className="h-10 flex-1 lg:flex-none px-5 rounded-lg bg-dk-red text-white text-sm font-bold hover:opacity-90 transition inline-flex items-center justify-center gap-2"
              >
                <Icon name="filter" size={16} />
                اعمال فیلتر
              </button>

              {hasFilters && (
                <Link
                  href={clearHref}
                  className="h-10 flex-1 lg:flex-none inline-flex items-center justify-center px-4 rounded-lg border text-sm font-bold transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  حذف فیلترها
                </Link>
              )}
            </div>
          </div>
        </form>
      )}

      {!browsing ? (
        <p
          className="text-sm py-16 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          عبارت مورد نظر خود را در جستجو وارد کنید یا از فیلترها استفاده کنید.
        </p>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 text-dk-red">
            <Icon name="search" size={44} />
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {q.trim()
              ? `کالایی با نام «${q}» پیدا نشد.`
              : "کالایی با این فیلترها پیدا نشد."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
