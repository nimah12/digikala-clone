import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/AddToCartButton";
import PriceBadge from "@/components/PriceBadge";
import Rating from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import Vendors from "@/components/Vendors";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

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
    include: { category: true },
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

  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/" className="hover:text-dk-red">خانه</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-dk-red">
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
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden" style={{ background: "var(--bg)" }}>
            <Image
              src={product.imageUrl || "/images/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              {product.category.name}
            </div>
            <h1 className="text-xl font-extrabold leading-8 mb-2">{product.name}</h1>
            <Rating rating={product.rating} ratingCount={product.ratingCount} />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {product.salesCount.toLocaleString("fa-IR")} فروش موفق
            </p>

            {product.description && (
              <p className="mt-4 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                {product.description}
              </p>
            )}

            {/* Price + add to cart */}
            <div className="mt-auto pt-6">
              <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      inStock ? "bg-dk-green/10 text-dk-green" : "bg-dk-red/10 text-dk-red"
                    }`}
                  >
                    {inStock ? `موجود در انبار (${product.stock.toLocaleString("fa-IR")} عدد)` : "ناموجود"}
                  </span>
                  {product.discountPercent > 0 && (
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {product.discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                    </span>
                  )}
                </div>
                <PriceBadge price={product.price} discountPercent={product.discountPercent} />
              </div>
              <AddToCartButton productId={product.id} />
              <div className="mt-3 flex items-center gap-4 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <span>🚚 ارسال سریع به سراسر کشور</span>
                <span>✅ ضمانت اصالت کالا</span>
                <span>↩️ ۷ روز ضمانت بازگشت</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local vendors */}
      <Vendors productId={product.id} />

      {/* User reviews */}
      <Reviews productId={product.id} rating={product.rating} ratingCount={product.ratingCount} />

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
