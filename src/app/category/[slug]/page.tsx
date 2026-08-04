import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category ? category.name : "دسته‌بندی یافت نشد" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { products: { include: { category: true } } },
  });

  if (!category) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        {category.name}{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({category.products.length.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>
      {category.products.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
          هنوز کالایی در این دسته‌بندی ثبت نشده است.
        </p>
      ) : (
        <div className="scroll-row flex gap-3">
          {category.products.map((product) => (
            <div key={product.id} className="w-44 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
