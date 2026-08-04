import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "./ProductCard";

/**
 * یک ردیف افقی از محصولات یک دسته‌بندی خاص، برای استفاده در هوم‌پیج.
 * اگر دسته‌بندی محصولی نداشته باشد چیزی رندر نمی‌شود.
 */
export default async function ProductRow({
  categorySlug,
  title,
  limit = 8,
}: {
  categorySlug: string;
  title: string;
  limit?: number;
}) {
  const products = await prisma.product.findMany({
    where: { category: { slug: categorySlug } },
    // اگر مدل Product شما فیلد دیگری برای "پرفروش‌ترین" دارد (مثلاً sales)
    // نام همان فیلد را اینجا جایگزین کنید.
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });

  if (products.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-sm text-red-500 hover:underline"
        >
          مشاهده همه ←
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
