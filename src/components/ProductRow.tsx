import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "./ProductCard";

/**
 * یک ردیف افقی از محصولات یک دسته‌بندی خاص، برای استفاده در هوم‌پیج.
 * اگر دسته‌بندی محصولی نداشته باشد چیزی رندر نمی‌شود.
 */
export default async function ProductRow({
  categorySlug,
  categoryName,
  limit = 8,
}: {
  categorySlug: string;
  categoryName: string;
  limit?: number;
}) {
  const products = await prisma.product.findMany({
    where: { category: { slug: categorySlug } },
    include: { category: true },
    orderBy: { salesCount: "desc" },
    take: limit,
  });

  if (products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold">{categoryName}</h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-xs font-bold text-dk-red hover:underline"
        >
          مشاهده همه ←
        </Link>
      </div>
      <div className="scroll-row flex gap-3">
        {products.map((product) => (
          <div key={product.id} className="w-44 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
