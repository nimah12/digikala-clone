import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SafeImg } from "@/components/SafeImage";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category ? category.name : "دسته‌بندی یافت نشد" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: { orderBy: { id: "asc" } },
      children: { orderBy: [{ order: "asc" }, { id: "asc" }] },
    },
  });

  if (!category) notFound();

  // همه‌ی محصولات دسته (خود ریشه + فرزندانش) برای نمایش کامل
  const products = await prisma.product.findMany({
    where: {
      OR: [{ categoryId: category.id }, { category: { parentId: category.id } }],
    },
    include: { category: true },
    orderBy: { id: "desc" },
  });

  // شاخه‌های نمایشی: مدل Subcategory + دسته‌های فرزند (مدیریت‌شده در ادمین)، بدون تکرار
  const subLinks: { name: string; slug: string; imageUrl: string | null }[] = [];
  const seen = new Set<string>();
  for (const s of category.subcategories) {
    if (!seen.has(s.name)) {
      seen.add(s.name);
      subLinks.push(s);
    }
  }
  for (const c of category.children) {
    if (!seen.has(c.name)) {
      seen.add(c.name);
      subLinks.push({ name: c.name, slug: c.slug, imageUrl: null });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        {category.name}{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({products.length.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>

      {subLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {subLinks.map((s) => (
            <Link
              key={s.slug}
              href={`/category/${category.slug}/${s.slug}`}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-colors hover:border-dk-red hover:text-dk-red"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {s.imageUrl && <SafeImg src={s.imageUrl} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />}
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
          هنوز کالایی در این دسته‌بندی ثبت نشده است.
        </p>
      ) : (
        <div className="scroll-row flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="w-44 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
