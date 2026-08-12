import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard, { type ProductWithCategory } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; subslug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subslug } = await params;
  const sub = await prisma.subcategory.findUnique({ where: { slug: subslug } });
  const child = sub
    ? null
    : await prisma.category.findUnique({ where: { slug: subslug } });
  const name = sub?.name ?? child?.name;
  return { title: name ? `${name} | دیجی‌کلون` : "شاخه یافت نشد" };
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subslug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) notFound();

  // منبع اول: مدل Subcategory (همان شاخه‌های فروشگاه)
  const subcategory = await prisma.subcategory.findUnique({
    where: { slug: subslug },
    include: { products: { include: { category: true } } },
  });

  if (subcategory && subcategory.categoryId !== category.id) notFound();

  // منبع دوم: دسته‌ی فرزند (ساب‌دسته‌های ساخته‌شده در پنل ادمین)
  const child = subcategory
    ? null
    : await prisma.category.findUnique({
        where: { slug: subslug },
        include: { products: { include: { category: true } } },
      });

  if (!subcategory && (!child || child.parentId !== category.id)) notFound();

  // محصولات زیرمجموعه‌ی این ساب‌دسته:
  //  - محصولاتی که مستقیم به این شاخه وصل‌اند (categoryId = خودِ شاخه)
  //  - محصولات دسته‌ی ریشه که Subcategory هم‌نام دارند (برای داده‌های سیدشده)
  let products: ProductWithCategory[] = [];
  if (subcategory) {
    products = subcategory.products;
  } else if (child) {
    const childProducts: ProductWithCategory[] = child.products;
    const siblingProducts = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        OR: [
          { subcategory: { name: child.name } },
          { name: { contains: child.name } },
        ],
      },
      include: { category: true },
    });
    const byId = new Map<number, ProductWithCategory>();
    for (const p of childProducts) byId.set(p.id, p);
    for (const p of siblingProducts) if (!byId.has(p.id)) byId.set(p.id, p);
    products = Array.from(byId.values());
  }

  const name = subcategory?.name ?? child?.name ?? "";

  // شاخه‌های هم‌سطح (برای نوار فیلتر بالای صفحه)
  const categorySubs = await prisma.subcategory.findMany({
    where: { categoryId: category.id },
    orderBy: { id: "asc" },
    select: { slug: true, name: true },
  });
  const childSubs = await prisma.category.findMany({
    where: { parentId: category.id },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { slug: true, name: true },
  });
  const siblings: { slug: string; name: string }[] = [];
  const seen = new Set<string>();
  for (const s of categorySubs) {
    if (!seen.has(s.name)) {
      seen.add(s.name);
      siblings.push(s);
    }
  }
  for (const s of childSubs) {
    if (!seen.has(s.name)) {
      seen.add(s.name);
      siblings.push(s);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
        <Link href="/" className="hover:text-dk-red transition-colors">خانه</Link>
        <span>/</span>
        <Link href={`/category/${category.slug}`} className="hover:text-dk-red transition-colors">
          {category.name}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>{name}</span>
      </div>

      <h1 className="text-lg font-extrabold mb-4">
        {name}{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({products.length.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>

      {siblings.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {siblings.map((s) => {
            const active = s.slug === subslug;
            return (
              <Link
                key={s.slug}
                href={`/category/${category.slug}/${s.slug}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active ? "bg-dk-red text-white border-dk-red" : "hover:border-dk-red hover:text-dk-red"
                }`}
                style={{ borderColor: "var(--border)", color: active ? undefined : "var(--text-secondary)" }}
              >
                {s.name}
              </Link>
            );
          })}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
          هنوز کالایی در این شاخه ثبت نشده است.
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
