import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ProductGallery";
import ProductInfoColumn from "@/components/ProductInfoColumn";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import Vendors from "@/components/Vendors";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      media: { orderBy: { order: "asc" } },
      colors: { orderBy: { order: "asc" } },
      sizes: { orderBy: { order: "asc" } },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      slug: { not: product.slug },
    },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        <Link href="/" className="hover:text-dk-red">
          خانه
        </Link>
        <span>/</span>
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-dk-red"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>{product.name}</span>
      </nav>

      {/* Main card */}
      <div
        className="rounded-2xl border p-4 md:p-6"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image gallery */}
          <ProductGallery
            mainImageUrl={product.imageUrl}
            media={product.media}
            productName={product.name}
          />

          {/* Info */}
          <ProductInfoColumn
            productId={product.id}
            categoryName={product.category.name}
            name={product.name}
            rating={product.rating}
            ratingCount={product.ratingCount}
            salesCount={product.salesCount}
            description={product.description}
            price={product.price}
            discountPercent={product.discountPercent}
            originalPrice={product.originalPrice}
            stock={product.stock}
            colors={product.colors}
            sizes={product.sizes}
          />
        </div>
      </div>

      {/* Local vendors */}
      <Vendors productId={product.id} />

      {/* User reviews */}
      <Reviews
        productId={product.id}
        rating={product.rating}
        ratingCount={product.ratingCount}
      />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold mb-4">محصولات مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
